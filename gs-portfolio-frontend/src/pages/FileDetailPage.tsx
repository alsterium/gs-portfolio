import { useParams } from 'react-router';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export function FileDetailPage() {
  const { id } = useParams<{ id: string }>();

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

  // TODO: ファイルデータの取得とGSViewerの実装
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gaussian Splatting ファイル詳細
        </h1>
        <p className="text-gray-600 mt-2">
          ファイルID: {id}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3Dビューアー */}
        <div className="lg:col-span-2">
          <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">3Dビューアーを準備中...</p>
              <p className="text-sm text-gray-500 mt-2">
                PlayCanvas Engineを使用したGaussian Splattingビューアーを実装予定
              </p>
            </div>
          </div>
        </div>

        {/* ファイル情報 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">ファイル情報</h2>
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">表示名</dt>
                <dd className="text-sm text-gray-900">読み込み中...</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ファイルサイズ</dt>
                <dd className="text-sm text-gray-900">読み込み中...</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">アップロード日</dt>
                <dd className="text-sm text-gray-900">読み込み中...</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">説明</dt>
                <dd className="text-sm text-gray-900">読み込み中...</dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 