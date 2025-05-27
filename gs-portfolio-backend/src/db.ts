import { GSFile, CreateGSFileRequest, UpdateGSFileRequest, AdminUser, AdminSession, PaginationParams, PaginatedResponse } from './types';

// GSファイル関連のデータベース操作
export class GSFileRepository {
  constructor(private db: D1Database) {}

  // 全てのアクティブなGSファイルを取得
  async findAll(params: PaginationParams = {}): Promise<PaginatedResponse<GSFile>> {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    // 総数を取得
    const countResult = await this.db.prepare(
      'SELECT COUNT(*) as total FROM gs_files WHERE is_active = ?'
    ).bind(true).first<{ total: number }>();

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // データを取得
    const files = await this.db.prepare(
      'SELECT * FROM gs_files WHERE is_active = ? ORDER BY upload_date DESC LIMIT ? OFFSET ?'
    ).bind(true, limit, offset).all<GSFile>();

    return {
      data: files.results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  // IDでGSファイルを取得
  async findById(id: number): Promise<GSFile | null> {
    const result = await this.db.prepare(
      'SELECT * FROM gs_files WHERE id = ? AND is_active = ?'
    ).bind(id, true).first<GSFile>();

    return result || null;
  }

  // GSファイルを作成
  async create(data: CreateGSFileRequest, filePath: string, thumbnailPath?: string): Promise<GSFile> {
    const result = await this.db.prepare(`
      INSERT INTO gs_files (filename, display_name, description, file_size, file_path, thumbnail_path, mime_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      data.filename,
      data.display_name,
      data.description || null,
      data.file_size,
      filePath,
      thumbnailPath || null,
      data.mime_type
    ).first<GSFile>();

    if (!result) {
      throw new Error('Failed to create GS file');
    }

    return result;
  }

  // GSファイルを更新
  async update(id: number, data: UpdateGSFileRequest): Promise<GSFile | null> {
    const result = await this.db.prepare(`
      UPDATE gs_files 
      SET display_name = COALESCE(?, display_name),
          description = COALESCE(?, description),
          updated_date = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = ?
      RETURNING *
    `).bind(
      data.display_name || null,
      data.description || null,
      id,
      true
    ).first<GSFile>();

    return result || null;
  }

  // GSファイルを削除（論理削除）
  async delete(id: number): Promise<boolean> {
    const result = await this.db.prepare(
      'UPDATE gs_files SET is_active = ?, updated_date = CURRENT_TIMESTAMP WHERE id = ? AND is_active = ?'
    ).bind(false, id, true).run();

    return result.meta.changes > 0;
  }
}

// 管理者ユーザー関連のデータベース操作
export class AdminUserRepository {
  constructor(private db: D1Database) {}

  // ユーザー名でユーザーを取得
  async findByUsername(username: string): Promise<AdminUser & { password_hash: string } | null> {
    const result = await this.db.prepare(
      'SELECT * FROM admin_users WHERE username = ? AND is_active = ?'
    ).bind(username, true).first<AdminUser & { password_hash: string }>();

    return result || null;
  }

  // ユーザーIDでユーザーを取得
  async findById(id: number): Promise<AdminUser | null> {
    const result = await this.db.prepare(
      'SELECT id, username, email, created_date, last_login, is_active FROM admin_users WHERE id = ? AND is_active = ?'
    ).bind(id, true).first<AdminUser>();

    return result || null;
  }

  // 最終ログイン時刻を更新
  async updateLastLogin(id: number): Promise<void> {
    await this.db.prepare(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(id).run();
  }
}

// セッション関連のデータベース操作
export class AdminSessionRepository {
  constructor(private db: D1Database) {}

  // セッションを作成
  async create(userId: number, sessionToken: string, expiresAt: Date): Promise<AdminSession> {
    const result = await this.db.prepare(`
      INSERT INTO admin_sessions (user_id, session_token, expires_at)
      VALUES (?, ?, ?)
      RETURNING *
    `).bind(
      userId,
      sessionToken,
      expiresAt.toISOString()
    ).first<AdminSession>();

    if (!result) {
      throw new Error('Failed to create session');
    }

    return result;
  }

  // セッショントークンでセッションを取得
  async findByToken(sessionToken: string): Promise<AdminSession | null> {
    const result = await this.db.prepare(
      'SELECT * FROM admin_sessions WHERE session_token = ? AND expires_at > CURRENT_TIMESTAMP'
    ).bind(sessionToken).first<AdminSession>();

    return result || null;
  }

  // セッションを削除
  async delete(sessionToken: string): Promise<boolean> {
    const result = await this.db.prepare(
      'DELETE FROM admin_sessions WHERE session_token = ?'
    ).bind(sessionToken).run();

    return result.meta.changes > 0;
  }

  // 期限切れセッションを削除
  async deleteExpired(): Promise<number> {
    const result = await this.db.prepare(
      'DELETE FROM admin_sessions WHERE expires_at <= CURRENT_TIMESTAMP'
    ).run();

    return result.meta.changes;
  }
} 