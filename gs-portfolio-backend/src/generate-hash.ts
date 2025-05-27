// パスワードハッシュ生成スクリプト
import { hashPassword } from './auth';

async function generatePasswordHash() {
  const password = 'admin123';
  const hash = await hashPassword(password);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

generatePasswordHash().catch(console.error); 