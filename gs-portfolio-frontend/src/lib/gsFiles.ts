import { apiClient } from './api';
import type { GSFile, PaginatedResponse } from '@/types';

// GSファイル一覧取得
export async function getGSFiles(page: number = 1, limit: number = 20): Promise<PaginatedResponse<GSFile>> {
  return apiClient.get<PaginatedResponse<GSFile>>(`/gs-files?page=${page}&limit=${limit}`);
}

// GSファイル詳細取得
export async function getGSFile(id: number): Promise<GSFile> {
  return apiClient.get<GSFile>(`/gs-files/${id}`);
}

// GSファイルダウンロードURL取得
export function getGSFileDownloadUrl(id: number): string {
  return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api'}/gs-files/${id}/file`;
}

// サムネイルURL取得
export function getGSFileThumbnailUrl(id: number): string {
  return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api'}/gs-files/${id}/thumbnail`;
} 