import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getGSFiles, deleteGSFile } from '../lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type { GSFile, PaginatedResponse } from '@/types';

export function AdminFilesPage() {
  const [files, setFiles] = useState<GSFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedResponse<GSFile> = await getGSFiles();
      setFiles(response.data);
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
            <Button>新規アップロード</Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {files.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">アップロードされたファイルがありません</p>
              <Button className="mt-4">最初のファイルをアップロード</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <Card key={file.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{file.display_name}</CardTitle>
                  <CardDescription>
                    {file.filename} • {formatFileSize(file.file_size)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>アップロード日: {formatDate(file.upload_date)}</div>
                    {file.description && (
                      <div>説明: {file.description}</div>
                    )}
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Link
                      to={`/view/${file.id}`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 flex-1"
                    >
                      表示
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                      disabled={deletingId === file.id}
                      className="flex-1"
                    >
                      {deletingId === file.id ? '削除中...' : '削除'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 