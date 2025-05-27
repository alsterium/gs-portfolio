import { useRef, useEffect, useState, useCallback } from 'react';
import * as pc from 'playcanvas';
import type { GSFile } from '@/types';

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

export function useSplat(url: string, fileInfo?: GSFile): UseSplatReturn {
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
  const initializeApp = useCallback(async () => {
    // canvasの存在確認
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas element not found');
      return null;
    }

    // canvasサイズの設定（iOS対応）
    const maxCanvasSize = 4096; // iOSの制限を考慮
    const rect = canvas.getBoundingClientRect();
    const width = Math.min(rect.width || 800, maxCanvasSize);
    const height = Math.min(rect.height || 600, maxCanvasSize);
    
    canvas.width = width;
    canvas.height = height;

    console.log('Initializing PlayCanvas with canvas size:', { width, height });

    try {
      // WebGLコンテキストの確認
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        console.error('WebGL not supported');
        return null;
      }

      console.log('WebGL context created successfully');

      // PlayCanvasアプリケーションの作成
      const app = new pc.Application(canvas, {
        mouse: new pc.Mouse(canvas),
        touch: new pc.TouchDevice(canvas),
        keyboard: new pc.Keyboard(window),
        graphicsDeviceOptions: {
          antialias: true,
          alpha: false,
          preserveDrawingBuffer: false,
          preferLowPowerToHighPerformance: false,
        },
      });

      console.log('PlayCanvas Application created');

      // アプリケーション設定
      app.setCanvasFillMode(pc.FILLMODE_NONE);
      app.setCanvasResolution(pc.RESOLUTION_FIXED);
      app.resizeCanvas(width, height);

      console.log('Canvas settings applied');

      // アプリケーションの開始（エンティティ作成前に必要）
      app.start();

      console.log('PlayCanvas Application started');

      // scene.rootの準備を待つ
      let attempts = 0;
      const maxAttempts = 50; // 2.5秒間待つ
      while ((!app.scene || !app.scene.root) && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
        console.log(`Waiting for scene root... (${attempts}/${maxAttempts})`);
      }

      if (!app.scene || !app.scene.root) {
        console.error('PlayCanvas scene or scene.root is not available after waiting');
        return null;
      }

      console.log('Scene root confirmed');

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

      console.log('Camera created and added to scene');

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

      console.log('Lights created and added to scene');

      console.log('PlayCanvas Application initialized successfully');

      // カメラコントロールの設定
      if (canvas && canvas instanceof HTMLCanvasElement) {
        setupCameraControls(canvas);
      }

      return app;
    } catch (error) {
      console.error('PlayCanvas initialization failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        canvasSize: { width: canvas.width, height: canvas.height },
        userAgent: navigator.userAgent,
      });
      return null;
    }
  }, [updateCameraPosition, setupCameraControls]);

  // Splatファイルの読み込み
  const loadSplatFile = useCallback((app: pc.Application, fileUrl: string) => {
    console.log('Loading splat file from:', fileUrl);

    // 現在はGaussian Splattingローダーが利用できないため、プレースホルダーを表示
    try {
      // scene.rootの存在確認
      if (!app.scene || !app.scene.root) {
        console.error('Scene root not available for placeholder creation');
        setError('3D scene initialization failed');
        setLoading(false);
        return;
      }

      // プレースホルダーとして立方体を作成
      const material = new pc.StandardMaterial();
      material.diffuse = new pc.Color(0.7, 0.7, 0.9);
      material.metalness = 0.1;
      material.gloss = 0.8;
      material.update();

      const box = new pc.Entity('placeholder-box');
      box.addComponent('render', {
        type: 'box',
        material: material,
      });

      box.setPosition(0, 0, 0);
      box.setLocalScale(2, 2, 2);
      app.scene.root.addChild(box);

      console.log('Placeholder box created and added to scene');

      // カメラ距離の調整
      cameraStateRef.current.distance = 5;
      updateCameraPosition();

      setLoading(false);
      
      // 実際のGaussian Splattingファイルの読み込みは今後実装予定
      console.warn('Gaussian Splatting loader not yet implemented. Showing placeholder.');
      
    } catch (instantiateError) {
      console.error('Failed to create placeholder:', instantiateError);
      setError(instantiateError instanceof Error ? instantiateError.message : 'Failed to create 3D content');
      setLoading(false);
    }
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

    if (!validateFileFormat(url, fileInfo)) {
      setError('Unsupported file format. Only .splat and .ply files are supported.');
      setLoading(false);
      return;
    }

    // canvas要素の準備を待つ関数
    const waitForCanvas = () => {
      return new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 100; // 5秒間待つ（50ms × 100回）
        
        const checkCanvas = () => {
          attempts++;
          
          if (canvasRef.current) {
            console.log('Canvas element found, proceeding with initialization');
            resolve();
          } else if (attempts >= maxAttempts) {
            console.error('Canvas element not found after maximum attempts');
            reject(new Error('Canvas element not found'));
          } else {
            console.log(`Canvas element not ready, retrying... (${attempts}/${maxAttempts})`);
            setTimeout(checkCanvas, 50);
          }
        };
        checkCanvas();
      });
    };

    // PlayCanvasアプリの初期化
    const initializePlayCanvas = async () => {
      try {
        // canvas要素の準備を待つ
        await waitForCanvas();
        
        console.log('Starting PlayCanvas initialization...');
        
        const app = await initializeApp();
        if (!app) {
          console.error('PlayCanvas initialization returned null');
          setError('Failed to initialize PlayCanvas application');
          setLoading(false);
          return;
        }

        console.log('PlayCanvas app initialized successfully');
        appRef.current = app;

        // Splatファイルの読み込み
        loadSplatFile(app, url);
      } catch (error) {
        console.error('Error during PlayCanvas initialization:', error);
        setError('Failed to initialize PlayCanvas application');
        setLoading(false);
      }
    };

    // 初期化を開始
    initializePlayCanvas();

    // クリーンアップ関数
    return () => {
      if (appRef.current) {
        appRef.current.destroy();
        appRef.current = null;
      }
      cameraRef.current = null;
    };
  }, [url, fileInfo, validateFileFormat, initializeApp, loadSplatFile]);

  return {
    canvasRef,
    loading,
    error,
  };
} 