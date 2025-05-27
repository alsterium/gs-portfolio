import React, { Component } from 'react';
import type { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8">
          <div className="text-center">
            <h2 className="mb-4 text-xl font-semibold text-red-800">
              エラーが発生しました
            </h2>
            <p className="mb-6 text-red-600">
              申し訳ございませんが、予期しないエラーが発生しました。
              <br />
              ページを再読み込みしてお試しください。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 