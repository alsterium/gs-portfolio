import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GSViewer } from './GSViewer';
import { useSplat } from '../../lib/hooks/useSplat';

// useSplat hookのモック
vi.mock('../../lib/hooks/useSplat', () => ({
  useSplat: vi.fn(),
}));

const mockUseSplat = vi.mocked(useSplat);

describe('GSViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ローディング状態を表示する', () => {
    mockUseSplat.mockReturnValue({
      canvasRef: { current: null },
      loading: true,
      error: null,
    });

    render(<GSViewer fileUrl="test-file.splat" />);
    
    expect(screen.getByText('3Dモデルを読み込み中...')).toBeInTheDocument();
  });

  it('エラー状態を表示する', () => {
    mockUseSplat.mockReturnValue({
      canvasRef: { current: null },
      loading: false,
      error: 'ファイルの読み込みに失敗しました',
    });

    render(<GSViewer fileUrl="invalid-file.splat" />);
    
    expect(screen.getByText('3Dモデルの読み込みに失敗しました')).toBeInTheDocument();
    expect(screen.getByText('ファイルの読み込みに失敗しました')).toBeInTheDocument();
  });

  it('PlayCanvasアプリが正常に表示される', () => {
    const mockCanvas = document.createElement('canvas');
    mockUseSplat.mockReturnValue({
      canvasRef: { current: mockCanvas },
      loading: false,
      error: null,
    });

    render(<GSViewer fileUrl="test-file.splat" />);
    
    expect(screen.getByRole('application')).toBeInTheDocument();
    expect(screen.getByLabelText('3D Gaussian Splattingビューアー')).toBeInTheDocument();
  });

  it('カスタムクラス名が適用される', () => {
    mockUseSplat.mockReturnValue({
      canvasRef: { current: null },
      loading: false,
      error: null,
    });

    render(<GSViewer fileUrl="test-file.splat" className="custom-viewer" />);
    
    const container = screen.getByTestId('gs-viewer');
    expect(container).toHaveClass('custom-viewer');
  });

  it('ファイルURLが変更されたときにuseSplatが呼び出される', () => {
    mockUseSplat.mockReturnValue({
      canvasRef: { current: null },
      loading: false,
      error: null,
    });

    const { rerender } = render(<GSViewer fileUrl="file1.splat" />);
    expect(mockUseSplat).toHaveBeenCalledWith('file1.splat');

    rerender(<GSViewer fileUrl="file2.splat" />);
    expect(mockUseSplat).toHaveBeenCalledWith('file2.splat');
  });
}); 