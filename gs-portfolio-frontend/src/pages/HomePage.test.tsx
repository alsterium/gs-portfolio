import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('renders page title', () => {
    renderWithRouter(<HomePage />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Gaussian Splatting Portfolio');
  });

  it('renders page description', () => {
    renderWithRouter(<HomePage />);
    
    expect(screen.getByText(/3Dモデルのコレクション/)).toBeInTheDocument();
  });

  it('has proper page structure', () => {
    renderWithRouter(<HomePage />);
    
    // ページコンテナが存在することを確認
    const container = screen.getByRole('heading', { level: 1 }).closest('div')?.parentElement;
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
  });

  it('shows loading state initially', () => {
    renderWithRouter(<HomePage />);
    
    // 初期状態でローディングが表示されることを確認
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('ファイルを読み込み中...')).toBeInTheDocument();
  });

  it('renders GSFileGrid component', () => {
    renderWithRouter(<HomePage />);
    
    // 初期状態でローディングが表示されることを確認
    expect(screen.getByText('ファイルを読み込み中...')).toBeInTheDocument();
    
    // GSFileGridコンポーネントが使用されていることを確認
    // （ローディング状態はGSFileGridから来ている）
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has responsive layout', () => {
    renderWithRouter(<HomePage />);
    
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-3xl', 'font-bold', 'text-center', 'mb-4');
  });
}); 