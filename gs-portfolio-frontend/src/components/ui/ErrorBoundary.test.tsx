import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

// エラーを投げるテスト用コンポーネント
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>正常なコンポーネント</div>;
};

describe('ErrorBoundary', () => {
  // コンソールエラーを抑制
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  
  afterEach(() => {
    console.error = originalError;
  });

  it('エラーが発生しない場合は子コンポーネントを表示する', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('正常なコンポーネント')).toBeInTheDocument();
  });

  it('エラーが発生した場合はデフォルトのエラーUIを表示する', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText(/申し訳ございませんが、予期しないエラーが発生しました/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ページを再読み込み' })).toBeInTheDocument();
  });

  it('カスタムfallbackが提供された場合はそれを表示する', () => {
    const customFallback = <div>カスタムエラーメッセージ</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('カスタムエラーメッセージ')).toBeInTheDocument();
    expect(screen.queryByText('エラーが発生しました')).not.toBeInTheDocument();
  });

  it('onErrorコールバックが呼ばれる', () => {
    const onError = vi.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });
}); 