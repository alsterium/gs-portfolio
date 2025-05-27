import { Application, Entity } from '@playcanvas/react';
import { Render, Camera, Light } from '@playcanvas/react/components';
import { useApp } from '@playcanvas/react/hooks';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import type { GSFile } from '@/types';
import { useState, useCallback, useEffect } from 'react';

interface GSViewerProps {
  fileUrl: string;
  fileInfo?: GSFile;
  className?: string;
}

// 3Dシーンコンポーネント
function GSScene({ fileUrl, fileInfo, onReady, onError }: {
  fileUrl: string;
  fileInfo?: GSFile;
  onReady: () => void;
  onError: (error: string) => void;
}) {
  const app = useApp();

  // ファイル形式の検証
  const validateFileFormat = useCallback((fileUrl: string, fileInfo?: GSFile): boolean => {
    if (!fileUrl) return false;
    
    // ファイル情報がある場合は、ファイル名から拡張子を取得
    if (fileInfo?.filename) {
      const extension = fileInfo.filename.toLowerCase().split('.').pop();
      return extension === 'splat' || extension === 'ply';
    }
    
    // ファイル情報がない場合は、URLから拡張子を取得（従来の方法）
    const extension = fileUrl.toLowerCase().split('.').pop();
    return extension === 'splat' || extension === 'ply';
  }, []);

  useEffect(() => {
    if (app) {
      console.log('PlayCanvas Application ready');
      
      // ファイル形式の検証
      if (!validateFileFormat(fileUrl, fileInfo)) {
        onError('Unsupported file format. Only .splat and .ply files are supported.');
        return;
      }

      // 実際のGaussian Splattingファイルの読み込みは今後実装予定
      console.warn('Gaussian Splatting loader not yet implemented. Showing placeholder.');
      onReady();
    }
  }, [app, fileUrl, fileInfo, validateFileFormat, onReady, onError]);

  return (
    <>
      {/* カメラエンティティ */}
      <Entity name="camera" position={[0, 0, 5]}>
        <Camera
          clearColor="rgb(25, 25, 25)"
          fov={45}
          nearClip={0.1}
          farClip={1000}
        />
      </Entity>

      {/* ディレクショナルライト */}
      <Entity name="directional-light" rotation={[45, 30, 0]}>
        <Light
          type="directional"
          color="white"
          intensity={1}
        />
      </Entity>

      {/* 環境光 */}
      <Entity name="ambient-light" position={[0, 10, 0]}>
        <Light
          type="omni"
          color="rgb(76, 76, 76)"
          intensity={0.5}
        />
      </Entity>

      {/* プレースホルダーボックス（Gaussian Splattingローダー実装まで） */}
      <Entity name="placeholder-box" position={[0, 0, 0]} scale={[2, 2, 2]}>
        <Render type="box" />
      </Entity>
    </>
  );
}

export function GSViewer({ fileUrl, fileInfo, className = '' }: GSViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // アプリケーション初期化時のハンドラー
  const handleAppReady = useCallback(() => {
    setLoading(false);
  }, []);

  // エラーハンドラー
  const handleAppError = useCallback((errorMessage: string) => {
    console.error('PlayCanvas Application error:', errorMessage);
    setError(errorMessage);
    setLoading(false);
  }, []);

  return (
    <div className={`gs-viewer ${className}`} data-testid="gs-viewer">
      <div className="relative">
        {/* PlayCanvas React Application */}
        <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
          <Application
            graphicsDeviceOptions={{
              antialias: true,
              alpha: false,
              preserveDrawingBuffer: false,
            }}
          >
            <GSScene
              fileUrl={fileUrl}
              fileInfo={fileInfo}
              onReady={handleAppReady}
              onError={handleAppError}
            />
          </Application>
        </div>
        
        {/* ローディング状態のオーバーレイ */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-90 rounded-lg">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">3Dモデルを読み込み中...</p>
          </div>
        )}
        
        {/* エラー状態のオーバーレイ */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-90 rounded-lg">
            <ErrorMessage 
              title="3Dモデルの読み込みに失敗しました"
              message={error}
            />
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>PlayCanvas Reactを使用したGaussian Splattingビューアー</p>
        <p className="mt-1">ファイル: {fileUrl}</p>
        <div className="mt-2 text-xs text-gray-500">
          <p>操作方法: 左クリック+ドラッグで回転 | 右クリック+ドラッグでパン | ホイールでズーム</p>
        </div>
      </div>
    </div>
  );
} 