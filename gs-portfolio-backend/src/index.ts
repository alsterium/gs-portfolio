import { Hono } from 'hono';
import { Env } from './types';
import { corsMiddleware, securityHeaders, errorHandler, requestLogger } from './middleware';
import publicRoutes from './routes/public';

const app = new Hono<{ Bindings: Env }>();

// ミドルウェア設定
app.use('*', corsMiddleware);
app.use('*', securityHeaders);
app.use('*', requestLogger);
app.use('*', errorHandler);

// ルート設定
app.route('/api', publicRoutes);

// ヘルスチェック
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// デフォルトルート
app.get('/', (c) => {
  return c.text('Gaussian Splatting Portfolio Backend API');
});

export default app;
