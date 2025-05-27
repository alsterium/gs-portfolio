import type { ApiResponse, ApiErrorResponse } from '@/types';

// API設定
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';

// APIエラークラス
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTPクライアント設定
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // セッションCookie用
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          'API_ERROR',
          errorData.error || 'APIエラーが発生しました',
          response.status
        );
      }

      const data = await response.json();
      if (!data.success) {
        throw new ApiError(
          'API_ERROR',
          data.error || 'APIエラーが発生しました'
        );
      }
      
      return data.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // ネットワークエラーなど
      throw new ApiError(
        'NETWORK_ERROR',
        'ネットワークエラーが発生しました。接続を確認してください。'
      );
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ファイルアップロード用
  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Content-Typeを自動設定させるため空にする
    });
  }
}

// APIクライアントインスタンス
export const apiClient = new ApiClient(API_BASE_URL); 