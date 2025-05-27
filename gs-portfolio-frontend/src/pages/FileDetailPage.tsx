import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { GSViewer } from '@/components/ui/GSViewer';
import { getGSFile } from '@/lib/gsFiles';
import type { GSFile } from '@/types';

export function FileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<GSFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!id) return;

    const fetchFile = async () => {
      try {
        setLoading(true);
        const fileData = await getGSFile(parseInt(id));
        setFile(fileData);
      } catch (err) {
        console.error('ファイル取得エラー:', err);
        setError('ファイルの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [id]);

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage 
          message="ファイルIDが指定されていません。" 
          variant="error"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage 
          message={error || 'ファイルが見つかりません。'} 
          variant="error"
        />
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {file.display_name}
        </h1>
        <p className="text-gray-600 mt-2">
          {file.description || 'Gaussian Splattingファイル'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3Dビューアー */}
        <div className="lg:col-span-2">
          <GSViewer 
            fileUrl={`/api/gs-files/${file.id}/file`}
            fileInfo={file}
            className="w-full"
          />
        </div>

        {/* ファイル情報 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">ファイル情報</h2>
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ファイル名</dt>
                <dd className="text-sm text-gray-900">{file.filename}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ファイルサイズ</dt>
                <dd className="text-sm text-gray-900">
                  {(file.file_size / 1024 / 1024).toFixed(1)} MB
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">MIMEタイプ</dt>
                <dd className="text-sm text-gray-900">{file.mime_type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">アップロード日</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(file.upload_date).toLocaleDateString('ja-JP')}
                </dd>
              </div>
              {file.description && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">説明</dt>
                  <dd className="text-sm text-gray-900">{file.description}</dd>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 