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

      const response = await apiClient.post<{
        success: boolean;
        data?: { user: AuthUser };
        error?: string;
      }>('/admin/login', credentials);

      if (response.success && response.data?.user) {
        const user = response.data.user;
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
          error: response.error || 'ログインに失敗しました' 
        };
      }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      console.error('ログインエラー:', error);
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
      return;
    }

    try {
      // サーバーサイドで認証状態を確認
      const response = await apiClient.get<{
        success: boolean;
        data?: { user: AuthUser };
      }>('/admin/me');

      if (response.success && response.data?.user) {
        const user = response.data.user;
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
      // エラーの場合もローカル状態をクリア
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      clearAuthState();
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