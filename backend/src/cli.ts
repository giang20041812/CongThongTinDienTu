import { config } from './config.js';
import { describeDb, pool } from './db.js';
import { migrate } from './migrations.js';
import { importCloudinaryFiles } from './storage/importCloudinary.js';
import { localStorage } from './storage/local.js';

/**
 * `node dist/cli.js <command>`:
 *   migrate            applies pending db/migrations without starting the server (`npm run db:migrate`)
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
    case 'import-cloudinary': {
      console.log(`[db] Cơ sở dữ liệu: ${describeDb()} · thư mục tệp: ${config.storage.local.dir}`);
      const { total, copied, failed } = await importCloudinaryFiles(localStorage(config.storage.local));
      console.log(`[import] Xong: chép ${copied}/${total} tệp${failed ? `, ${failed} lỗi (chạy lại để thử tiếp)` : ''}.`);
      if (copied) console.log('[import] Khởi động lại web để xoá cache: sudo systemctl restart portal');
      if (failed) process.exitCode = 1;
      return;
    }
    default:
      console.log('Cách dùng: node dist/cli.js migrate | import-cloudinary');
      process.exitCode = 1;
  }
}

main(process.argv[2])
  .catch((err) => {
    console.error(`[cli] ${process.argv[2]} thất bại:`, err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
