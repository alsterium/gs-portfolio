// GSファイル関連の型定義
export interface GSFile {
  id: number
  filename: string
  display_name: string
  description?: string
  file_size: number
  file_path: string
  thumbnail_path?: string
  mime_type: string
  upload_date: string
  updated_date: string
  is_active: boolean
}

// API レスポンス型
export interface ApiResponse<T> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  code: string
  message: string
}

// 管理者関連の型定義
export interface AdminUser {
  id: number
  username: string
  lastLogin?: string
  createdDate: string
}

export interface AdminSession {
  id: string
  adminId: number
  expiresAt: string
  createdAt: string
}

// ファイルアップロード関連
export interface FileUploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

// ページネーション型定義
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ファイル検証設定
export interface FileValidationConfig {
  allowedTypes: string[]
  maxSize: number
  malwareCheck: boolean
  thumbnailRequired: boolean
} 