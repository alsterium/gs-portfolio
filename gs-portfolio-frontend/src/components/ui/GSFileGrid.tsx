import { GSFileCard } from './GSFileCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import type { GSFile } from '@/types';

interface GSFileGridProps {
  files?: GSFile[];
  loading?: boolean;
  error?: string;
  className?: string;
}

export function GSFileGrid({ files, loading, error, className }: GSFileGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">ファイルを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorMessage
          title="読み込みエラー"
          message={error}
          variant="error"
        />
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto max-w-md">
          <div className="mb-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            ファイルがありません
          </h3>
          <p className="text-gray-600">
            Gaussian Splattingファイルがまだアップロードされていません。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {files.map((file) => (
          <GSFileCard key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
} 