import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('基本的なエラーメッセージが表示される', () => {
    render(<ErrorMessage message="テストエラーメッセージ" />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('テストエラーメッセージ')).toBeInTheDocument();
  });

  it('タイトル付きでレンダリングされる', () => {
    render(
      <ErrorMessage 
        title="エラータイトル" 
        message="テストエラーメッセージ" 
      />
    );
    
    expect(screen.getByText('エラータイトル')).toBeInTheDocument();
    expect(screen.getByText('テストエラーメッセージ')).toBeInTheDocument();
  });

  it('警告バリアントで正しいスタイルが適用される', () => {
    render(
      <ErrorMessage 
        message="警告メッセージ" 
        variant="warning" 
      />
    );
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-yellow-200', 'bg-yellow-50', 'text-yellow-800');
  });

  it('情報バリアントで正しいスタイルが適用される', () => {
    render(
      <ErrorMessage 
        message="情報メッセージ" 
        variant="info" 
      />
    );
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-blue-200', 'bg-blue-50', 'text-blue-800');
  });

  it('閉じるボタンが表示され、クリックでコールバックが呼ばれる', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    
    render(
      <ErrorMessage 
        message="閉じられるメッセージ" 
        dismissible={true}
        onDismiss={onDismiss}
      />
    );
    
    const closeButton = screen.getByRole('button', { name: '閉じる' });
    expect(closeButton).toBeInTheDocument();
    
    await user.click(closeButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('dismissibleがfalseの場合は閉じるボタンが表示されない', () => {
    render(
      <ErrorMessage 
        message="閉じられないメッセージ" 
        dismissible={false}
      />
    );
    
    expect(screen.queryByRole('button', { name: '閉じる' })).not.toBeInTheDocument();
  });

  it('カスタムクラス名が適用される', () => {
    render(
      <ErrorMessage 
        message="カスタムクラステスト" 
        className="custom-error-class"
      />
    );
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-error-class');
  });
}); 