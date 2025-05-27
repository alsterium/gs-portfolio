-- Gaussian Splattingポートフォリオサイト データベーススキーマ

-- GSファイルテーブル
CREATE TABLE IF NOT EXISTS gs_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 管理者ユーザーテーブル
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT TRUE
);

-- 管理者セッションテーブル
CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users (id) ON DELETE CASCADE
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_gs_files_active ON gs_files(is_active);
CREATE INDEX IF NOT EXISTS idx_gs_files_upload_date ON gs_files(upload_date);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- 初期管理者ユーザー（パスワード: admin123）
INSERT OR IGNORE INTO admin_users (username, password_hash, email) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com'); 