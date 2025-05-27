import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router';
import { GSFileCard } from './GSFileCard';
import type { GSFile } from '@/types';

// gsFilesモジュールのモック
vi.mock('@/lib/gsFiles', () => ({
  getGSFileThumbnailUrl: vi.fn((id: number) => `/api/gs-files/${id}/thumbnail`),
}));

const mockFile: GSFile = {
  id: 1,
  filename: 'test.splat',
  display_name: 'テストファイル',
  file_size: 1048576, // 1MB
  file_path: '/files/test.splat',
  thumbnail_path: '/thumbnails/test.jpg',
  mime_type: 'application/octet-stream',
  upload_date: '2024-01-15T10:30:00Z',
  updated_date: '2024-01-15T10:30:00Z',
  is_active: true,
  description: 'これはテスト用のGaussian Splattingファイルです。',
};

const mockFileWithoutThumbnail: GSFile = {
  ...mockFile,
  id: 2,
  display_name: 'サムネイルなしファイル',
  thumbnail_path: undefined,
  description: undefined,
};

describe('GSFileCard', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('ファイル情報が正しく表示される', () => {
    renderWithRouter(<GSFileCard file={mockFile} />);
    
    expect(screen.getByText('テストファイル')).toBeInTheDocument();
    expect(screen.getByText('これはテスト用のGaussian Splattingファイルです。')).toBeInTheDocument();
    expect(screen.getByText('1.0 MB')).toBeInTheDocument();
    expect(screen.getByText('2024年1月15日')).toBeInTheDocument();
  });

  it('サムネイルがある場合は画像を表示する', () => {
    renderWithRouter(<GSFileCard file={mockFile} />);
    
    const thumbnail = screen.getByAltText('テストファイルのサムネイル');
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveAttribute('src', '/api/gs-files/1/thumbnail');
  });

  it('サムネイルがない場合はBoxアイコンを表示する', () => {
    renderWithRouter(<GSFileCard file={mockFileWithoutThumbnail} />);
    
    expect(screen.queryByAltText(/のサムネイル/)).not.toBeInTheDocument();
    // Boxアイコンが表示されることを確認（lucide-reactのアイコンはsvgとして描画される）
    const boxIcon = document.querySelector('svg');
    expect(boxIcon).toBeInTheDocument();
  });

  it('説明がない場合は説明文を表示しない', () => {
    renderWithRouter(<GSFileCard file={mockFileWithoutThumbnail} />);
    
    expect(screen.queryByText('これはテスト用のGaussian Splattingファイルです。')).not.toBeInTheDocument();
  });

  it('正しいリンクが設定される', () => {
    renderWithRouter(<GSFileCard file={mockFile} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/view/1');
  });

  it('ファイルサイズが正しくフォーマットされる', () => {
    const largeFile: GSFile = {
      ...mockFile,
      file_size: 1073741824, // 1GB
    };
    
    renderWithRouter(<GSFileCard file={largeFile} />);
    expect(screen.getByText('1.0 GB')).toBeInTheDocument();
  });

  it('カスタムクラス名が適用される', () => {
    const { container } = renderWithRouter(
      <GSFileCard file={mockFile} className="custom-class" />
    );
    
    const link = container.querySelector('a');
    expect(link).toHaveClass('custom-class');
  });
}); 