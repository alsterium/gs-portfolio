// ファイルストレージ操作クラス
export class FileStorage {
  constructor(private r2: R2Bucket) {}

  // ファイルアップロード
  async uploadFile(key: string, file: ArrayBuffer, contentType: string): Promise<void> {
    await this.r2.put(key, file, {
      httpMetadata: {
        contentType
      }
    });
  }

  // ファイル取得
  async getFile(key: string): Promise<R2Object | null> {
    return await this.r2.get(key);
  }

  // ファイル削除
  async deleteFile(key: string): Promise<void> {
    await this.r2.delete(key);
  }

  // 署名付きURL生成（1時間有効）
  async getSignedUrl(key: string): Promise<string> {
    const object = await this.r2.get(key);
    if (!object) {
      throw new Error('File not found');
    }

    // R2の署名付きURL生成（実際の実装では適切なメソッドを使用）
    // 現在はプレースホルダー
    return `https://your-r2-domain.com/${key}`;
  }

  // ファイル存在確認
  async fileExists(key: string): Promise<boolean> {
    const object = await this.r2.head(key);
    return object !== null;
  }
}

// ファイル検証ユーティリティ
export class FileValidator {
  // 許可されるGaussian Splattingファイル形式
  private static readonly ALLOWED_GS_TYPES = [
    'application/octet-stream', // .splat
    'application/ply',          // .ply
    'text/plain'                // .ply (テキスト形式)
  ];

  // 許可されるサムネイル形式
  private static readonly ALLOWED_THUMBNAIL_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  // 最大ファイルサイズ（100MB）
  private static readonly MAX_FILE_SIZE = 100 * 1024 * 1024;

  // 最大サムネイルサイズ（5MB）
  private static readonly MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;

  // GSファイル検証
  static validateGSFile(file: File): { valid: boolean; error?: string } {
    // ファイルサイズチェック
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `ファイルサイズが大きすぎます。最大${this.MAX_FILE_SIZE / 1024 / 1024}MBまでです。`
      };
    }

    // ファイル拡張子チェック
    const extension = file.name.toLowerCase().split('.').pop();
    if (!extension || !['splat', 'ply'].includes(extension)) {
      return {
        valid: false,
        error: 'サポートされていないファイル形式です。.splatまたは.plyファイルのみ対応しています。'
      };
    }

    // MIMEタイプチェック
    if (!this.ALLOWED_GS_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'サポートされていないファイル形式です。'
      };
    }

    return { valid: true };
  }

  // サムネイル検証
  static validateThumbnail(file: File): { valid: boolean; error?: string } {
    // ファイルサイズチェック
    if (file.size > this.MAX_THUMBNAIL_SIZE) {
      return {
        valid: false,
        error: `サムネイルサイズが大きすぎます。最大${this.MAX_THUMBNAIL_SIZE / 1024 / 1024}MBまでです。`
      };
    }

    // MIMEタイプチェック
    if (!this.ALLOWED_THUMBNAIL_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'サポートされていない画像形式です。JPEG、PNG、WebPのみ対応しています。'
      };
    }

    return { valid: true };
  }

  // ファイル名サニタイズ
  static sanitizeFilename(filename: string): string {
    // 危険な文字を除去
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }

  // ユニークなファイルパス生成
  static generateFilePath(filename: string, prefix: string = 'gs-files'): string {
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().substring(0, 8);
    const sanitizedName = this.sanitizeFilename(filename);
    
    return `${prefix}/${timestamp}-${randomId}-${sanitizedName}`;
  }
} 