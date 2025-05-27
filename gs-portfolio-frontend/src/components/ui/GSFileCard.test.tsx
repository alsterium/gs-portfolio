import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter, MemoryRouter } from 'react-router';
import { GSFileCard } from './GSFileCard';
import type { GSFile } from '@/types';
import userEvent from '@testing-library/user-event';

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

  it('モダンなカードデザインが適用される', () => {
    const { container } = render(
      <MemoryRouter>
        <GSFileCard file={mockFile} />
      </MemoryRouter>
    );
    
    const card = container.querySelector('[data-testid="gs-file-card"]');
    expect(card).toHaveClass('rounded-xl');
    expect(card).toHaveClass('transition-all');
    expect(card).toHaveClass('duration-300');
  });

  it('ホバー効果が適用される', () => {
    const { container } = render(
      <MemoryRouter>
        <GSFileCard file={mockFile} />
      </MemoryRouter>
    );
    
    const card = container.querySelector('[data-testid="gs-file-card"]');
    expect(card).toHaveClass('hover:scale-105');
    expect(card).toHaveClass('hover:shadow-xl');
  });

  it('アニメーション効果が適用される', () => {
    const { container } = render(
      <MemoryRouter>
        <GSFileCard file={mockFile} />
      </MemoryRouter>
    );
    
    const card = container.querySelector('[data-testid="gs-file-card"]');
    expect(card).toHaveClass('animate-fade-in');
  });
});

describe('GSFileCard スタイリング', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('統一されたデザインシステムのクラスが適用されている', () => {
    const mockFile: GSFile = {
      id: 1,
      filename: 'test.splat',
      display_name: 'テストファイル',
      description: 'テスト用の説明',
      file_size: 1024,
      file_path: 'test.splat',
      thumbnail_path: undefined,
      mime_type: 'application/octet-stream',
      upload_date: '2024-01-01T00:00:00Z',
      updated_date: '2024-01-01T00:00:00Z',
      is_active: true
    };

    const { container } = renderWithRouter(<GSFileCard file={mockFile} />);
    
    const cardElement = screen.getByRole('link');
    const modernCard = container.querySelector('[data-testid="gs-file-card"]');
    
    // 統一されたカードスタイルが適用されている
    expect(cardElement).toHaveClass('group');
    expect(cardElement).toHaveClass('block');
    expect(modernCard).toHaveClass('rounded-xl');
    expect(modernCard).toHaveClass('border');
    expect(modernCard).toHaveClass('transition-all');
    expect(modernCard).toHaveClass('duration-300');
  });

  it('GSカラーパレットが適用されている', () => {
    const mockFile: GSFile = {
      id: 1,
      filename: 'test.splat',
      display_name: 'テストファイル',
      description: 'テスト用の説明',
      file_size: 1024,
      file_path: 'test.splat',
      thumbnail_path: undefined,
      mime_type: 'application/octet-stream',
      upload_date: '2024-01-01T00:00:00Z',
      updated_date: '2024-01-01T00:00:00Z',
      is_active: true
    };

    renderWithRouter(<GSFileCard file={mockFile} />);
    
    const titleElement = screen.getByText('テストファイル');
    
    // GSカラーパレットのホバー効果が適用されている
    expect(titleElement).toHaveClass('group-hover:text-gs-primary');
  });

  it('アニメーション効果が適用されている', () => {
    const mockFile: GSFile = {
      id: 1,
      filename: 'test.splat',
      display_name: 'テストファイル',
      description: 'テスト用の説明',
      file_size: 1024,
      file_path: 'test.splat',
      thumbnail_path: 'thumbnail.jpg',
      mime_type: 'application/octet-stream',
      upload_date: '2024-01-01T00:00:00Z',
      updated_date: '2024-01-01T00:00:00Z',
      is_active: true
    };

    renderWithRouter(<GSFileCard file={mockFile} />);
    
    const imageElement = screen.getByAltText('テストファイルのサムネイル');
    
    // スケールアニメーションが適用されている
    expect(imageElement).toHaveClass('transition-transform');
    expect(imageElement).toHaveClass('group-hover:scale-105');
  });

  it('レスポンシブデザインが適用されている', () => {
    const mockFile: GSFile = {
      id: 1,
      filename: 'test.splat',
      display_name: 'テストファイル',
      description: 'テスト用の説明',
      file_size: 1024,
      file_path: 'test.splat',
      thumbnail_path: undefined,
      mime_type: 'application/octet-stream',
      upload_date: '2024-01-01T00:00:00Z',
      updated_date: '2024-01-01T00:00:00Z',
      is_active: true
    };

    const { container } = renderWithRouter(<GSFileCard file={mockFile} />);
    
    const modernCard = container.querySelector('[data-testid="gs-file-card"]');
    
    // ModernCardのパディングが適用されている
    expect(modernCard).toHaveClass('p-6'); // medium size default
  });
});

describe('GSFileCard アクセシビリティ', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('キーボードナビゲーションが正しく動作する', async () => {
    const mockFile: GSFile = {
      id: 1,
      filename: 'test.splat',
      display_name: 'テストファイル',
      description: 'テスト用の説明',
      file_size: 1024,
      file_path: 'test.splat',
      thumbnail_path: undefined,
      mime_type: 'application/octet-stream',
      upload_date: '2024-01-01T00:00:00Z',
      updated_date: '2024-01-01T00:00:00Z',
      is_active: true
    };

    const user = userEvent.setup();
    renderWithRouter(<GSFileCard file={mockFile} />);
    
    const cardLink = screen.getByRole('link');
    
    // Tabキーでフォーカス可能
    await user.tab();
    expect(cardLink).toHaveFocus();
    
    // Enterキーで活性化可能
    await user.keyboard('{Enter}');
    // リンクの動作確認（実際のナビゲーションはテスト環境では発生しない）
  });

  it('適切なARIAラベルが設定されている', () => {
    const mockFile: GSFile = {
      id: 1,
      filename: 'test.splat',
      display_name: 'テストファイル',
      description: 'テスト用の説明',
      file_size: 1024,
      file_path: 'test.splat',
      thumbnail_path: 'thumbnail.jpg',
      mime_type: 'application/octet-stream',
      upload_date: '2024-01-01T00:00:00Z',
      updated_date: '2024-01-01T00:00:00Z',
      is_active: true
    };

    renderWithRouter(<GSFileCard file={mockFile} />);
    
    const cardLink = screen.getByRole('link');
    
    // アクセシブルな名前が設定されている
    expect(cardLink).toHaveAccessibleName('テストファイル');
    
    // 画像に適切なalt属性が設定されている
    const thumbnail = screen.getByAltText('テストファイルのサムネイル');
    expect(thumbnail).toBeInTheDocument();
  });

  it('フォーカス状態のスタイリングが適用されている', () => {
    const mockFile: GSFile = {
      id: 1,
      filename: 'test.splat',
      display_name: 'テストファイル',
      description: 'テスト用の説明',
      file_size: 1024,
      file_path: 'test.splat',
      thumbnail_path: undefined,
      mime_type: 'application/octet-stream',
      upload_date: '2024-01-01T00:00:00Z',
      updated_date: '2024-01-01T00:00:00Z',
      is_active: true
    };

    const { container } = renderWithRouter(<GSFileCard file={mockFile} />);
    
    const modernCard = container.querySelector('[data-testid="gs-file-card"]');
    
    // ModernCardのフォーカス可視化のスタイルが適用されている
    expect(modernCard).toHaveClass('focus-visible:outline-none');
    expect(modernCard).toHaveClass('focus-visible:ring-2');
    expect(modernCard).toHaveClass('focus-visible:ring-gs-primary');
  });

  it('スクリーンリーダー向けの情報が適切に提供されている', () => {
    const mockFile: GSFile = {
      id: 1,
      filename: 'test.splat',
      display_name: 'テストファイル',
      description: 'テスト用の説明',
      file_size: 1024,
      file_path: 'test.splat',
      thumbnail_path: undefined,
      mime_type: 'application/octet-stream',
      upload_date: '2024-01-01T00:00:00Z',
      updated_date: '2024-01-01T00:00:00Z',
      is_active: true
    };

    renderWithRouter(<GSFileCard file={mockFile} />);
    
    // ファイル情報がスクリーンリーダーで読み上げ可能
    expect(screen.getByText('テストファイル')).toBeInTheDocument();
    expect(screen.getByText('テスト用の説明')).toBeInTheDocument();
    expect(screen.getByText('1.0 KB')).toBeInTheDocument();
    expect(screen.getByText('2024年1月1日')).toBeInTheDocument();
  });
}); 