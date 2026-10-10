import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** The backend folder: one level above src/*.ts (dev) and dist/*.js (build) alike. */
export const BACKEND_ROOT = fileURLToPath(new URL('..', import.meta.url));

/**
 * Local .env files, nearest first. Variables already set in the environment (the hosting panel)
 * always win: process.loadEnvFile never overwrites them.
 */
function loadEnvFiles() {
  const files = [path.resolve('.env'), path.join(BACKEND_ROOT, '.env'), path.join(BACKEND_ROOT, '..', '.env')];
  for (const file of new Set(files)) {
    if (!existsSync(file)) continue;
    try {
      process.loadEnvFile(file);
    } catch (err) {
      console.warn(`[config] Không đọc được ${file}: ${(err as Error).message}`);
    }
  }
}
loadEnvFiles();

const env = process.env;

const text = (name: string, fallback = '') => env[name]?.trim() || fallback;

const int = (name: string, fallback: number) => {
  const value = Number.parseInt(env[name] ?? '', 10);
  return Number.isFinite(value) ? value : fallback;
};

const flag = (name: string, fallback: boolean) => {
  const value = env[name]?.trim().toLowerCase();
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on', 'require'].includes(value);
};

const list = (name: string, fallback: string) =>
  text(name, fallback)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: false | { rejectUnauthorized: boolean };
}

/** DATABASE_URL when given (one value to paste on a hosting panel), otherwise the DB_* variables of the former Java backend. */
function dbConfig(): DbConfig {
  let host: string;
  let port: number;
  let database: string;
  let user: string;
  let password: string;
  let sslMode: string | null = null;

  const url = text('DATABASE_URL');
  if (url) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error('DATABASE_URL không đúng dạng postgresql://user:password@host:port/database');
    }
    host = decodeURIComponent(parsed.hostname);
    port = parsed.port ? Number(parsed.port) : 5432;
    database = decodeURIComponent(parsed.pathname.replace(/^\//, '')) || 'postgres';
    user = decodeURIComponent(parsed.username);
    password = decodeURIComponent(parsed.password);
    sslMode = parsed.searchParams.get('sslmode');
  } else {
    host = text('DB_HOST', 'localhost');
    port = int('DB_PORT', 5432);
    database = text('DB_NAME', 'portal_db');
    user = text('DB_USERNAME', 'postgres');
    password = env.DB_PASSWORD ?? 'password';
  }

  // Supabase accepts encrypted connections; its pooler certificate is not in Node's default CA list,
  // so the channel is encrypted without verifying the chain (what the Java driver's sslmode=prefer did).
  let ssl: boolean;
  if (env.DB_SSL?.trim()) ssl = flag('DB_SSL', false);
  else if (sslMode) ssl = sslMode !== 'disable';
  else ssl = /(^|\.)supabase\.(co|com)$/i.test(host);

  const verify = flag('DB_SSL_VERIFY', sslMode === 'verify-ca' || sslMode === 'verify-full');
  return { host, port, database, user, password, ssl: ssl ? { rejectUnauthorized: verify } : false };
}

/** Express "trust proxy": requests come through the hosting's reverse proxy on a private network. */
function trustProxy(): boolean | number | string {
  const value = text('TRUST_PROXY', 'loopback, linklocal, uniquelocal, 100.64.0.0/10');
  if (value === 'true' || value === 'false') return value === 'true';
  if (/^\d+$/.test(value)) return Number(value);
  return value;
}

function timeZone(): string {
  const zone = text('APP_TIMEZONE', 'Asia/Ho_Chi_Minh');
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone });
    return zone;
  } catch {
    console.warn(`[config] APP_TIMEZONE "${zone}" không hợp lệ, dùng Asia/Ho_Chi_Minh.`);
    return 'Asia/Ho_Chi_Minh';
  }
}

export const config = {
  port: int('PORT', 8080),
  /** Interface to listen on; empty = all. 127.0.0.1 on a VPS, where only Nginx may reach the app. */
  host: text('HOST'),
  db: dbConfig(),
  dbPoolSize: Math.max(1, int('DB_POOL_SIZE', 10)),
  dbAppName: text('DB_APP_NAME', 'portal'),
  migrateOnStart: flag('DB_MIGRATE_ON_START', true),
  authSecret: env.APP_AUTH_SECRET ?? '',
  authTtlHours: Math.max(1, int('APP_AUTH_TTL_HOURS', 8)),
  corsOrigins: list(
    'APP_CORS_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,https://congthongtindientu.pages.dev',
  ),
  cacheTtlMs: Math.max(0, int('APP_CACHE_TTL', 60)) * 1000,
  timeZone: timeZone(),
  trustProxy: trustProxy(),
  staticDir: path.resolve(text('STATIC_DIR') || path.join(BACKEND_ROOT, '..', 'frontend', 'dist')),
  storage: {
    provider: text('STORAGE_PROVIDER', 'cloudinary').toLowerCase(),
    cloudinary: {
      cloudName: text('CLOUDINARY_CLOUD_NAME'),
      apiKey: text('CLOUDINARY_API_KEY'),
      apiSecret: text('CLOUDINARY_API_SECRET'),
      url: text('CLOUDINARY_URL'),
    },
  },
};
