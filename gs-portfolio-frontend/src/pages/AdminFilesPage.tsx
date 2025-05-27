import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getGSFiles, deleteGSFile, updateGSFile, type UpdateGSFileRequest } from '../lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { FileUploadForm } from '@/components/ui/FileUploadForm';
import { Pagination } from '@/components/ui/Pagination';
import { Plus, Upload, Edit2, Save, X } from 'lucide-react';
import type { GSFile, PaginatedResponse } from '@/types';

export function AdminFilesPage() {
  const [files, setFiles] = useState<GSFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<UpdateGSFileRequest>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const loadFiles = async (page: number = pagination.page) => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedResponse<GSFile> = await getGSFiles(page, pagination.limit);
      setFiles(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ファイルの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このファイルを削除しますか？')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteGSFile(id);
      await loadFiles(); // ファイル一覧を再読み込み
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ファイルの削除に失敗しました');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    loadFiles(); // ファイル一覧を再読み込み
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleEdit = (file: GSFile) => {
    setEditingId(file.id);
    setEditForm({
      display_name: file.display_name,
      description: file.description || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      await updateGSFile(editingId, editForm);
      setEditingId(null);
      setEditForm({});
      await loadFiles(); // ファイル一覧を再読み込み
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ファイルの更新に失敗しました');
    }
  };

  const handlePageChange = (page: number) => {
    loadFiles(page);
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  useEffect(() => {
    loadFiles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <LoadingSpinner />
          <p className="text-center mt-4">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ファイル管理</h1>
            <p className="mt-2 text-gray-600">Gaussian Splattingファイルの管理</p>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              ダッシュボードに戻る
            </Link>
            <Button onClick={() => setShowUploadForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新規アップロード
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showUploadForm && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">ファイルアップロード</h2>
              <Button
                variant="outline"
                onClick={() => setShowUploadForm(false)}
              >
                キャンセル
              </Button>
            </div>
            <FileUploadForm
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
            />
          </div>
        )}

        {files.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">アップロードされたファイルがありません</p>
              <Button 
                className="mt-4"
                onClick={() => setShowUploadForm(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                最初のファイルをアップロード
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <Card key={file.id}>
                <CardHeader>
                  {editingId === file.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editForm.display_name || ''}
                        onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                        placeholder="表示名"
                        className="text-lg font-semibold"
                      />
                    </div>
                  ) : (
                    <CardTitle className="text-lg">{file.display_name}</CardTitle>
                  )}
                  <CardDescription>
                    {file.filename} • {formatFileSize(file.file_size)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>アップロード日: {formatDate(file.upload_date)}</div>
                    {editingId === file.id ? (
                      <div>
                        <label className="block text-sm font-medium mb-1">説明:</label>
                        <Textarea
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="ファイルの説明"
                          rows={3}
                        />
                      </div>
                    ) : (
                      file.description && (
                        <div>説明: {file.description}</div>
                      )
                    )}
                  </div>
                  <div className="mt-4 flex space-x-2">
                    {editingId === file.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          保存
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-1" />
                          キャンセル
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link
                          to={`/view/${file.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 flex-1"
                        >
                          表示
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(file)}
                          className="flex-1"
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                          disabled={deletingId === file.id}
                          className="flex-1"
                        >
                          {deletingId === file.id ? '削除中...' : '削除'}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ページネーション */}
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            className="mt-8"
          />
        )}
      </div>
    </div>
  );
} 