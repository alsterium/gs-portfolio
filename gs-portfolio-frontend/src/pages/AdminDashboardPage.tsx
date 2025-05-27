import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { adminLogout } from '../lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      await adminLogout();
      navigate('/admin');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ログアウトに失敗しました');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">管理者ダッシュボード</h1>
          <p className="mt-2 text-gray-600">Gaussian Splattingファイルの管理</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ファイル管理カード */}
          <Card>
            <CardHeader>
              <CardTitle>ファイル管理</CardTitle>
              <CardDescription>
                Gaussian Splattingファイルのアップロード、編集、削除
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                to="/admin/files"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
              >
                ファイル管理
              </Link>
            </CardContent>
          </Card>

          {/* 統計カード */}
          <Card>
            <CardHeader>
              <CardTitle>統計</CardTitle>
              <CardDescription>
                サイトの利用状況とファイル統計
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">総ファイル数:</span>
                  <span className="text-sm font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">総容量:</span>
                  <span className="text-sm font-medium">-</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 設定カード */}
          <Card>
            <CardHeader>
              <CardTitle>設定</CardTitle>
              <CardDescription>
                システム設定とアカウント管理
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="outline"
                className="w-full"
              >
                {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 