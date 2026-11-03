import crypto from 'node:crypto';
import { config } from './config.js';
import { describeDb, pool, query } from './db.js';
import { addEnglishCategoryNames } from './englishCategories.js';
import { migrate } from './migrations.js';
import { hashPassword } from './security.js';
import { importCloudinaryFiles } from './storage/importCloudinary.js';
import { localStorage } from './storage/local.js';

/**
 * `node dist/cli.js <command>`:
 *   migrate            applies pending db/migrations without starting the server (`npm run db:migrate`)
 *   create-editors     creates one editor account per top-level menu entry that has none (random passwords, printed once)
 *   english-names      fills the English name of the default menu entries that have none (`npm run db:english-names`)
 *   import-cloudinary  copies the Cloudinary files the content uses to UPLOAD_DIR and rewrites their links
 */
async function main(command: string | undefined) {
  switch (command) {
    case 'migrate': {
      console.log(`[db] Cơ sở dữ liệu: ${describeDb()}`);
      const ran = await migrate();
      console.log(ran.length ? `[db] Xong, đã áp dụng ${ran.length} migration.` : '[db] Không có migration mới.');
      return;
    }
    case 'create-editors': {
      const entries = await query<{ id: string; slug: string; name: string; username: string | null }>(
        `SELECT c.id, c.slug, c.name, (SELECT u.username FROM users u WHERE u.category_id = c.id AND u.role = 'EDITOR' LIMIT 1) AS username
         FROM categories c WHERE c.parent_id IS NULL AND c.page_type = 'GROUP' ORDER BY c.sort_order`,
      );
      for (const entry of entries) {
        if (entry.username) {
          console.log(`[editors] ${entry.name}: đã có tài khoản "${entry.username}" – bỏ qua.`);
          continue;
        }
        const username = `bt-${entry.slug}`.slice(0, 50);
        const password = crypto.randomBytes(9).toString('base64url');
        await query(`INSERT INTO users (username, password_hash, role, category_id) VALUES ($1, $2, 'EDITOR', $3) ON CONFLICT (username) DO NOTHING`, [
          username,
          await hashPassword(password),
          entry.id,
        ]);
        console.log(`[editors] ${entry.name}: ${username} / ${password}`);
      }
      console.log('[editors] Hãy lưu lại mật khẩu ở trên – sẽ không hiển thị lại.');
      return;
    }
    case 'english-names': {
      console.log(`[db] Cơ sở dữ liệu: ${describeDb()}`);
      const { updated, missing } = await addEnglishCategoryNames();
      updated.forEach((line) => console.log(`[english] ${line}`));
      missing.forEach((line) => console.log(`[english] Chưa có bản dịch: ${line} – nhập trong trang quản trị.`));
      console.log(`[english] Xong: thêm ${updated.length} tên tiếng Anh.`);
      if (updated.length) console.log('[english] Khởi động lại web để xoá cache: sudo systemctl restart portal');
      return;
    }
    case 'import-cloudinary': {
      console.log(`[db] Cơ sở dữ liệu: ${describeDb()} · thư mục tệp: ${config.storage.local.dir}`);
      const { total, copied, failed } = await importCloudinaryFiles(localStorage(config.storage.local));
      console.log(`[import] Xong: chép ${copied}/${total} tệp${failed ? `, ${failed} lỗi (chạy lại để thử tiếp)` : ''}.`);
      if (copied) console.log('[import] Khởi động lại web để xoá cache: sudo systemctl restart portal');
      if (failed) process.exitCode = 1;
      return;
    }
    default:
      console.log('Cách dùng: node dist/cli.js migrate | create-editors | english-names | import-cloudinary');
      process.exitCode = 1;
  }
}

main(process.argv[2])
  .catch((err) => {
    console.error(`[cli] ${process.argv[2]} thất bại:`, err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
