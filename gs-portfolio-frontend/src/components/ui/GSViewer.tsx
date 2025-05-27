import { useSplat } from '../../lib/hooks/useSplat';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface GSViewerProps {
  fileUrl: string;
  className?: string;
}

export function GSViewer({ fileUrl, className = '' }: GSViewerProps) {
  const { canvasRef, loading, error } = useSplat(fileUrl);

  if (error) {
    return (
      <div className={`gs-viewer-error ${className}`} data-testid="gs-viewer">
        <ErrorMessage 
          title="3Dモデルの読み込みに失敗しました"
          message={error}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`gs-viewer-loading ${className}`} data-testid="gs-viewer">
        <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-lg">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">3Dモデルを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`gs-viewer ${className}`} data-testid="gs-viewer">
      <canvas
        ref={canvasRef}
        className="w-full h-96 bg-gray-900 rounded-lg"
        role="application"
        aria-label="3D Gaussian Splattingビューアー"
      />
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>PlayCanvas Engineを使用したGaussian Splattingビューアー</p>
        <p className="mt-1">ファイル: {fileUrl}</p>
      </div>
    </div>
  );
} 