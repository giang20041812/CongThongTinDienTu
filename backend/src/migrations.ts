import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { BACKEND_ROOT } from './config.js';
import { transaction } from './db.js';

const MIGRATIONS_DIR = path.join(BACKEND_ROOT, 'db', 'migrations');
/** Any constant: serializes concurrent start-ups (e.g. two containers) on the same database. */
const LOCK_KEY = 7_425_001;
/** The schema and starting content the former Java backend created with Liquibase (changesets v2-01..v2-05). */
const LIQUIBASE_EQUIVALENT = ['0001_schema', '0002_seed'];

/**
 * Applies the pending db/migrations/NNNN_name.sql files in order, all in one transaction, recording them in
 * schema_migrations. A schema change = a new file; never edit a file that has already run somewhere.
 */
export async function migrate(log: (message: string) => void = console.log): Promise<string[]> {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d+_[\w-]+\.sql$/.test(f))
    .sort();

  return transaction(async (db) => {
    await db.query('SELECT pg_advisory_xact_lock($1)', [LOCK_KEY]);
    await db.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version    VARCHAR(100) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    const applied = new Set(
      (await db.query<{ version: string }>('SELECT version FROM schema_migrations')).rows.map((r) => r.version),
    );

    if (applied.size === 0) {
      const { rows } = await db.query<{ categories: string | null; timetable: string | null }>(
        "SELECT to_regclass('categories')::text AS categories, to_regclass('timetable_periods')::text AS timetable",
      );
      if (rows[0].categories) {
        if (!rows[0].timetable) {
          throw new Error(
            'Cơ sở dữ liệu có bảng categories nhưng thiếu timetable_periods (schema cũ hơn bản Java cuối cùng). ' +
              'Hãy kiểm tra lại trước khi chạy.',
          );
        }
        // Created by the Java backend: the tables and the menu are already there, so nothing is re-run.
        for (const version of LIQUIBASE_EQUIVALENT) {
          await db.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
          applied.add(version);
        }
        log('[db] Nhận cơ sở dữ liệu có sẵn từ bản Java (Liquibase) – không chạy lại schema/dữ liệu mẫu.');
      }
    }

    const ran: string[] = [];
    for (const file of files) {
      const version = file.replace(/\.sql$/, '');
      if (applied.has(version)) continue;
      // Normalised line endings: a Windows checkout must not put \r into multi-line seed values.
      const sql = readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8').replace(/\r\n/g, '\n');
      await db.query(sql);
      await db.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
      ran.push(version);
      log(`[db] Đã áp dụng migration ${file}`);
    }
    return ran;
  });
}
