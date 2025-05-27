import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ModernCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'gradient' | 'glow' | 'glass';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  hoverable?: boolean;
}

export const ModernCard = forwardRef<HTMLDivElement, ModernCardProps>(
  ({ 
    children, 
    className, 
    variant = 'default', 
    size = 'medium', 
    animated = false, 
    hoverable = false,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      // 基本スタイル
      'rounded-xl border transition-all duration-300 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gs-primary focus-visible:ring-offset-2',
      
      // サイズバリアント
      {
        'p-3': size === 'small',
        'p-6': size === 'medium',
        'p-8': size === 'large',
      },
      
      // バリアント別スタイル
      {
        // デフォルト
        'bg-white border-gs-neutral-200 shadow-sm': variant === 'default',
        
        // グラデーション
        'bg-gradient-to-br from-gs-primary/5 via-white to-gs-secondary/5 border-gs-primary/20 shadow-lg shadow-gs-primary/10': 
          variant === 'gradient',
        
        // グロー効果
        'bg-white border-gs-primary/30 shadow-glow': variant === 'glow',
        
        // ガラスモーフィズム
        'backdrop-blur-md bg-white/10 border-white/20 shadow-xl': variant === 'glass',
      },
      
      // アニメーション
      {
        'animate-fade-in': animated,
        'hover:animate-bounce-subtle': animated,
      },
      
      // ホバー効果
      {
        'hover:scale-105 hover:shadow-xl hover:shadow-gs-primary/20 cursor-pointer': hoverable,
      },
      
      className
    );

    return (
      <div ref={ref} className={baseClasses} {...props}>
        {children}
      </div>
    );
  }
);

ModernCard.displayName = 'ModernCard'; 