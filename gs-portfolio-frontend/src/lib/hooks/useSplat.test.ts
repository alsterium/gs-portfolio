import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSplat } from './useSplat';

// PlayCanvasのモック - 基本的な機能のみ
vi.mock('playcanvas', () => ({
  Application: vi.fn(() => ({
    setCanvasFillMode: vi.fn(),
    setCanvasResolution: vi.fn(),
    start: vi.fn(),
    destroy: vi.fn(),
    scene: { root: { addChild: vi.fn() } },
    assets: { loadFromUrl: vi.fn() },
  })),
  Entity: vi.fn(() => ({
    addComponent: vi.fn(),
    setPosition: vi.fn(),
    setEulerAngles: vi.fn(),
  })),
  Mouse: vi.fn(),
  TouchDevice: vi.fn(),
  Keyboard: vi.fn(),
  Color: vi.fn(),
  Vec3: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
  FILLMODE_FILL_WINDOW: 'FILLMODE_FILL_WINDOW',
  RESOLUTION_AUTO: 'RESOLUTION_AUTO',
  LIGHTTYPE_DIRECTIONAL: 'LIGHTTYPE_DIRECTIONAL',
  LIGHTTYPE_POINT: 'LIGHTTYPE_POINT',
}));

describe.skip('useSplat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // 基本的なDOM要素のモック
    const mockCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      style: { cursor: '' },
      width: 800,
      height: 600,
    } as any;

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

  it('有効な.splatファイルが受け入れられる', () => {
    const { result } = renderHook(() => useSplat('test.splat'));
    
    expect(result.current.error).toBe(null);
  });

  it('有効な.plyファイルが受け入れられる', () => {
    const { result } = renderHook(() => useSplat('test.ply'));
    
    expect(result.current.error).toBe(null);
  });
}); 