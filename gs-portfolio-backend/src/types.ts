// Cloudflare Bindings型定義
export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  JWT_SECRET: string;
}

// GSファイル型定義
export interface GSFile {
  id: number;
  filename: string;
  display_name: string;
  description?: string;
  file_size: number;
  file_path: string;
  thumbnail_path?: string;
  mime_type: string;
  upload_date: string;
  updated_date: string;
  is_active: boolean;
}

// GSファイル作成用型定義
export interface CreateGSFileRequest {
  filename: string;
  display_name: string;
  description?: string;
  file_size: number;
  mime_type: string;
}

// GSファイル更新用型定義
export interface UpdateGSFileRequest {
  display_name?: string;
  description?: string;
}

// 管理者ユーザー型定義
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  created_date: string;
  last_login?: string;
  is_active: boolean;
}

// ログイン要求型定義
export interface LoginRequest {
  username: string;
  password: string;
}

// セッション型定義
export interface AdminSession {
  id: number;
  user_id: number;
  session_token: string;
  expires_at: string;
  created_date: string;
}

// API レスポンス型定義
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ページネーション型定義
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ファイルアップロード型定義
export interface FileUploadData {
  file: File;
  thumbnail?: File;
  display_name: string;
  description?: string;
} 