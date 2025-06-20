import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSplat } from './useSplat';
import type { GSFile } from '@/types';

// PlayCanvasのモック - 基本的な機能のみ
vi.mock('playcanvas', () => ({
  Application: vi.fn(() => ({
    setCanvasFillMode: vi.fn(),
    setCanvasResolution: vi.fn(),
    resizeCanvas: vi.fn(),
    start: vi.fn(),
    destroy: vi.fn(),
    scene: { root: { addChild: vi.fn() } },
    assets: { loadFromUrl: vi.fn() },
  })),
  Entity: vi.fn(() => ({
    addComponent: vi.fn(),
    setPosition: vi.fn(),
    setLocalScale: vi.fn(),
    setEulerAngles: vi.fn(),
  })),
  StandardMaterial: vi.fn(() => ({
    diffuse: new (vi.fn())(),
    metalness: 0,
    gloss: 0,
    update: vi.fn(),
  })),
  Mouse: vi.fn(),
  TouchDevice: vi.fn(),
  Keyboard: vi.fn(),
  Color: vi.fn(),
  Vec3: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
  FILLMODE_NONE: 'FILLMODE_NONE',
  RESOLUTION_FIXED: 'RESOLUTION_FIXED',
  LIGHTTYPE_DIRECTIONAL: 'LIGHTTYPE_DIRECTIONAL',
  LIGHTTYPE_POINT: 'LIGHTTYPE_POINT',
}));

describe('useSplat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // 基本的なDOM要素のモック
    const mockCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      style: { cursor: '' },
      width: 800,
      height: 600,
      getBoundingClientRect: vi.fn(() => ({ width: 800, height: 600 })),
      getContext: vi.fn(() => ({})), // WebGLコンテキストのモック
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

  it('ファイル情報からファイル形式を検証する', () => {
    const mockFileInfo: GSFile = {
      id: 1,
      filename: 'test.splat',
      display_name: 'Test File',
      file_size: 1024,
      file_path: 'files/test.splat',
      mime_type: 'application/octet-stream',
      upload_date: '2024-01-01T00:00:00Z',
      updated_date: '2024-01-01T00:00:00Z',
      is_active: true,
    };

    const { result } = renderHook(() => useSplat('/api/gs-files/1/file', mockFileInfo));
    
    expect(result.current.error).toBe(null);
  });

  it('ファイル情報で無効な形式の場合エラーが設定される', () => {
    const mockFileInfo: GSFile = {
      id: 1,
      filename: 'test.txt',
      display_name: 'Test File',
      file_size: 1024,
      file_path: 'files/test.txt',
      mime_type: 'text/plain',
      upload_date: '2024-01-01T00:00:00Z',
      updated_date: '2024-01-01T00:00:00Z',
      is_active: true,
    };

    const { result } = renderHook(() => useSplat('/api/gs-files/1/file', mockFileInfo));
    
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

  it('ファイル情報がある場合はファイル名から拡張子を取得する', () => {
    const mockFileInfo: GSFile = {
      id: 1,
      filename: 'model.ply',
      display_name: 'PLY Model',
      file_size: 2048,
      file_path: 'files/model.ply',
      mime_type: 'application/ply',
      upload_date: '2024-01-01T00:00:00Z',
      updated_date: '2024-01-01T00:00:00Z',
      is_active: true,
    };

    const { result } = renderHook(() => useSplat('/api/gs-files/1/file', mockFileInfo));
    
    expect(result.current.error).toBe(null);
  });
}); 