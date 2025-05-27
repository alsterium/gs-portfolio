import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({
  title,
  message,
  variant = 'error',
  dismissible = false,
  onDismiss,
  className,
}: ErrorMessageProps) {
  const variantStyles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };

  const iconColor = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className={cn('h-5 w-5', iconColor[variant])} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <p className="text-sm">{message}</p>
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={cn(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  variant === 'error' && 'text-red-500 hover:bg-red-100 focus:ring-red-600',
                  variant === 'warning' && 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600',
                  variant === 'info' && 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
                )}
                aria-label="閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 