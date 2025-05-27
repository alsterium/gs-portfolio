import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { AdminFilesPage } from './AdminFilesPage';

// モック関数
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// APIクライアントのモック
vi.mock('../lib/api', () => ({
  getGSFiles: vi.fn(),
  deleteGSFile: vi.fn(),
}));

// window.confirmのモック
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(() => true),
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

const mockFiles = [
  {
    id: 1,
    filename: 'test1.splat',
    display_name: 'テストファイル1',
    description: 'テスト用のファイルです',
    file_size: 1024000,
    file_path: 'files/test1.splat',
    mime_type: 'application/octet-stream',
    upload_date: '2024-01-01T00:00:00Z',
    updated_date: '2024-01-01T00:00:00Z',
    is_active: true,
  },
  {
    id: 2,
    filename: 'test2.ply',
    display_name: 'テストファイル2',
    description: undefined,
    file_size: 2048000,
    file_path: 'files/test2.ply',
    mime_type: 'application/octet-stream',
    upload_date: '2024-01-02T00:00:00Z',
    updated_date: '2024-01-02T00:00:00Z',
    is_active: true,
  },
];

describe('AdminFilesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ファイル管理ページが正しく表示される', async () => {
    const { getGSFiles } = await import('../lib/api');
    vi.mocked(getGSFiles).mockResolvedValue({
      data: mockFiles,
      pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
    });

    renderWithRouter(<AdminFilesPage />);
    
    expect(screen.getByText('ファイル管理')).toBeInTheDocument();
    expect(screen.getByText('新規アップロード')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('テストファイル1')).toBeInTheDocument();
      expect(screen.getByText('テストファイル2')).toBeInTheDocument();
    });
  });

  it('ファイル削除が正しく動作する', async () => {
    const { getGSFiles, deleteGSFile } = await import('../lib/api');
    vi.mocked(getGSFiles).mockResolvedValue({
      data: mockFiles,
      pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
    });
    vi.mocked(deleteGSFile).mockResolvedValue(undefined);

    renderWithRouter(<AdminFilesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('テストファイル1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteGSFile).toHaveBeenCalledWith(1);
    });
  });

  it('ローディング状態が正しく表示される', async () => {
    const { getGSFiles } = await import('../lib/api');
    vi.mocked(getGSFiles).mockImplementation(() => new Promise(() => {})); // 永続的にpending

    renderWithRouter(<AdminFilesPage />);
    
    expect(screen.getAllByText('読み込み中...')).toHaveLength(2); // スピナーとテキストの両方
  });

  it('エラー状態が正しく表示される', async () => {
    const { getGSFiles } = await import('../lib/api');
    vi.mocked(getGSFiles).mockRejectedValue(new Error('ファイルの取得に失敗しました'));

    renderWithRouter(<AdminFilesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('ファイルの取得に失敗しました')).toBeInTheDocument();
    });
  });
}); 