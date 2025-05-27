import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GSViewer } from './GSViewer';
import type { GSFile } from '@/types';

// PlayCanvas Reactのモック
vi.mock('@playcanvas/react', () => ({
  Application: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="playcanvas-application">{children}</div>
  ),
  Entity: ({ children, name }: { children?: React.ReactNode; name: string }) => (
    <div data-testid={`entity-${name}`}>{children}</div>
  ),
}));

vi.mock('@playcanvas/react/components', () => ({
  Render: ({ type }: { type: string }) => <div data-testid={`render-${type}`} />,
  Camera: () => <div data-testid="camera" />,
  Light: ({ type }: { type: string }) => <div data-testid={`light-${type}`} />,
  GSplat: ({ asset }: { asset: any }) => <div data-testid="gsplat" data-asset={asset ? 'loaded' : 'null'} />,
}));

const mockUseApp = vi.fn();
const mockUseSplat = vi.fn();

vi.mock('@playcanvas/react/hooks', () => ({
  useApp: mockUseApp,
  useSplat: mockUseSplat,
}));

describe('GSViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトでアプリが利用可能な状態にする
    mockUseApp.mockReturnValue({ scene: { root: {} } });
    // デフォルトでSplatアセットは読み込み中
    mockUseSplat.mockReturnValue({ asset: null });
  });

  it('PlayCanvasアプリケーションが正常に表示される', () => {
    render(<GSViewer fileUrl="test-file.splat" />);
    
    expect(screen.getByTestId('playcanvas-application')).toBeInTheDocument();
    expect(screen.getByTestId('entity-camera')).toBeInTheDocument();
    expect(screen.getByTestId('entity-directional-light')).toBeInTheDocument();
    expect(screen.getByTestId('entity-ambient-light')).toBeInTheDocument();
    // アセット読み込み中はプレースホルダーが表示される
    expect(screen.getByTestId('entity-placeholder-box')).toBeInTheDocument();
  });

  it('カスタムクラス名が適用される', () => {
    render(<GSViewer fileUrl="test-file.splat" className="custom-viewer" />);
    
    const container = screen.getByTestId('gs-viewer');
    expect(container).toHaveClass('custom-viewer');
  });

  it('初期状態でローディングが表示される', () => {
    // useAppがnullを返すようにモック（アプリ初期化前の状態）
    mockUseApp.mockReturnValue(null);
    
    render(<GSViewer fileUrl="test-file.splat" />);
    
    expect(screen.getByText('3Dモデルを読み込み中...')).toBeInTheDocument();
  });

  it('ファイル情報が渡される', () => {
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

    render(<GSViewer fileUrl="file1.splat" fileInfo={mockFileInfo} />);
    
    expect(screen.getByTestId('gs-viewer')).toBeInTheDocument();
    expect(screen.getByText('ファイル: file1.splat')).toBeInTheDocument();
  });

  it('PlayCanvas Reactコンポーネントが正しく配置される', () => {
    render(<GSViewer fileUrl="test-file.splat" />);
    
    // カメラコンポーネント
    expect(screen.getByTestId('camera')).toBeInTheDocument();
    
    // ライトコンポーネント
    expect(screen.getByTestId('light-directional')).toBeInTheDocument();
    expect(screen.getByTestId('light-omni')).toBeInTheDocument();
    
    // レンダーコンポーネント（プレースホルダーボックス）
    expect(screen.getByTestId('render-box')).toBeInTheDocument();
  });

  it('Splatアセットが読み込まれたときにGSplatコンポーネントが表示される', () => {
    // Splatアセットが読み込まれた状態をモック
    mockUseSplat.mockReturnValue({ asset: { id: 'test-asset' } });
    
    render(<GSViewer fileUrl="test-file.splat" />);
    
    // GSplatコンポーネントが表示される
    expect(screen.getByTestId('gsplat')).toBeInTheDocument();
    expect(screen.getByTestId('gsplat')).toHaveAttribute('data-asset', 'loaded');
    
    // プレースホルダーは表示されない
    expect(screen.queryByTestId('entity-placeholder-box')).not.toBeInTheDocument();
  });

  it('操作説明が表示される', () => {
    render(<GSViewer fileUrl="test-file.splat" />);
    
    expect(screen.getByText('PlayCanvas Reactを使用したGaussian Splattingビューアー')).toBeInTheDocument();
    expect(screen.getByText('操作方法: 左クリック+ドラッグで回転 | 右クリック+ドラッグでパン | ホイールでズーム')).toBeInTheDocument();
  });
}); 