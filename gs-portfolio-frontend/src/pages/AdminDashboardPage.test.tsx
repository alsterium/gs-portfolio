import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { AdminDashboardPage } from './AdminDashboardPage';

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
  adminLogout: vi.fn(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ダッシュボードが正しく表示される', () => {
    renderWithRouter(<AdminDashboardPage />);
    
    expect(screen.getByText('管理者ダッシュボード')).toBeInTheDocument();
    expect(screen.getAllByText('ファイル管理')).toHaveLength(2); // タイトルとリンクの両方
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
  });

  it('ファイル管理リンクが正しく表示される', () => {
    renderWithRouter(<AdminDashboardPage />);
    
    const fileManagementLink = screen.getByRole('link', { name: /ファイル管理/ });
    expect(fileManagementLink).toBeInTheDocument();
    expect(fileManagementLink).toHaveAttribute('href', '/admin/files');
  });

  it('ログアウトボタンが正しく表示される', () => {
    renderWithRouter(<AdminDashboardPage />);
    
    const logoutButton = screen.getByRole('button', { name: 'ログアウト' });
    expect(logoutButton).toBeInTheDocument();
  });
}); 