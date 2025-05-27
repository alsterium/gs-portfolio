import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSplat } from './useSplat';

// PlayCanvasのモック
const mockApplication = {
  setCanvasFillMode: vi.fn(),
  setCanvasResolution: vi.fn(),
  start: vi.fn(),
  destroy: vi.fn(),
  scene: {
    root: {
      addChild: vi.fn(),
    },
  },
  assets: {
    loadFromUrl: vi.fn(),
  },
};

const mockEntity = {
  addComponent: vi.fn(),
  setPosition: vi.fn(),
  setEulerAngles: vi.fn(),
  lookAt: vi.fn(),
  right: { 
    clone: vi.fn(() => ({ 
      mulScalar: vi.fn(() => ({ 
        sub: vi.fn().mockReturnThis(), 
        add: vi.fn().mockReturnThis() 
      })) 
    })) 
  },
  up: { 
    clone: vi.fn(() => ({ 
      mulScalar: vi.fn(() => ({ 
        sub: vi.fn().mockReturnThis(), 
        add: vi.fn().mockReturnThis() 
      })) 
    })) 
  },
  aabb: null,
};

const mockMouse = vi.fn();
const mockTouchDevice = vi.fn();
const mockKeyboard = vi.fn();
const mockColor = vi.fn();
const mockVec3 = vi.fn(() => ({
  x: 0,
  y: 0,
  z: 0,
  sub: vi.fn().mockReturnThis(),
  add: vi.fn().mockReturnThis(),
}));

vi.mock('playcanvas', () => ({
  Application: vi.fn(() => mockApplication),
  Entity: vi.fn(() => mockEntity),
  Mouse: mockMouse,
  TouchDevice: mockTouchDevice,
  Keyboard: mockKeyboard,
  Color: mockColor,
  Vec3: mockVec3,
  FILLMODE_FILL_WINDOW: 'FILLMODE_FILL_WINDOW',
  RESOLUTION_AUTO: 'RESOLUTION_AUTO',
  LIGHTTYPE_DIRECTIONAL: 'LIGHTTYPE_DIRECTIONAL',
  LIGHTTYPE_POINT: 'LIGHTTYPE_POINT',
}));

describe('useSplat', () => {
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // HTMLCanvasElementのモック
    mockCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      style: { cursor: '' },
      width: 800,
      height: 600,
    } as any;

    // document.createElementのモック
    vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初期状態でローディングがtrueになる', () => {
    const { result } = renderHook(() => useSplat('test.splat'));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('無効なURLでエラーが設定される', () => {
    const { result } = renderHook(() => useSplat(''));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Splat file URL is required');
  });

  it('サポートされていないファイル形式でエラーが設定される', () => {
    const { result } = renderHook(() => useSplat('test.txt'));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Unsupported file format. Only .splat and .ply files are supported.');
  });

  it('有効な.splatファイルでPlayCanvasアプリが初期化される', async () => {
    const { result } = renderHook(() => useSplat('test.splat'));
    
    // 初期化が非同期で実行されるため、少し待つ
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(mockApplication.setCanvasFillMode).toHaveBeenCalled();
    expect(mockApplication.setCanvasResolution).toHaveBeenCalled();
    expect(mockApplication.start).toHaveBeenCalled();
  });

  it('有効な.plyファイルでPlayCanvasアプリが初期化される', async () => {
    const { result } = renderHook(() => useSplat('test.ply'));
    
    // 初期化が非同期で実行されるため、少し待つ
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(mockApplication.setCanvasFillMode).toHaveBeenCalled();
    expect(mockApplication.setCanvasResolution).toHaveBeenCalled();
    expect(mockApplication.start).toHaveBeenCalled();
  });

  it('カメラとライトエンティティが作成される', async () => {
    const { result } = renderHook(() => useSplat('test.splat'));
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // カメラエンティティの作成を確認
    expect(mockEntity.addComponent).toHaveBeenCalledWith('camera', expect.objectContaining({
      clearColor: expect.any(Object),
      fov: 45,
      nearClip: 0.1,
      farClip: 1000,
    }));

    // ライトエンティティの作成を確認
    expect(mockEntity.addComponent).toHaveBeenCalledWith('light', expect.objectContaining({
      type: 'LIGHTTYPE_DIRECTIONAL',
      color: expect.any(Object),
      intensity: 1,
    }));

    // 環境光の作成を確認
    expect(mockEntity.addComponent).toHaveBeenCalledWith('light', expect.objectContaining({
      type: 'LIGHTTYPE_POINT',
      color: expect.any(Object),
      intensity: 0.5,
    }));
  });

  it('カメラコントロールのイベントリスナーが設定される', async () => {
    const { result } = renderHook(() => useSplat('test.splat'));
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // マウスイベントリスナーが追加されることを確認
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('wheel', expect.any(Function));
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('contextmenu', expect.any(Function));

    // タッチイベントリスナーが追加されることを確認
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function));
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('touchend', expect.any(Function));

    // カーソルスタイルが設定されることを確認
    expect(mockCanvas.style.cursor).toBe('grab');
  });

  it('アセット読み込みが呼び出される', async () => {
    const { result } = renderHook(() => useSplat('test.splat'));
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(mockApplication.assets.loadFromUrl).toHaveBeenCalledWith(
      'test.splat',
      'gsplat',
      expect.any(Function)
    );
  });

  it('アセット読み込み成功時にエンティティが作成される', async () => {
    const mockAsset = {
      resource: {
        instantiate: vi.fn(() => ({
          setPosition: vi.fn(),
          aabb: {
            halfExtents: {
              length: vi.fn(() => 2),
            },
          },
        })),
      },
    };

    mockApplication.assets.loadFromUrl.mockImplementation((url, type, callback) => {
      callback(null, mockAsset);
    });

    const { result } = renderHook(() => useSplat('test.splat'));
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(mockAsset.resource.instantiate).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('アセット読み込み失敗時にエラーが設定される', async () => {
    mockApplication.assets.loadFromUrl.mockImplementation((url, type, callback) => {
      callback('Failed to load asset', null);
    });

    const { result } = renderHook(() => useSplat('test.splat'));
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to load asset');
  });

  it('コンポーネントアンマウント時にアプリが破棄される', async () => {
    const { result, unmount } = renderHook(() => useSplat('test.splat'));
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    unmount();
    
    expect(mockApplication.destroy).toHaveBeenCalled();
  });

  it('URL変更時に古いアプリが破棄され新しいアプリが作成される', async () => {
    const { result, rerender } = renderHook(
      ({ url }) => useSplat(url),
      { initialProps: { url: 'test1.splat' } }
    );
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // 最初のアプリが作成されることを確認
    expect(mockApplication.start).toHaveBeenCalledTimes(1);
    
    // URLを変更
    rerender({ url: 'test2.splat' });
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // 古いアプリが破棄され、新しいアプリが作成されることを確認
    expect(mockApplication.destroy).toHaveBeenCalled();
    expect(mockApplication.start).toHaveBeenCalledTimes(2);
  });
}); 