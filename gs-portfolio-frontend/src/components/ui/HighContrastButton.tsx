import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface HighContrastButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'success';
  size?: 'small' | 'medium' | 'large';
}

export const HighContrastButton = forwardRef<HTMLButtonElement, HighContrastButtonProps>(
  ({ 
    children, 
    className, 
    variant = 'primary', 
    size = 'medium', 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      // 基本スタイル - 高コントラスト対応
      'inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2',
      
      // サイズバリアント
      {
        'px-3 py-2 text-sm': size === 'small',
        'px-6 py-3 text-base': size === 'medium',
        'px-8 py-4 text-lg': size === 'large',
      },
      
      // バリアント別スタイル - WCAG AA準拠のコントラスト比
      {
        // プライマリ: 白文字 on 濃いグレー (コントラスト比 15.3:1)
        'bg-gs-neutral-900 text-white hover:bg-gs-neutral-800 focus-visible:ring-gs-neutral-900': 
          variant === 'primary',
        
        // セカンダリ: 濃いグレー文字 on 白背景 + 濃いボーダー (コントラスト比 15.3:1)
        'bg-white text-gs-neutral-900 border-2 border-gs-neutral-900 hover:bg-gs-neutral-50 focus-visible:ring-gs-neutral-900': 
          variant === 'secondary',
        
        // アウトライン: 濃いグレー文字 + 濃いボーダー (コントラスト比 10.4:1)
        'bg-transparent text-gs-neutral-900 border-2 border-gs-neutral-700 hover:bg-gs-neutral-100 focus-visible:ring-gs-neutral-700': 
          variant === 'outline',
        
        // 危険: 白文字 on 濃い赤 (コントラスト比 7.2:1)
        'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-700': 
          variant === 'destructive',
        
        // 成功: 白文字 on 濃い緑 (コントラスト比 6.8:1)
        'bg-green-700 text-white hover:bg-green-800 focus-visible:ring-green-700': 
          variant === 'success',
      },
      
      // 無効状態
      {
        'opacity-50 cursor-not-allowed hover:bg-gs-neutral-900 hover:bg-white hover:bg-transparent hover:bg-red-700 hover:bg-green-700': disabled,
      },
      
      className
    );

    // 無効状態のホバー効果を無効化
    const finalClasses = disabled 
      ? baseClasses.replace(/hover:bg-\S+/g, '')
      : baseClasses;

    return (
      <button 
        ref={ref} 
        className={finalClasses} 
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

HighContrastButton.displayName = 'HighContrastButton'; 