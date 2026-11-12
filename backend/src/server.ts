import { createApp, createServices } from './app.js';
import { config } from './config.js';
import { describeDb, pool, query } from './db.js';
import { migrate } from './migrations.js';
import { hashPassword, isHashed } from './security.js';

/** Hashes any plaintext password: the seeded admin123, or a reset typed directly in SQL. */
async function hashPlaintextPasswords() {
  try {
    const users = await query<{ id: string; password_hash: string }>(`SELECT id, password_hash FROM users`);
    const plaintext = users.filter((u) => !isHashed(u.password_hash));
    for (const user of plaintext) {
      await query(`UPDATE users SET password_hash = $2 WHERE id = $1`, [user.id, await hashPassword(user.password_hash)]);
    }
    if (plaintext.length) console.log(`[auth] Đã băm ${plaintext.length} mật khẩu dạng chữ thường.`);
  } catch (err) {
    console.warn(`[auth] Bỏ qua bước băm mật khẩu: ${(err as Error).message}`);
  }
}

async function main() {
  console.log(`[db] Cơ sở dữ liệu: ${describeDb()}`);
  if (config.migrateOnStart) await migrate();
  await hashPlaintextPasswords();

  const app = createApp(createServices());
  const onListening = () => console.log(`[http] Cổng thông tin đang chạy tại http://${config.host || 'localhost'}:${config.port}`);
  const server = config.host ? app.listen(config.port, config.host, onListening) : app.listen(config.port, onListening);

  const shutdown = (signal: string) => {
    console.log(`[http] Nhận ${signal}, đang dừng...`);
    server.close(() => void pool.end().finally(() => process.exit(0)));
    setTimeout(() => process.exit(0), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('[startup] Không khởi động được – kiểm tra kết nối cơ sở dữ liệu (DATABASE_URL hoặc DB_*):', err);
  process.exit(1);
});
