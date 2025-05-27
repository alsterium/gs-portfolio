import { useRef, useEffect, useState, useCallback } from 'react';
import * as pc from 'playcanvas';

interface UseSplatReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  loading: boolean;
  error: string | null;
}

interface CameraControls {
  orbitSensitivity: number;
  zoomSensitivity: number;
  panSensitivity: number;
  minDistance: number;
  maxDistance: number;
}

const DEFAULT_CONTROLS: CameraControls = {
  orbitSensitivity: 0.3,
  zoomSensitivity: 0.1,
  panSensitivity: 0.002,
  minDistance: 1,
  maxDistance: 50,
};

export function useSplat(url: string): UseSplatReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<pc.Application | null>(null);
  const cameraRef = useRef<pc.Entity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // カメラ制御用の状態
  const mouseStateRef = useRef({
    isDown: false,
    lastX: 0,
    lastY: 0,
    button: -1,
  });

  const cameraStateRef = useRef({
    distance: 5,
    pitch: 0,
    yaw: 0,
    target: new pc.Vec3(0, 0, 0),
  });

  // ファイル形式の検証
  const validateFileFormat = useCallback((fileUrl: string): boolean => {
    if (!fileUrl) return false;
    const extension = fileUrl.toLowerCase().split('.').pop();
    return extension === 'splat' || extension === 'ply';
  }, []);

  // カメラ位置の更新
  const updateCameraPosition = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    const state = cameraStateRef.current;
    const controls = DEFAULT_CONTROLS;

    // 距離の制限
    state.distance = Math.max(controls.minDistance, Math.min(controls.maxDistance, state.distance));

    // ピッチの制限（-90度から90度）
    state.pitch = Math.max(-89, Math.min(89, state.pitch));

    // 球面座標からカルテシアン座標への変換
    const pitchRad = state.pitch * Math.PI / 180;
    const yawRad = state.yaw * Math.PI / 180;

    const x = state.distance * Math.cos(pitchRad) * Math.sin(yawRad);
    const y = state.distance * Math.sin(pitchRad);
    const z = state.distance * Math.cos(pitchRad) * Math.cos(yawRad);

    camera.setPosition(
      state.target.x + x,
      state.target.y + y,
      state.target.z + z
    );

    camera.lookAt(state.target);
  }, []);

  // マウスイベントハンドラー
  const setupCameraControls = useCallback((canvas: HTMLCanvasElement) => {
    const controls = DEFAULT_CONTROLS;

    // マウスダウン
    const onMouseDown = (event: MouseEvent) => {
      mouseStateRef.current = {
        isDown: true,
        lastX: event.clientX,
        lastY: event.clientY,
        button: event.button,
      };
      canvas.style.cursor = 'grabbing';
      event.preventDefault();
    };

    // マウスムーブ
    const onMouseMove = (event: MouseEvent) => {
      const mouseState = mouseStateRef.current;
      if (!mouseState.isDown) return;

      const deltaX = event.clientX - mouseState.lastX;
      const deltaY = event.clientY - mouseState.lastY;

      if (mouseState.button === 0) { // 左クリック: 回転
        cameraStateRef.current.yaw += deltaX * controls.orbitSensitivity;
        cameraStateRef.current.pitch -= deltaY * controls.orbitSensitivity;
      } else if (mouseState.button === 2) { // 右クリック: パン
        const camera = cameraRef.current;
        if (camera) {
          const right = camera.right.clone().mulScalar(deltaX * controls.panSensitivity * cameraStateRef.current.distance);
          const up = camera.up.clone().mulScalar(deltaY * controls.panSensitivity * cameraStateRef.current.distance);
          
          cameraStateRef.current.target.sub(right).add(up);
        }
      }

      updateCameraPosition();

      mouseStateRef.current.lastX = event.clientX;
      mouseStateRef.current.lastY = event.clientY;
      event.preventDefault();
    };

    // マウスアップ
    const onMouseUp = () => {
      mouseStateRef.current.isDown = false;
      canvas.style.cursor = 'grab';
    };

    // ホイール（ズーム）
    const onWheel = (event: WheelEvent) => {
      const delta = event.deltaY > 0 ? 1 : -1;
      cameraStateRef.current.distance += delta * controls.zoomSensitivity * cameraStateRef.current.distance;
      updateCameraPosition();
      event.preventDefault();
    };

    // タッチイベント（モバイル対応）
    let lastTouchDistance = 0;
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        mouseStateRef.current = {
          isDown: true,
          lastX: touch.clientX,
          lastY: touch.clientY,
          button: 0,
        };
      } else if (event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        lastTouchDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
      }
      event.preventDefault();
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && mouseStateRef.current.isDown) {
        const touch = event.touches[0];
        const deltaX = touch.clientX - mouseStateRef.current.lastX;
        const deltaY = touch.clientY - mouseStateRef.current.lastY;

        cameraStateRef.current.yaw += deltaX * controls.orbitSensitivity;
        cameraStateRef.current.pitch -= deltaY * controls.orbitSensitivity;

        updateCameraPosition();

        mouseStateRef.current.lastX = touch.clientX;
        mouseStateRef.current.lastY = touch.clientY;
      } else if (event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        if (lastTouchDistance > 0) {
          const scale = currentDistance / lastTouchDistance;
          cameraStateRef.current.distance /= scale;
          updateCameraPosition();
        }

        lastTouchDistance = currentDistance;
      }
      event.preventDefault();
    };

    const onTouchEnd = () => {
      mouseStateRef.current.isDown = false;
      lastTouchDistance = 0;
    };

    // イベントリスナーの追加
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchmove', onTouchMove);
    canvas.addEventListener('touchend', onTouchEnd);

    canvas.style.cursor = 'grab';

    // クリーンアップ関数を返す
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', (e) => e.preventDefault());

      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [updateCameraPosition]);

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
        fov: 45,
        nearClip: 0.1,
        farClip: 1000,
      });
      
      cameraRef.current = camera;
      updateCameraPosition();
      app.scene.root.addChild(camera);

      // ライトエンティティの作成
      const light = new pc.Entity('light');
      light.addComponent('light', {
        type: pc.LIGHTTYPE_DIRECTIONAL,
        color: new pc.Color(1, 1, 1),
        intensity: 1,
      });
      light.setEulerAngles(45, 30, 0);
      app.scene.root.addChild(light);

      // 環境光の追加
      const ambientLight = new pc.Entity('ambient');
      ambientLight.addComponent('light', {
        type: pc.LIGHTTYPE_POINT,
        color: new pc.Color(0.3, 0.3, 0.3),
        intensity: 0.5,
      });
      ambientLight.setPosition(0, 10, 0);
      app.scene.root.addChild(ambientLight);

      app.start();

      // カメラコントロールの設定
      if (canvas && canvas instanceof HTMLCanvasElement) {
        setupCameraControls(canvas);
      }

      return app;
    } catch (error) {
      console.error('PlayCanvas initialization failed:', error);
      return null;
    }
  }, [updateCameraPosition, setupCameraControls]);

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

        // モデルのバウンディングボックスに基づいてカメラ距離を調整
        const aabb = splatEntity.aabb;
        if (aabb) {
          const size = aabb.halfExtents.length();
          cameraStateRef.current.distance = size * 2;
          updateCameraPosition();
        }

        setLoading(false);
      } catch (instantiateError) {
        setError(instantiateError instanceof Error ? instantiateError.message : 'Failed to instantiate splat model');
        setLoading(false);
      }
    });
  }, [updateCameraPosition]);

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
      cameraRef.current = null;
    };
  }, [url, validateFileFormat, initializeApp, loadSplatFile]);

  return {
    canvasRef,
    loading,
    error,
  };
} 