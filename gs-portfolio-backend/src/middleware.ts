import { Context, Next } from 'hono';
import { cors } from 'hono/cors';
import { Env, AdminUser, AdminSession } from './types';
import { AdminUserRepository, AdminSessionRepository } from './db';
import { extractTokenFromCookie } from './auth';

// Honoコンテキストの型拡張
interface Variables {
  user: AdminUser;
  session: AdminSession;
}

// CORS設定
export const corsMiddleware = cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // 開発環境用
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// セキュリティヘッダー設定
export const securityHeaders = async (c: Context, next: Next) => {
  await next();
  
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Content-Security-Policy', "default-src 'self'");
};

// 認証ミドルウェア
export const authMiddleware = async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
  try {
    const cookieHeader = c.req.header('Cookie') || null;
    const sessionToken = extractTokenFromCookie(cookieHeader);

    if (!sessionToken) {
      return c.json({ success: false, error: '認証が必要です' }, 401);
    }

    // セッション検証
    const sessionRepo = new AdminSessionRepository(c.env.DB);
    const session = await sessionRepo.findByToken(sessionToken);

    if (!session) {
      return c.json({ success: false, error: 'セッションが無効です' }, 401);
    }

    // ユーザー情報取得
    const userRepo = new AdminUserRepository(c.env.DB);
    const user = await userRepo.findById(session.user_id);

    if (!user) {
      return c.json({ success: false, error: 'ユーザーが見つかりません' }, 401);
    }

    // コンテキストにユーザー情報を設定
    c.set('user', user);
    c.set('session', session);

    await next();
  } catch (error) {
    console.error('認証エラー:', error);
    return c.json({ success: false, error: '認証処理でエラーが発生しました' }, 500);
  }
};

// エラーハンドリングミドルウェア
export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error('API エラー:', error);
    
    if (error instanceof Error) {
      return c.json({
        success: false,
        error: 'サーバーエラーが発生しました',
        message: error.message
      }, 500);
    }
    
    return c.json({
      success: false,
      error: '予期しないエラーが発生しました'
    }, 500);
  }
};

// リクエストログミドルウェア
export const requestLogger = async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  
  await next();
  
  const duration = Date.now() - start;
  const status = c.res.status;
  
  console.log(`${method} ${url} - ${status} (${duration}ms)`);
}; 