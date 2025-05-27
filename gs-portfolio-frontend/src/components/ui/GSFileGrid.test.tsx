import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router';
import { GSFileGrid } from './GSFileGrid';
import type { GSFile } from '@/types';

// gsFilesモジュールのモック
vi.mock('@/lib/gsFiles', () => ({
  getGSFileThumbnailUrl: vi.fn((id: number) => `/api/gs-files/${id}/thumbnail`),
}));

const mockFiles: GSFile[] = [
  {
    id: 1,
    filename: 'test1.splat',
    display_name: 'テストファイル1',
    file_size: 1048576,
    file_path: '/files/test1.splat',
    mime_type: 'application/octet-stream',
    upload_date: '2024-01-15T10:30:00Z',
    updated_date: '2024-01-15T10:30:00Z',
    is_active: true,
  },
  {
    id: 2,
    filename: 'test2.splat',
    display_name: 'テストファイル2',
    file_size: 2097152,
    file_path: '/files/test2.splat',
    mime_type: 'application/octet-stream',
    upload_date: '2024-01-16T10:30:00Z',
    updated_date: '2024-01-16T10:30:00Z',
    is_active: true,
  },
];

describe('GSFileGrid', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('ローディング状態を表示する', () => {
    renderWithRouter(<GSFileGrid loading={true} />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('ファイルを読み込み中...')).toBeInTheDocument();
  });

  it('エラー状態を表示する', () => {
    const errorMessage = 'ファイルの読み込みに失敗しました';
    renderWithRouter(<GSFileGrid error={errorMessage} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('読み込みエラー')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('ファイルがない場合の空状態を表示する', () => {
    renderWithRouter(<GSFileGrid files={[]} />);
    
    expect(screen.getByText('ファイルがありません')).toBeInTheDocument();
    expect(screen.getByText('Gaussian Splattingファイルがまだアップロードされていません。')).toBeInTheDocument();
  });

  it('ファイルが未定義の場合も空状態を表示する', () => {
    renderWithRouter(<GSFileGrid />);
    
    expect(screen.getByText('ファイルがありません')).toBeInTheDocument();
  });

  it('ファイル一覧を正しく表示する', () => {
    renderWithRouter(<GSFileGrid files={mockFiles} />);
    
    expect(screen.getByText('テストファイル1')).toBeInTheDocument();
    expect(screen.getByText('テストファイル2')).toBeInTheDocument();
    
    // グリッドレイアウトが適用されていることを確認
    const grid = document.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
  });

  it('カスタムクラス名が適用される', () => {
    const { container } = renderWithRouter(
      <GSFileGrid files={mockFiles} className="custom-grid-class" />
    );
    
    const gridContainer = container.firstChild;
    expect(gridContainer).toHaveClass('custom-grid-class');
  });

  it('ローディング状態が優先される', () => {
    renderWithRouter(
      <GSFileGrid 
        files={mockFiles} 
        loading={true} 
        error="エラーメッセージ" 
      />
    );
    
    expect(screen.getByText('ファイルを読み込み中...')).toBeInTheDocument();
    expect(screen.queryByText('エラーメッセージ')).not.toBeInTheDocument();
    expect(screen.queryByText('テストファイル1')).not.toBeInTheDocument();
  });

  it('エラー状態がファイル表示より優先される', () => {
    const errorMessage = 'エラーが発生しました';
    renderWithRouter(
      <GSFileGrid 
        files={mockFiles} 
        error={errorMessage} 
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText('テストファイル1')).not.toBeInTheDocument();
  });
}); 