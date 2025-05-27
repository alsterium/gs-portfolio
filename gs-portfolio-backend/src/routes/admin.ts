import { Hono } from 'hono';
import { Env, ApiResponse, LoginRequest, AdminUser, CreateGSFileRequest, UpdateGSFileRequest } from '../types';
import { AdminUserRepository, AdminSessionRepository, GSFileRepository } from '../db';
import { verifyPassword, generateSessionToken, getSessionExpiry, createSecureCookie, clearCookie } from '../auth';
import { authMiddleware } from '../middleware';
import { FileStorage, FileValidator } from '../storage';

const adminRoutes = new Hono<{ Bindings: Env }>();

// ログイン
adminRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json() as LoginRequest;
    const { username, password } = body;

    if (!username || !password) {
      return c.json<ApiResponse>({
        success: false,
        error: 'ユーザー名とパスワードが必要です'
      }, 400);
    }

    // ユーザー検証
    const userRepo = new AdminUserRepository(c.env.DB);
    const user = await userRepo.findByUsername(username);

    if (!user || !await verifyPassword(password, user.password_hash)) {
      return c.json<ApiResponse>({
        success: false,
        error: 'ユーザー名またはパスワードが正しくありません'
      }, 401);
    }

    // セッション作成
    const sessionRepo = new AdminSessionRepository(c.env.DB);
    const sessionToken = generateSessionToken();
    const expiresAt = getSessionExpiry();
    
    await sessionRepo.create(user.id, sessionToken, expiresAt);
    await userRepo.updateLastLogin(user.id);

    // セキュアCookie設定
    const cookie = createSecureCookie('session', sessionToken);
    
    return c.json<ApiResponse<{ user: Omit<AdminUser, 'password_hash'> }>>({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_date: user.created_date,
          last_login: user.last_login,
          is_active: user.is_active
        }
      }
    }, 200, {
      'Set-Cookie': cookie
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'ログイン処理でエラーが発生しました'
    }, 500);
  }
});

// ログアウト
adminRoutes.post('/logout', authMiddleware, async (c) => {
  try {
    const session = c.get('session');
    
    // セッション削除
    const sessionRepo = new AdminSessionRepository(c.env.DB);
    await sessionRepo.delete(session.session_token);

    // Cookieクリア
    const cookie = clearCookie('session');
    
    return c.json<ApiResponse>({
      success: true,
      message: 'ログアウトしました'
    }, 200, {
      'Set-Cookie': cookie
    });
  } catch (error) {
    console.error('ログアウトエラー:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'ログアウト処理でエラーが発生しました'
    }, 500);
  }
});

// 現在のユーザー情報取得
adminRoutes.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  
  return c.json<ApiResponse<{ user: AdminUser }>>({
    success: true,
    data: { user }
  });
});

// GSファイルアップロード
adminRoutes.post('/gs-files', authMiddleware, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const thumbnail = formData.get('thumbnail') as File | null;
    const displayName = formData.get('display_name') as string;
    const description = formData.get('description') as string | null;

    if (!file || !displayName) {
      return c.json<ApiResponse>({
        success: false,
        error: 'ファイルと表示名が必要です'
      }, 400);
    }

    // ファイル検証
    const fileValidation = FileValidator.validateGSFile(file);
    if (!fileValidation.valid) {
      return c.json<ApiResponse>({
        success: false,
        error: fileValidation.error
      }, 400);
    }

    // サムネイル検証（存在する場合）
    if (thumbnail) {
      const thumbnailValidation = FileValidator.validateThumbnail(thumbnail);
      if (!thumbnailValidation.valid) {
        return c.json<ApiResponse>({
          success: false,
          error: thumbnailValidation.error
        }, 400);
      }
    }

    // ファイルアップロード
    const storage = new FileStorage(c.env.R2);
    const filePath = FileValidator.generateFilePath(file.name);
    const thumbnailPath = thumbnail ? FileValidator.generateFilePath(thumbnail.name, 'thumbnails') : undefined;

    await storage.uploadFile(filePath, await file.arrayBuffer(), file.type);
    
    if (thumbnail && thumbnailPath) {
      await storage.uploadFile(thumbnailPath, await thumbnail.arrayBuffer(), thumbnail.type);
    }

    // データベースに保存
    const gsFileRepo = new GSFileRepository(c.env.DB);
    const createData: CreateGSFileRequest = {
      filename: file.name,
      display_name: displayName,
      description: description || undefined,
      file_size: file.size,
      mime_type: file.type
    };

    const savedFile = await gsFileRepo.create(createData, filePath, thumbnailPath);

    return c.json<ApiResponse>({
      success: true,
      data: savedFile,
      message: 'ファイルがアップロードされました'
    }, 201);
  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'ファイルのアップロードに失敗しました'
    }, 500);
  }
});

// GSファイル更新
adminRoutes.put('/gs-files/:id', authMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json() as UpdateGSFileRequest;

    if (isNaN(id)) {
      return c.json<ApiResponse>({
        success: false,
        error: '無効なファイルIDです'
      }, 400);
    }

    const gsFileRepo = new GSFileRepository(c.env.DB);
    const updatedFile = await gsFileRepo.update(id, body);

    if (!updatedFile) {
      return c.json<ApiResponse>({
        success: false,
        error: 'ファイルが見つかりません'
      }, 404);
    }

    return c.json<ApiResponse>({
      success: true,
      data: updatedFile,
      message: 'ファイル情報が更新されました'
    });
  } catch (error) {
    console.error('ファイル更新エラー:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'ファイルの更新に失敗しました'
    }, 500);
  }
});

// GSファイル削除
adminRoutes.delete('/gs-files/:id', authMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json<ApiResponse>({
        success: false,
        error: '無効なファイルIDです'
      }, 400);
    }

    const gsFileRepo = new GSFileRepository(c.env.DB);
    
    // ファイル情報取得
    const file = await gsFileRepo.findById(id);
    if (!file) {
      return c.json<ApiResponse>({
        success: false,
        error: 'ファイルが見つかりません'
      }, 404);
    }

    // ストレージからファイル削除
    const storage = new FileStorage(c.env.R2);
    await storage.deleteFile(file.file_path);
    
    if (file.thumbnail_path) {
      await storage.deleteFile(file.thumbnail_path);
    }

    // データベースから論理削除
    const deleted = await gsFileRepo.delete(id);

    if (!deleted) {
      return c.json<ApiResponse>({
        success: false,
        error: 'ファイルの削除に失敗しました'
      }, 500);
    }

    return c.json<ApiResponse>({
      success: true,
      message: 'ファイルが削除されました'
    });
  } catch (error) {
    console.error('ファイル削除エラー:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'ファイルの削除に失敗しました'
    }, 500);
  }
});

export default adminRoutes; 