import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiError, apiClient } from './api';

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET リクエスト', () => {
    it('成功時にデータを返す', async () => {
      const mockData = { id: '1', name: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      });

      const result = await apiClient.get('/test');
      
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    });

    it('APIエラー時にApiErrorを投げる', async () => {
      const errorResponse = {
        success: false,
        error: 'NOT_FOUND',
        code: 'NOT_FOUND',
        message: 'リソースが見つかりません',
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => errorResponse,
      });

      try {
        await apiClient.get('/test');
        // エラーが投げられなかった場合はテスト失敗
        expect.fail('Expected ApiError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('リソースが見つかりません');
        expect((error as ApiError).code).toBe('NOT_FOUND');
        expect((error as ApiError).status).toBe(404);
      }
    });

    it('ネットワークエラー時にApiErrorを投げる', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
      await expect(apiClient.get('/test')).rejects.toThrow('ネットワークエラーが発生しました');
    });
  });

  describe('POST リクエスト', () => {
    it('データ付きでPOSTリクエストを送信する', async () => {
      const postData = { name: 'test' };
      const responseData = { id: '1', ...postData };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: responseData }),
      });

      const result = await apiClient.post('/test', postData);
      
      expect(result).toEqual(responseData);
      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(postData),
      });
    });
  });

  describe('PUT リクエスト', () => {
    it('データ付きでPUTリクエストを送信する', async () => {
      const putData = { name: 'updated' };
      const responseData = { id: '1', ...putData };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: responseData }),
      });

      const result = await apiClient.put('/test/1', putData);
      
      expect(result).toEqual(responseData);
      expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(putData),
      });
    });
  });

  describe('DELETE リクエスト', () => {
    it('DELETEリクエストを送信する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: null }),
      });

      const result = await apiClient.delete('/test/1');
      
      expect(result).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    });
  });

  describe('ファイルアップロード', () => {
    it('FormDataでファイルアップロードを送信する', async () => {
      const formData = new FormData();
      formData.append('file', new File(['test'], 'test.txt'));
      const responseData = { id: '1', fileName: 'test.txt' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: responseData }),
      });

      const result = await apiClient.uploadFile('/upload', formData);
      
      expect(result).toEqual(responseData);
      expect(mockFetch).toHaveBeenCalledWith('/api/upload', {
        method: 'POST',
        headers: {},
        credentials: 'include',
        body: formData,
      });
    });
  });
});

describe('ApiError', () => {
  it('正しくエラー情報を保持する', () => {
    const error = new ApiError('TEST_ERROR', 'テストエラー', 400);
    
    expect(error.name).toBe('ApiError');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('テストエラー');
    expect(error.status).toBe(400);
  });
}); 