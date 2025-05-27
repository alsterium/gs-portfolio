import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSplat } from './useSplat';

// PlayCanvasのモック
const mockApp = {
  destroy: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  scene: {
    root: {
      addChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
  assets: {
    loadFromUrl: vi.fn(),
  },
  setCanvasFillMode: vi.fn(),
  setCanvasResolution: vi.fn(),
};

const mockEntity = {
  destroy: vi.fn(),
  addComponent: vi.fn(),
  setPosition: vi.fn(),
  setEulerAngles: vi.fn(),
};

const mockAsset = {
  resource: {
    instantiate: vi.fn().mockReturnValue(mockEntity),
  },
};

// PlayCanvasのグローバルモック
vi.mock('playcanvas', () => ({
  Application: vi.fn().mockImplementation(() => mockApp),
  Entity: vi.fn().mockImplementation(() => mockEntity),
  Mouse: vi.fn(),
  TouchDevice: vi.fn(),
  Keyboard: vi.fn(),
  Vec3: vi.fn().mockImplementation((x = 0, y = 0, z = 0) => ({ x, y, z })),
  Color: vi.fn().mockImplementation((r = 1, g = 1, b = 1, a = 1) => ({ r, g, b, a })),
  FILLMODE_FILL_WINDOW: 'FILLMODE_FILL_WINDOW',
  RESOLUTION_AUTO: 'RESOLUTION_AUTO',
}));

describe('useSplat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // DOM環境のセットアップ
    Object.defineProperty(window, 'HTMLCanvasElement', {
      value: class MockHTMLCanvasElement {
        getContext() {
          return {
            fillRect: vi.fn(),
            clearRect: vi.fn(),
            getImageData: vi.fn(),
            putImageData: vi.fn(),
            createImageData: vi.fn(),
            setTransform: vi.fn(),
            drawImage: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            closePath: vi.fn(),
            stroke: vi.fn(),
            fill: vi.fn(),
          };
        }
        toDataURL() {
          return '';
        }
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初期状態では loading が true で error が null である', () => {
    const { result } = renderHook(() => useSplat('test-url.splat'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.canvasRef.current).toBe(null);
  });

  it('有効なSplatファイルURLが提供された場合、正常に読み込まれる', async () => {
    // アセット読み込み成功をモック
    mockApp.assets.loadFromUrl.mockImplementation((url, type, callback) => {
      setTimeout(() => callback(null, mockAsset), 100);
    });

    const { result } = renderHook(() => useSplat('test-url.splat'));

    // 初期状態の確認
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    // 読み込み完了を待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(null);
    expect(mockApp.assets.loadFromUrl).toHaveBeenCalledWith(
      'test-url.splat',
      'gsplat',
      expect.any(Function)
    );
  });

  it('無効なファイルURLの場合、エラーが設定される', async () => {
    // アセット読み込み失敗をモック
    mockApp.assets.loadFromUrl.mockImplementation((url, type, callback) => {
      setTimeout(() => callback('Failed to load splat file', null), 100);
    });

    const { result } = renderHook(() => useSplat('invalid-url.splat'));

    // エラー発生を待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load splat file');
  });

  it('空のURLが提供された場合、エラーが設定される', () => {
    const { result } = renderHook(() => useSplat(''));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Splat file URL is required');
  });

  it('コンポーネントがアンマウントされた場合、PlayCanvasアプリが破棄される', async () => {
    mockApp.assets.loadFromUrl.mockImplementation((url, type, callback) => {
      setTimeout(() => callback(null, mockAsset), 100);
    });

    const { unmount } = renderHook(() => useSplat('test-url.splat'));

    // アプリが初期化されるまで待機
    await waitFor(() => {
      expect(mockApp.start).toHaveBeenCalled();
    });

    unmount();

    expect(mockApp.destroy).toHaveBeenCalled();
  });

  it('URLが変更された場合、新しいファイルが読み込まれる', async () => {
    mockApp.assets.loadFromUrl.mockImplementation((url, type, callback) => {
      setTimeout(() => callback(null, mockAsset), 100);
    });

    const { result, rerender } = renderHook(
      ({ url }) => useSplat(url),
      { initialProps: { url: 'first-url.splat' } }
    );

    // 最初の読み込み完了を待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // URLを変更
    rerender({ url: 'second-url.splat' });

    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(mockApp.assets.loadFromUrl).toHaveBeenCalledWith(
        'second-url.splat',
        'gsplat',
        expect.any(Function)
      );
    });
  });

  it('ネットワークエラーの場合、適切なエラーメッセージが設定される', async () => {
    mockApp.assets.loadFromUrl.mockImplementation((url, type, callback) => {
      setTimeout(() => callback('Network error', null), 100);
    });

    const { result } = renderHook(() => useSplat('test-url.splat'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });

  it('サポートされていないファイル形式の場合、エラーが設定される', () => {
    const { result } = renderHook(() => useSplat('test-file.obj'));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Unsupported file format. Only .splat and .ply files are supported.');
  });

  it('canvasRefが正しく設定される', () => {
    const { result } = renderHook(() => useSplat('test-url.splat'));

    expect(result.current.canvasRef).toBeDefined();
    expect(typeof result.current.canvasRef).toBe('object');
  });
}); 