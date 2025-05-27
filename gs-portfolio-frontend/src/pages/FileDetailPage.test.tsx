import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router';
import { FileDetailPage } from './FileDetailPage';

// useParamsのモック
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

const mockUseParams = vi.mocked(await import('react-router')).useParams;

describe('FileDetailPage', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('IDが指定されている場合は詳細ページを表示する', () => {
    mockUseParams.mockReturnValue({ id: 'test-file-id' });
    
    renderWithRouter(<FileDetailPage />);
    
    expect(screen.getByText('Gaussian Splatting ファイル詳細')).toBeInTheDocument();
    expect(screen.getByText('ファイルID: test-file-id')).toBeInTheDocument();
    expect(screen.getByText('3Dビューアーを準備中...')).toBeInTheDocument();
    expect(screen.getByText('ファイル情報')).toBeInTheDocument();
  });

  it('IDが指定されていない場合はエラーメッセージを表示する', () => {
    mockUseParams.mockReturnValue({});
    
    renderWithRouter(<FileDetailPage />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('ファイルIDが指定されていません。')).toBeInTheDocument();
  });

  it('ファイル情報セクションが正しく表示される', () => {
    mockUseParams.mockReturnValue({ id: 'test-file-id' });
    
    renderWithRouter(<FileDetailPage />);
    
    expect(screen.getByText('表示名')).toBeInTheDocument();
    expect(screen.getByText('ファイルサイズ')).toBeInTheDocument();
    expect(screen.getByText('アップロード日')).toBeInTheDocument();
    expect(screen.getByText('説明')).toBeInTheDocument();
  });

  it('3Dビューアーエリアが表示される', () => {
    mockUseParams.mockReturnValue({ id: 'test-file-id' });
    
    renderWithRouter(<FileDetailPage />);
    
    expect(screen.getByText('PlayCanvas Engineを使用したGaussian Splattingビューアーを実装予定')).toBeInTheDocument();
  });
}); 