import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HighContrastButton } from './HighContrastButton';

describe('HighContrastButton', () => {
  it('基本的なボタンが正しくレンダリングされる', () => {
    render(
      <HighContrastButton>
        テストボタン
      </HighContrastButton>
    );
    
    expect(screen.getByRole('button', { name: 'テストボタン' })).toBeInTheDocument();
  });

  it('プライマリバリアントで高コントラストクラスが適用される', () => {
    const { container } = render(
      <HighContrastButton variant="primary">
        プライマリボタン
      </HighContrastButton>
    );
    
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('bg-gs-neutral-900');
    expect(button).toHaveClass('text-white');
  });

  it('セカンダリバリアントで高コントラストクラスが適用される', () => {
    const { container } = render(
      <HighContrastButton variant="secondary">
        セカンダリボタン
      </HighContrastButton>
    );
    
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('bg-white');
    expect(button).toHaveClass('text-gs-neutral-900');
    expect(button).toHaveClass('border-2');
    expect(button).toHaveClass('border-gs-neutral-900');
  });

  it('アウトラインバリアントで高コントラストクラスが適用される', () => {
    const { container } = render(
      <HighContrastButton variant="outline">
        アウトラインボタン
      </HighContrastButton>
    );
    
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('border-2');
    expect(button).toHaveClass('border-gs-neutral-700');
    expect(button).toHaveClass('text-gs-neutral-900');
  });

  it('危険バリアントで高コントラストクラスが適用される', () => {
    const { container } = render(
      <HighContrastButton variant="destructive">
        削除ボタン
      </HighContrastButton>
    );
    
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('bg-red-700');
    expect(button).toHaveClass('text-white');
  });

  it('成功バリアントで高コントラストクラスが適用される', () => {
    const { container } = render(
      <HighContrastButton variant="success">
        成功ボタン
      </HighContrastButton>
    );
    
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('bg-green-700');
    expect(button).toHaveClass('text-white');
  });

  it('無効状態で適切なスタイルが適用される', () => {
    const { container } = render(
      <HighContrastButton disabled>
        無効ボタン
      </HighContrastButton>
    );
    
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('opacity-50');
    expect(button).toHaveClass('cursor-not-allowed');
    expect(button).toBeDisabled();
  });

  it('フォーカス状態で高コントラストリングが表示される', () => {
    const { container } = render(
      <HighContrastButton>
        フォーカスボタン
      </HighContrastButton>
    );
    
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('focus-visible:ring-4');
    expect(button).toHaveClass('focus-visible:ring-gs-neutral-900');
    expect(button).toHaveClass('focus-visible:ring-offset-2');
  });

  it('サイズバリアントが正しく適用される', () => {
    const { container } = render(
      <HighContrastButton size="large">
        大きなボタン
      </HighContrastButton>
    );
    
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('px-8');
    expect(button).toHaveClass('py-4');
    expect(button).toHaveClass('text-lg');
  });

  it('アクセシビリティ属性が正しく設定される', () => {
    render(
      <HighContrastButton 
        aria-label="カスタムラベル"
        aria-describedby="description"
      >
        アクセシブルボタン
      </HighContrastButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'カスタムラベル');
    expect(button).toHaveAttribute('aria-describedby', 'description');
  });

  it('カスタムクラス名が適用される', () => {
    const { container } = render(
      <HighContrastButton className="custom-class">
        カスタムボタン
      </HighContrastButton>
    );
    
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('custom-class');
  });
}); 