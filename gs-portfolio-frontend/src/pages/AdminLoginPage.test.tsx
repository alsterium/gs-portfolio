import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { AdminLoginPage } from './AdminLoginPage';

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
  adminLogin: vi.fn(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AdminLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ログインフォームが正しく表示される', () => {
    renderWithRouter(<AdminLoginPage />);
    
    expect(screen.getByText('管理者ログイン')).toBeInTheDocument();
    expect(screen.getByLabelText('ユーザー名')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
  });

  it('フォーム入力が正しく動作する', async () => {
    renderWithRouter(<AdminLoginPage />);
    
    const usernameInput = screen.getByLabelText('ユーザー名');
    const passwordInput = screen.getByLabelText('パスワード');
    
    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(usernameInput).toHaveValue('admin');
    expect(passwordInput).toHaveValue('password123');
  });

  it('空のフォーム送信時にバリデーションエラーが表示される', async () => {
    renderWithRouter(<AdminLoginPage />);
    
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('ユーザー名は必須です')).toBeInTheDocument();
      expect(screen.getByText('パスワードは必須です')).toBeInTheDocument();
    });
  });

  it('正常なログイン時にダッシュボードにリダイレクトされる', async () => {
    const { adminLogin } = await import('../lib/api');
    vi.mocked(adminLogin).mockResolvedValue({ success: true, token: 'test-token' });
    
    renderWithRouter(<AdminLoginPage />);
    
    const usernameInput = screen.getByLabelText('ユーザー名');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    
    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(adminLogin).toHaveBeenCalledWith('admin', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('ログイン失敗時にエラーメッセージが表示される', async () => {
    const { adminLogin } = await import('../lib/api');
    vi.mocked(adminLogin).mockRejectedValue(new Error('認証に失敗しました'));
    
    renderWithRouter(<AdminLoginPage />);
    
    const usernameInput = screen.getByLabelText('ユーザー名');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    
    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('認証に失敗しました')).toBeInTheDocument();
    });
  });
}); 