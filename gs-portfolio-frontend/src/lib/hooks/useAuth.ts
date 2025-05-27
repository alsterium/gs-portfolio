import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api';

interface AuthUser {
  id: number;
  username: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'gs_portfolio_auth';

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  // ローカルストレージから認証状態を復元
  const restoreAuthState = useCallback(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const authData = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          user: authData.user,
          isAuthenticated: true,
          loading: false,
        }));
        return true;
      }
    } catch (error) {
      console.error('認証状態の復元に失敗:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setState(prev => ({ ...prev, loading: false }));
    return false;
  }, []);

  // 認証状態をローカルストレージに保存
  const saveAuthState = useCallback((user: AuthUser) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }));
    } catch (error) {
      console.error('認証状態の保存に失敗:', error);
    }
  }, []);

  // 認証状態をクリア
  const clearAuthState = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('認証状態のクリアに失敗:', error);
    }
  }, []);

  // ログイン
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // APIクライアントは成功時にdataプロパティのみを返すため、直接userを取得
      const data = await apiClient.post<{ user: AuthUser }>('/admin/login', credentials);

      if (data?.user) {
        const user = data.user;
        setState({
          user,
          isAuthenticated: true,
          loading: false,
        });
        saveAuthState(user);
        return { success: true };
      } else {
        setState(prev => ({ ...prev, loading: false }));
        return { 
          success: false, 
          error: 'ログインに失敗しました' 
        };
      }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      console.error('ログインエラー:', error);
      
      if (error instanceof Error) {
        return { 
          success: false, 
          error: error.message 
        };
      }
      
      return { 
        success: false, 
        error: 'ネットワークエラーが発生しました' 
      };
    }
  }, [saveAuthState]);

  // ログアウト
  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // サーバーサイドでのログアウト処理
      await apiClient.post('/admin/logout', {});
    } catch (error) {
      console.error('ログアウトエラー:', error);
    } finally {
      // クライアントサイドの状態をクリア
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      clearAuthState();
    }
  }, [clearAuthState]);

  // 認証状態の確認
  const checkAuth = useCallback(async () => {
    // ローカルストレージから状態を復元
    const restored = restoreAuthState();
    if (!restored) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    // ローカル状態が復元された場合、バックグラウンドでサーバー確認
    try {
      const data = await apiClient.get<{ user: AuthUser }>('/admin/me');

      if (data?.user) {
        const user = data.user;
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          loading: false,
        }));
        saveAuthState(user);
      } else {
        // サーバーサイドで認証が無効な場合、ローカル状態をクリア
        setState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
        clearAuthState();
      }
    } catch (error) {
      console.error('認証確認エラー:', error);
      // エラーの場合、ローカル状態を維持（ネットワークエラーの可能性）
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [restoreAuthState, saveAuthState, clearAuthState]);

  // 初期化時に認証状態を確認
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    login,
    logout,
    checkAuth,
  };
} 