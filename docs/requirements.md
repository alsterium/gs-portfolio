# Gaussian Splattingポートフォリオサイト 要件定義書

## 1. プロジェクト概要

Gaussian Splatting（GS）ファイルを管理・表示するポートフォリオサイトの構築。
ユーザーが3Dモデルを閲覧でき、管理者がファイルを管理できるWebアプリケーション。

## 2. 機能要件

### 2.1 ユーザー向け機能

#### 2.1.1 GSファイル一覧ページ
- **機能**: 登録されているGSファイルの一覧表示
- **表示内容**:
  - GSファイルのサムネイル画像
  - ファイル名（表示名）
  - 作成日時
- **UI**: カード形式のグリッドレイアウト
- **操作**: ファイル選択で詳細ページに遷移

#### 2.1.2 GSファイル詳細ページ
- **機能**: 選択されたGSファイルの3D表示
- **表示内容**:
  - 3DモデルのPlayCanvasビューア
  - ファイル名・説明
  - 基本的な操作コントロール（回転、ズーム、パン）
- **操作**: 一覧ページに戻る機能

### 2.2 管理者向け機能

#### 2.2.1 管理者認証
- **機能**: パスワードによる管理ページアクセス制御
- **認証方式**: シンプルなパスワード認証
- **セッション管理**: ログイン状態の維持
- **初回セットアップ**: 初回アクセス時にパスワード設定画面表示

#### 2.2.2 GSファイル管理ページ
- **機能**: GSファイルの管理操作
- **操作内容**:
  - ファイルアップロード（GSファイル + サムネイル画像）
  - ファイル削除
  - 表示名の編集
  - ファイル一覧表示
- **UI**: 管理テーブル形式

## 3. 非機能要件

### 3.1 技術スタック
- **フロントエンド**: React 19, TypeScript, Vite 6
- **UIライブラリ**: shadcn/ui
- **ルーティング**: React Router v7
- **3D表示**: @playcanvas/react
- **テスト**: Vitest
- **バックエンド**: Cloudflare Workers
- **データベース**: Cloudflare D1
- **ストレージ**: Cloudflare R2
- **ホスティング**: Cloudflare Pages

### 3.2 パフォーマンス要件
- **ページ読み込み**: 初回3秒以内
- **3Dモデル表示**: 5秒以内
- **ファイルアップロード**: 進捗表示

### 3.3 セキュリティ要件
- **認証**: 安全なパスワード管理
- **ファイルアップロード**: 
  - ファイルタイプ検証
  - ファイルサイズ制限
  - 悪意あるファイルの検出
- **データ保護**: 
  - HTTPS通信
  - XSS対策
  - CSRF対策
- **アクセス制御**: 管理機能への適切な権限管理

### 3.4 ユーザビリティ要件
- **レスポンシブデザイン**: モバイル・タブレット対応
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **ローディング**: 適切なローディング表示

## 4. データ要件

### 4.1 GSファイル情報
- ファイルID（UUID）
- ファイル名（表示名）
- 元ファイル名
- ファイルサイズ
- アップロード日時
- 更新日時
- ファイルパス（R2）
- サムネイルパス（R2）

### 4.2 管理者情報
- 管理者ID
- パスワードハッシュ
- 最終ログイン日時

## 5. システム制約

### 5.1 ファイル制約
- **GSファイル**: 最大100MB（設定可能）、.splat/.ply形式
- **サムネイル**: 最大5MB、JPEG/PNG形式（任意アップロード）
- **同時アップロード**: 5ファイルまで
- **表示制約**: 詳細ページでは1ファイルずつ表示

### 5.2 ストレージ制約
- **総容量**: Cloudflare R2の制限に準拠
- **ファイル数**: 1000ファイルまで

## 6. 今後の拡張可能性

- 複数管理者対応
- ファイルカテゴリ機能
- 検索・フィルタ機能
- ユーザーコメント機能
- ダウンロード統計 