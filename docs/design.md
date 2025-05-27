# Gaussian Splattingポートフォリオサイト 設計書

## 1. システム構成

### 1.1 アーキテクチャ概要

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cloudflare    │    │   Cloudflare    │    │   Cloudflare    │
│     Pages       │───▶│    Workers      │───▶│      D1         │
│  (Frontend)     │    │   (Backend)     │    │  (Database)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Cloudflare    │
                       │       R2        │
                       │   (Storage)     │
                       └─────────────────┘
```

### 1.2 技術スタック詳細

- **フロントエンド**:
  - React 19 + TypeScript
  - Vite 6 (ビルドシステム)
  - React Router v7 (ルーティング)
  - shadcn/ui (UIコンポーネント)
  - @playcanvas/react (3D表示)
  - Tailwind CSS (スタイリング)

- **バックエンド**:
  - Cloudflare Workers (サーバーレス関数)
  - Hono (軽量WebフレームワーK)

- **データ層**:
  - Cloudflare D1 (SQLiteベースのサーバーレスDB)
  - Cloudflare R2 (ファイルストレージ)

## 2. データベース設計

### 2.1 テーブル構造

#### 2.1.1 gs_files テーブル
```sql
CREATE TABLE gs_files (
    id TEXT PRIMARY KEY,                    -- UUID
    display_name TEXT NOT NULL,             -- 表示名
    original_name TEXT NOT NULL,            -- 元ファイル名
    file_size INTEGER NOT NULL,             -- ファイルサイズ(bytes)
    file_path TEXT NOT NULL,                -- R2でのファイルパス
    thumbnail_path TEXT,                    -- サムネイルのR2パス
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT                        -- 説明（将来拡張用）
);
```

#### 2.1.2 admin_users テーブル
```sql
CREATE TABLE admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,            -- bcryptハッシュ
    last_login DATETIME,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.1.3 admin_sessions テーブル
```sql
CREATE TABLE admin_sessions (
    id TEXT PRIMARY KEY,                    -- セッションID
    admin_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id)
);
```

## 3. API設計

### 3.1 エンドポイント構成

#### 3.1.1 公開API（認証不要）
- `GET /api/gs-files` - GSファイル一覧取得
- `GET /api/gs-files/:id` - 特定GSファイル情報取得
- `GET /api/gs-files/:id/file` - GSファイルダウンロード（R2リダイレクト）
- `GET /api/gs-files/:id/thumbnail` - サムネイル取得（R2リダイレクト）

#### 3.1.2 管理API（認証必要）
- `POST /api/admin/login` - 管理者ログイン
- `POST /api/admin/logout` - 管理者ログアウト
- `POST /api/admin/gs-files` - GSファイルアップロード
- `PUT /api/admin/gs-files/:id` - GSファイル情報更新
- `DELETE /api/admin/gs-files/:id` - GSファイル削除

### 3.2 APIレスポンス形式

#### 3.2.1 成功レスポンス
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}
```

#### 3.2.2 エラーレスポンス
```typescript
interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  message: string;
}
```

## 4. フロントエンド設計

### 4.1 ページ構成

```
/                           # ホームページ（GSファイル一覧）
/view/:id                   # GSファイル詳細ページ
/admin                      # 管理者ログインページ
/admin/dashboard            # 管理ダッシュボード
/admin/files                # ファイル管理ページ
```

### 4.2 コンポーネント設計

#### 4.2.1 共通コンポーネント
- `Layout` - 全体レイアウト
- `Header` - ヘッダー
- `Footer` - フッター
- `LoadingSpinner` - ローディング表示
- `ErrorBoundary` - エラーハンドリング

#### 4.2.2 ページ固有コンポーネント
- `GSFileGrid` - GSファイル一覧グリッド
- `GSFileCard` - GSファイルカード
- `GSViewer` - PlayCanvas 3Dビューア
- `AdminFileTable` - 管理ファイルテーブル
- `FileUploadForm` - ファイルアップロードフォーム

### 4.3 状態管理

React 19の新機能を活用:
- `use()` Hook for data fetching
- React Server Components（適用可能箇所）
- Suspense境界でのローディング管理

## 5. セキュリティ設計

### 5.1 認証・認可

#### 5.1.1 管理者認証
- JWT形式のセッショントークン
- HttpOnly Cookieでの保存
- CSRF対策としてのDoubleSubmitCookie

#### 5.1.2 パスワード管理
- bcryptでのハッシュ化（cost: 12）
- パスワード強度要件の実装

### 5.2 ファイルアップロードセキュリティ

#### 5.2.1 ファイル検証
```typescript
interface FileValidation {
  allowedTypes: string[];       // .splat, .ply のみ
  maxSize: number;             // 100MB（設定可能）
  malwareCheck: boolean;       // 基本的なマルウェア検出
  thumbnailRequired: boolean;  // サムネイル必須チェック（false）
}
```

#### 5.2.2 アップロード処理
- ウイルススキャン（Cloudflare R2のマルウェア検出）
- ファイル名のサニタイズ
- 一意なファイルパスの生成

### 5.3 XSS・CSRF対策

- Content Security Policy (CSP) の設定
- 入力値のサニタイズ
- CSRF トークンの実装

## 6. パフォーマンス設計

### 6.1 フロントエンド最適化

- Code Splitting（ページ単位）
- Lazy Loading（コンポーネント、画像）
- Service Worker（キャッシュ戦略）
- Bundle分析とTree Shaking

### 6.2 バックエンド最適化

- Cloudflare Workers Edge Computing
- R2ファイルのCDN配信
- D1クエリの最適化
- レスポンスキャッシュ

### 6.3 3D表示最適化

- PlayCanvasのLOD設定
- Progressive Loading
- テクスチャ圧縮
- ビューポート外での描画停止

## 7. エラーハンドリング設計

### 7.1 エラー分類

- **ネットワークエラー**: 接続失敗、タイムアウト
- **認証エラー**: 無効なログイン、セッション期限切れ
- **バリデーションエラー**: 不正な入力値
- **サーバーエラー**: 内部エラー、DB接続失敗
- **ファイルエラー**: アップロード失敗、ファイル破損

### 7.2 エラー処理戦略

- React Error Boundary でのキャッチ
- ユーザーフレンドリーなエラーメッセージ
- エラーログの収集（Cloudflare Analytics）
- 自動リトライ機能（ネットワークエラー）

## 8. テスト設計

### 8.1 テスト種別

- **Unit Tests**: Vitest
- **Integration Tests**: API エンドポイント
- **E2E Tests**: Playwright（将来拡張）
- **Visual Regression Tests**: Chromatic（将来拡張）

### 8.2 テスト対象

- React コンポーネント
- ユーティリティ関数
- API エンドポイント
- ファイルアップロード処理
- 認証フロー

## 9. デプロイメント設計

### 9.1 CI/CD パイプライン

```yaml
# GitHub Actions workflow
on: [push, pull_request]
jobs:
  test:
    - Install dependencies
    - Run tests
    - Build application
  deploy:
    - Deploy to Cloudflare Pages
    - Deploy Workers
    - Run D1 migrations
```

### 9.2 環境管理

- **Development**: ローカル開発環境
- **Staging**: テスト環境（Cloudflare Pages Preview）
- **Production**: 本番環境

### 9.3 設定管理

環境変数での設定管理:
- `CLOUDFLARE_ACCOUNT_ID`
- `D1_DATABASE_ID`
- `R2_BUCKET_NAME`
- `ADMIN_PASSWORD_SALT` 