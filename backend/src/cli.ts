import { describeDb, pool } from './db.js';
import { migrate } from './migrations.js';

/** `node dist/cli.js migrate` (or `npm run db:migrate`): applies pending db/migrations without starting the server. */
async function main(command: string | undefined) {
  if (command !== 'migrate') {
    console.log('Cách dùng: node dist/cli.js migrate');
    process.exitCode = 1;
    return;
  }
  console.log(`[db] Cơ sở dữ liệu: ${describeDb()}`);
  const ran = await migrate();
  console.log(ran.length ? `[db] Xong, đã áp dụng ${ran.length} migration.` : '[db] Không có migration mới.');
}

main(process.argv[2])
  .catch((err) => {
    console.error('[db] Migration thất bại:', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
