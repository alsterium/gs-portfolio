import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router';
import { GSFileGrid } from './GSFileGrid';
import type { GSFile } from '@/types';

const mockFiles: GSFile[] = [
  {
    id: 'file-1',
    displayName: 'テストファイル1',
    originalName: 'test1.splat',
    fileSize: 1048576,
    filePath: '/files/test1.splat',
    uploadDate: '2024-01-15T10:30:00Z',
    updatedDate: '2024-01-15T10:30:00Z',
  },
  {
    id: 'file-2',
    displayName: 'テストファイル2',
    originalName: 'test2.splat',
    fileSize: 2097152,
    filePath: '/files/test2.splat',
    uploadDate: '2024-01-16T10:30:00Z',
    updatedDate: '2024-01-16T10:30:00Z',
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