import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('デフォルトサイズで正しくレンダリングされる', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', '読み込み中');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('小さいサイズで正しくレンダリングされる', () => {
    render(<LoadingSpinner size="sm" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('大きいサイズで正しくレンダリングされる', () => {
    render(<LoadingSpinner size="lg" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('カスタムクラス名が適用される', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('custom-class');
  });

  it('スクリーンリーダー用のテキストが含まれる', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });
}); 