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

// APIのモック
vi.mock('../lib/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

// gsFilesモジュールのモック
vi.mock('../lib/gsFiles', () => ({
  getGSFile: vi.fn(),
  getGSFileDownloadUrl: vi.fn(),
}));

// GSViewerコンポーネントのモック
vi.mock('../components/ui/GSViewer', () => ({
  GSViewer: ({ fileUrl }: { fileUrl: string }) => (
    <div data-testid="gs-viewer">
      <p>3Dビューアーを準備中...</p>
      <p>PlayCanvas Engineを使用したGaussian Splattingビューアー</p>
      <p>ファイル: {fileUrl}</p>
    </div>
  ),
}));

const mockUseParams = vi.mocked(await import('react-router')).useParams;

const mockFile = {
  id: 1,
  filename: 'test.splat',
  display_name: 'テストファイル',
  description: 'テスト用のファイルです',
  file_size: 1024000,
  file_path: 'files/test.splat',
  mime_type: 'application/octet-stream',
  upload_date: '2024-01-01T00:00:00Z',
  updated_date: '2024-01-01T00:00:00Z',
  is_active: true,
};

describe('FileDetailPage', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('IDが指定されている場合は詳細ページを表示する', async () => {
    const { getGSFile, getGSFileDownloadUrl } = await import('../lib/gsFiles');
    vi.mocked(getGSFile).mockResolvedValue(mockFile);
    vi.mocked(getGSFileDownloadUrl).mockReturnValue('http://example.com/test.splat');
    
    mockUseParams.mockReturnValue({ id: '1' });
    
    renderWithRouter(<FileDetailPage />);
    
    // ファイル名（display_name）がh1タグで表示される
    await screen.findByText('テストファイル');
    expect(screen.getByTestId('gs-viewer')).toBeInTheDocument();
  });

  it('IDが指定されていない場合はエラーメッセージを表示する', () => {
    mockUseParams.mockReturnValue({});
    
    renderWithRouter(<FileDetailPage />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('ファイルIDが指定されていません。')).toBeInTheDocument();
  });

  it('ファイル情報セクションが正しく表示される', async () => {
    const { getGSFile, getGSFileDownloadUrl } = await import('../lib/gsFiles');
    vi.mocked(getGSFile).mockResolvedValue(mockFile);
    vi.mocked(getGSFileDownloadUrl).mockReturnValue('http://example.com/test.splat');
    
    mockUseParams.mockReturnValue({ id: '1' });
    
    renderWithRouter(<FileDetailPage />);
    
    // 実際に表示されるラベルテキストを確認
    await screen.findByText('ファイル名');
    expect(screen.getByText('ファイルサイズ')).toBeInTheDocument();
    expect(screen.getByText('アップロード日')).toBeInTheDocument();
    expect(screen.getByText('説明')).toBeInTheDocument();
  });

  it('3Dビューアーエリアが表示される', async () => {
    const { getGSFile, getGSFileDownloadUrl } = await import('../lib/gsFiles');
    vi.mocked(getGSFile).mockResolvedValue(mockFile);
    vi.mocked(getGSFileDownloadUrl).mockReturnValue('http://example.com/test.splat');
    
    mockUseParams.mockReturnValue({ id: '1' });
    
    renderWithRouter(<FileDetailPage />);
    
    await screen.findByText('PlayCanvas Engineを使用したGaussian Splattingビューアー');
    expect(screen.getByTestId('gs-viewer')).toBeInTheDocument();
  });
}); 