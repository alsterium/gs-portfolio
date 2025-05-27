import { Hono } from 'hono';
import { Env, ApiResponse, GSFile, PaginatedResponse } from '../types';
import { GSFileRepository } from '../db';
import { FileStorage } from '../storage';

const publicRoutes = new Hono<{ Bindings: Env }>();

// GSファイル一覧取得
publicRoutes.get('/gs-files', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');

    // バリデーション
    if (page < 1 || limit < 1 || limit > 100) {
      return c.json<ApiResponse>({
        success: false,
        error: 'ページ番号は1以上、リミットは1-100の範囲で指定してください'
      }, 400);
    }

    const gsFileRepo = new GSFileRepository(c.env.DB);
    const result = await gsFileRepo.findAll({ page, limit });

    return c.json<ApiResponse<PaginatedResponse<GSFile>>>({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('GSファイル一覧取得エラー:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'ファイル一覧の取得に失敗しました'
    }, 500);
  }
});

// GSファイル詳細取得
publicRoutes.get('/gs-files/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json<ApiResponse>({
        success: false,
        error: '無効なファイルIDです'
      }, 400);
    }

    const gsFileRepo = new GSFileRepository(c.env.DB);
    const file = await gsFileRepo.findById(id);

    if (!file) {
      return c.json<ApiResponse>({
        success: false,
        error: 'ファイルが見つかりません'
      }, 404);
    }

    return c.json<ApiResponse<GSFile>>({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('GSファイル詳細取得エラー:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'ファイル詳細の取得に失敗しました'
    }, 500);
  }
});

// GSファイルダウンロード
publicRoutes.get('/gs-files/:id/file', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json<ApiResponse>({
        success: false,
        error: '無効なファイルIDです'
      }, 400);
    }

    const gsFileRepo = new GSFileRepository(c.env.DB);
    const file = await gsFileRepo.findById(id);

    if (!file) {
      return c.json<ApiResponse>({
        success: false,
        error: 'ファイルが見つかりません'
      }, 404);
    }

    const storage = new FileStorage(c.env.R2);
    const fileObject = await storage.getFile(file.file_path);

    if (!fileObject) {
      return c.json<ApiResponse>({
        success: false,
        error: 'ファイルデータが見つかりません'
      }, 404);
    }

    // ファイルを返す（R2ObjectのbodyはReadableStreamまたはnull）
    return new Response(fileObject.body, {
      headers: {
        'Content-Type': file.mime_type,
        'Content-Disposition': `attachment; filename="${file.filename}"`,
        'Content-Length': file.file_size.toString()
      }
    });
  } catch (error) {
    console.error('GSファイルダウンロードエラー:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'ファイルのダウンロードに失敗しました'
    }, 500);
  }
});

// サムネイル取得
publicRoutes.get('/gs-files/:id/thumbnail', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json<ApiResponse>({
        success: false,
        error: '無効なファイルIDです'
      }, 400);
    }

    const gsFileRepo = new GSFileRepository(c.env.DB);
    const file = await gsFileRepo.findById(id);

    if (!file) {
      return c.json<ApiResponse>({
        success: false,
        error: 'ファイルが見つかりません'
      }, 404);
    }

    if (!file.thumbnail_path) {
      return c.json<ApiResponse>({
        success: false,
        error: 'サムネイルが設定されていません'
      }, 404);
    }

    const storage = new FileStorage(c.env.R2);
    const thumbnailObject = await storage.getFile(file.thumbnail_path);

    if (!thumbnailObject) {
      return c.json<ApiResponse>({
        success: false,
        error: 'サムネイルデータが見つかりません'
      }, 404);
    }

    // サムネイルを返す（R2ObjectのbodyはReadableStreamまたはnull）
    return new Response(thumbnailObject.body, {
      headers: {
        'Content-Type': 'image/jpeg', // デフォルトでJPEG
        'Cache-Control': 'public, max-age=3600' // 1時間キャッシュ
      }
    });
  } catch (error) {
    console.error('サムネイル取得エラー:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'サムネイルの取得に失敗しました'
    }, 500);
  }
});

export default publicRoutes; 