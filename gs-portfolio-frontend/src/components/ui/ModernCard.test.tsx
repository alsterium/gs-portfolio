import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ModernCard } from './ModernCard';

describe('ModernCard', () => {
  it('基本的なカードが正しくレンダリングされる', () => {
    render(
      <ModernCard>
        <div>テストコンテンツ</div>
      </ModernCard>
    );
    
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  it('グラデーション効果のクラスが適用される', () => {
    const { container } = render(
      <ModernCard variant="gradient">
        <div>グラデーションカード</div>
      </ModernCard>
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-gradient-to-br');
  });

  it('グロー効果のクラスが適用される', () => {
    const { container } = render(
      <ModernCard variant="glow">
        <div>グローカード</div>
      </ModernCard>
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('shadow-glow');
  });

  it('ガラスモーフィズム効果のクラスが適用される', () => {
    const { container } = render(
      <ModernCard variant="glass">
        <div>ガラスカード</div>
      </ModernCard>
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('backdrop-blur-md');
    expect(card).toHaveClass('bg-white/10');
  });

  it('カスタムクラス名が適用される', () => {
    const { container } = render(
      <ModernCard className="custom-class">
        <div>カスタムカード</div>
      </ModernCard>
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  it('アニメーション効果のクラスが適用される', () => {
    const { container } = render(
      <ModernCard animated>
        <div>アニメーションカード</div>
      </ModernCard>
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('animate-fade-in');
    expect(card).toHaveClass('hover:animate-bounce-subtle');
  });

  it('サイズバリアントが正しく適用される', () => {
    const { container } = render(
      <ModernCard size="large">
        <div>大きなカード</div>
      </ModernCard>
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-8');
  });

  it('小さなサイズバリアントが正しく適用される', () => {
    const { container } = render(
      <ModernCard size="small">
        <div>小さなカード</div>
      </ModernCard>
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-3');
  });

  it('ホバー効果のクラスが適用される', () => {
    const { container } = render(
      <ModernCard hoverable>
        <div>ホバー可能カード</div>
      </ModernCard>
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('hover:scale-105');
    expect(card).toHaveClass('hover:shadow-xl');
  });

  it('アクセシビリティ属性が正しく設定される', () => {
    render(
      <ModernCard role="article" aria-label="モダンカード">
        <div>アクセシブルカード</div>
      </ModernCard>
    );
    
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', 'モダンカード');
  });
}); 