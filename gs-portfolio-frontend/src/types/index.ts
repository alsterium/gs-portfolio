// GSファイル関連の型定義
export interface GSFile {
  id: string
  displayName: string
  originalName: string
  fileSize: number
  filePath: string
  thumbnailPath?: string
  uploadDate: string
  updatedDate: string
  description?: string
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

// ファイル検証設定
export interface FileValidationConfig {
  allowedTypes: string[]
  maxSize: number
  malwareCheck: boolean
  thumbnailRequired: boolean
} 