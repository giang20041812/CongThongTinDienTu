import pg from 'pg';
import { config } from './config.js';

const { Pool, types } = pg;

// DATE, TIME and TIMESTAMP columns hold wall-clock values without a zone. They are passed through as the text
// PostgreSQL sends (ISO "2026-10-08T07:30:00"), exactly as the Java API serialized them; converting them to JS
// Dates would shift them by the server's UTC offset.
types.setTypeParser(types.builtins.DATE, (value) => value);
types.setTypeParser(types.builtins.TIME, (value) => value);
types.setTypeParser(types.builtins.TIMESTAMP, (value) => value.replace(' ', 'T'));
// count(*) and file sizes: bigint fits a JS number here.
types.setTypeParser(types.builtins.INT8, (value) => Number(value));

// Only unnamed prepared statements are used (no `name` on queries), which the Supabase pooler in transaction
// mode (port 6543) supports – the Java driver needed prepareThreshold=0 for the same reason.
export const pool = new Pool({
  ...config.db,
  max: config.dbPoolSize,
  application_name: config.dbAppName,
  connectionTimeoutMillis: 20_000,
  idleTimeoutMillis: 30_000,
});

// An idle connection dropped by the server must not crash the process; the pool simply opens a new one.
pool.on('error', (err) => console.error('[db] Kết nối rảnh bị lỗi:', err.message));

export type Db = pg.Pool | pg.PoolClient;

export async function query<T = Record<string, unknown>>(sql: string, params: unknown[] = [], db: Db = pool): Promise<T[]> {
  const result = await db.query(sql, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(sql: string, params: unknown[] = [], db: Db = pool): Promise<T | undefined> {
  const rows = await query<T>(sql, params, db);
  return rows[0];
}

/** Runs `work` in one transaction (committed if it resolves, rolled back if it throws). */
export async function transaction<T>(work: (db: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  let broken = false;
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {
      broken = true;
    });
    throw err;
  } finally {
    client.release(broken);
  }
}

/** "host:port/database" for start-up logs (never the password). */
export const describeDb = () => `${config.db.host}:${config.db.port}/${config.db.database}${config.db.ssl ? ' (SSL)' : ''}`;
