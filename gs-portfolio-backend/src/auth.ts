import { AdminUser } from './types';

// パスワードハッシュ化（Web Crypto API使用）
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // ランダムソルト生成
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // PBKDF2でハッシュ化
  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );
  
  // ソルトとハッシュを結合してBase64エンコード
  const combined = new Uint8Array(salt.length + hashBuffer.byteLength);
  combined.set(salt);
  combined.set(new Uint8Array(hashBuffer), salt.length);
  
  return btoa(String.fromCharCode(...combined));
}

// パスワード検証（Web Crypto API使用）
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    // Base64デコードして、ソルトとハッシュを分離
    const combined = new Uint8Array(
      atob(hashedPassword).split('').map(char => char.charCodeAt(0))
    );
    
    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);
    
    // 入力パスワードを同じ方法でハッシュ化
    const key = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    );
    
    const computedHash = new Uint8Array(hashBuffer);
    
    // ハッシュを比較
    if (computedHash.length !== storedHash.length) {
      return false;
    }
    
    for (let i = 0; i < computedHash.length; i++) {
      if (computedHash[i] !== storedHash[i]) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('パスワード検証エラー:', error);
    return false;
  }
}

// JWTトークン生成（Web Crypto API使用）
export async function generateJWT(user: AdminUser, secret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24時間後
    iss: 'gs-portfolio-backend'
  };
  
  const encoder = new TextEncoder();
  
  // Base64URL エンコード
  const base64UrlEncode = (obj: any): string => {
    const json = JSON.stringify(obj);
    const base64 = btoa(json);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };
  
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const data = `${encodedHeader}.${encodedPayload}`;
  
  // HMAC-SHA256で署名
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return `${data}.${encodedSignature}`;
}

// JWTトークン検証（Web Crypto API使用）
export async function verifyJWT(token: string, secret: string): Promise<any> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;
    
    // 署名検証
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signature = new Uint8Array(
      atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map(char => char.charCodeAt(0))
    );
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      encoder.encode(data)
    );
    
    if (!isValid) {
      return null;
    }
    
    // ペイロードをデコード
    const payloadJson = atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);
    
    // 有効期限チェック
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('JWT検証エラー:', error);
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