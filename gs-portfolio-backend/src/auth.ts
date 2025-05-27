import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminUser } from './types';

// パスワードハッシュ化
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// パスワード検証
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// JWTトークン生成
export function generateJWT(user: AdminUser, secret: string): string {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email
  };

  return jwt.sign(payload, secret, {
    expiresIn: '24h',
    issuer: 'gs-portfolio-backend'
  });
}

// JWTトークン検証
export function verifyJWT(token: string, secret: string): any {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

// セッショントークン生成
export function generateSessionToken(): string {
  return crypto.randomUUID();
}

// セッション有効期限計算（24時間後）
export function getSessionExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
}

// Cookieからトークンを抽出
export function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const sessionCookie = cookies.find(cookie => cookie.startsWith('session='));
  
  if (!sessionCookie) return null;
  
  return sessionCookie.split('=')[1];
}

// セキュアなCookie設定
export function createSecureCookie(name: string, value: string, maxAge: number = 86400): string {
  return `${name}=${value}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Path=/`;
}

// Cookieクリア
export function clearCookie(name: string): string {
  return `${name}=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`;
} 