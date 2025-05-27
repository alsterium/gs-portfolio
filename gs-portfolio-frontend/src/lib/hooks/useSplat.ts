import { useRef, useEffect, useState, useCallback } from 'react';
import * as pc from 'playcanvas';

interface UseSplatReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  loading: boolean;
  error: string | null;
}

export function useSplat(url: string): UseSplatReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<pc.Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ファイル形式の検証
  const validateFileFormat = useCallback((fileUrl: string): boolean => {
    if (!fileUrl) return false;
    const extension = fileUrl.toLowerCase().split('.').pop();
    return extension === 'splat' || extension === 'ply';
  }, []);

  // PlayCanvasアプリの初期化
  const initializeApp = useCallback(() => {
    // テスト環境では仮想的なcanvas要素を作成
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
    }

    try {
      const app = new pc.Application(canvas, {
        mouse: new pc.Mouse(canvas),
        touch: new pc.TouchDevice(canvas),
        keyboard: new pc.Keyboard(window),
      });

      // アプリケーション設定
      app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
      app.setCanvasResolution(pc.RESOLUTION_AUTO);

      // カメラエンティティの作成
      const camera = new pc.Entity('camera');
      camera.addComponent('camera', {
        clearColor: new pc.Color(0.1, 0.1, 0.1),
      });
      camera.setPosition(0, 0, 5);
      app.scene.root.addChild(camera);

      // ライトエンティティの作成
      const light = new pc.Entity('light');
      light.addComponent('light');
      light.setEulerAngles(45, 0, 0);
      app.scene.root.addChild(light);

      app.start();
      return app;
    } catch (error) {
      console.error('PlayCanvas initialization failed:', error);
      return null;
    }
  }, []);

  // Splatファイルの読み込み
  const loadSplatFile = useCallback((app: pc.Application, fileUrl: string) => {
    app.assets.loadFromUrl(fileUrl, 'gsplat', (err: string | null, asset: any) => {
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }

      try {
        // Splatエンティティの作成
        const splatEntity = asset.resource.instantiate();
        splatEntity.setPosition(0, 0, 0);
        app.scene.root.addChild(splatEntity);

        setLoading(false);
      } catch (instantiateError) {
        setError(instantiateError instanceof Error ? instantiateError.message : 'Failed to instantiate splat model');
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    // 初期化時にローディング状態をリセット
    setLoading(true);
    setError(null);

    // URLの検証
    if (!url) {
      setError('Splat file URL is required');
      setLoading(false);
      return;
    }

    if (!validateFileFormat(url)) {
      setError('Unsupported file format. Only .splat and .ply files are supported.');
      setLoading(false);
      return;
    }

    // PlayCanvasアプリの初期化を遅延実行
    const initTimer = setTimeout(() => {
      const app = initializeApp();
      if (!app) {
        setError('Failed to initialize PlayCanvas application');
        setLoading(false);
        return;
      }

      appRef.current = app;

      // Splatファイルの読み込み
      loadSplatFile(app, url);
    }, 0);

    // クリーンアップ関数
    return () => {
      clearTimeout(initTimer);
      if (appRef.current) {
        appRef.current.destroy();
        appRef.current = null;
      }
    };
  }, [url, validateFileFormat, initializeApp, loadSplatFile]);

  return {
    canvasRef,
    loading,
    error,
  };
} 