import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api';

interface FileUploadFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UploadFile {
  file: File;
  preview?: string;
}

interface FormData {
  displayName: string;
  description: string;
  gsFile: UploadFile | null;
  thumbnail: UploadFile | null;
}

interface FormErrors {
  displayName?: string;
  gsFile?: string;
  thumbnail?: string;
  general?: string;
}

export function FileUploadForm({ onSuccess, onError }: FileUploadFormProps) {
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    description: '',
    gsFile: null,
    thumbnail: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ファイル検証
  const validateGSFile = (file: File): string | null => {
    const allowedExtensions = ['splat', 'ply'];
    const extension = file.name.toLowerCase().split('.').pop();
    
    if (!extension || !allowedExtensions.includes(extension)) {
      return 'サポートされていないファイル形式です。.splatまたは.plyファイルのみ対応しています。';
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return 'ファイルサイズが大きすぎます。最大100MBまでです。';
    }

    return null;
  };

  const validateThumbnail = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return 'サポートされていない画像形式です。JPEG、PNG、WebPのみ対応しています。';
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return '画像サイズが大きすぎます。最大5MBまでです。';
    }

    return null;
  };

  // GSファイルドロップゾーン
  const onGSFileDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const error = validateGSFile(file);
    if (error) {
      setErrors(prev => ({ ...prev, gsFile: error }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      gsFile: { file },
      displayName: prev.displayName || file.name.replace(/\.[^/.]+$/, ''),
    }));
    setErrors(prev => ({ ...prev, gsFile: undefined }));
  }, []);

  // サムネイルドロップゾーン
  const onThumbnailDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const error = validateThumbnail(file);
    if (error) {
      setErrors(prev => ({ ...prev, thumbnail: error }));
      return;
    }

    const preview = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      thumbnail: { file, preview },
    }));
    setErrors(prev => ({ ...prev, thumbnail: undefined }));
  }, []);

  const gsFileDropzone = useDropzone({
    onDrop: onGSFileDrop,
    accept: {
      'application/octet-stream': ['.splat'],
      'application/ply': ['.ply'],
      'text/plain': ['.ply'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const thumbnailDropzone = useDropzone({
    onDrop: onThumbnailDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  // ファイル削除
  const removeGSFile = () => {
    setFormData(prev => ({ ...prev, gsFile: null }));
    setErrors(prev => ({ ...prev, gsFile: undefined }));
  };

  const removeThumbnail = () => {
    if (formData.thumbnail?.preview) {
      URL.revokeObjectURL(formData.thumbnail.preview);
    }
    setFormData(prev => ({ ...prev, thumbnail: null }));
    setErrors(prev => ({ ...prev, thumbnail: undefined }));
  };

  // フォーム検証
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = '表示名は必須です';
    }

    if (!formData.gsFile) {
      newErrors.gsFile = 'Gaussian Splattingファイルは必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', formData.gsFile!.file);
      formDataToSend.append('display_name', formData.displayName);
      formDataToSend.append('description', formData.description);

      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail.file);
      }

      // プログレス表示のシミュレーション
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await apiClient.post<{
        success: boolean;
        error?: string;
      }>('/admin/gs-files', formDataToSend);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        // フォームリセット
        setFormData({
          displayName: '',
          description: '',
          gsFile: null,
          thumbnail: null,
        });
        setUploadProgress(0);
        onSuccess?.();
      } else {
        throw new Error(response.error || 'アップロードに失敗しました');
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'アップロードに失敗しました',
      });
      onError?.(error instanceof Error ? error.message : 'アップロードに失敗しました');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ファイルアップロード</CardTitle>
        <CardDescription>
          Gaussian Splattingファイル（.splat、.ply）をアップロードしてください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* 表示名 */}
          <div className="space-y-2">
            <Label htmlFor="displayName">表示名 *</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              disabled={isUploading}
              className={errors.displayName ? 'border-red-500' : ''}
            />
            {errors.displayName && (
              <p className="text-sm text-red-500">{errors.displayName}</p>
            )}
          </div>

          {/* 説明 */}
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isUploading}
              rows={3}
            />
          </div>

          {/* GSファイルアップロード */}
          <div className="space-y-2">
            <Label>Gaussian Splattingファイル *</Label>
            {!formData.gsFile ? (
              <div
                {...gsFileDropzone.getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  gsFileDropzone.isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${errors.gsFile ? 'border-red-500' : ''} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input {...gsFileDropzone.getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  ファイルをドラッグ&ドロップ
                </p>
                <p className="text-sm text-gray-600">
                  または<span className="text-blue-600">クリックして選択</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  .splat、.plyファイル（最大100MB）
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <File className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{formData.gsFile.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(formData.gsFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeGSFile}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {errors.gsFile && (
              <p className="text-sm text-red-500">{errors.gsFile}</p>
            )}
          </div>

          {/* サムネイルアップロード */}
          <div className="space-y-2">
            <Label>サムネイル画像（オプション）</Label>
            {!formData.thumbnail ? (
              <div
                {...thumbnailDropzone.getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  thumbnailDropzone.isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${errors.thumbnail ? 'border-red-500' : ''} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input {...thumbnailDropzone.getInputProps()} />
                <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  画像をドラッグ&ドロップ
                </p>
                <p className="text-sm text-gray-600">
                  または<span className="text-blue-600">クリックして選択</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  JPEG、PNG、WebP（最大5MB）
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {formData.thumbnail.preview && (
                    <img
                      src={formData.thumbnail.preview}
                      alt="サムネイルプレビュー"
                      className="h-16 w-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{formData.thumbnail.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(formData.thumbnail.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeThumbnail}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {errors.thumbnail && (
              <p className="text-sm text-red-500">{errors.thumbnail}</p>
            )}
          </div>

          {/* アップロードプログレス */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>アップロード中...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* 送信ボタン */}
          <Button
            type="submit"
            className="w-full"
            disabled={isUploading || !formData.gsFile}
          >
            {isUploading ? 'アップロード中...' : 'アップロード'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 