import crypto from 'node:crypto';
import { promisify } from 'node:util';
import type { Request, RequestHandler } from 'express';

export type Role = 'ADMIN' | 'USER';
export const ROLES: readonly Role[] = ['ADMIN', 'USER'];

export interface AuthUser {
  id: string;
  role: Role;
}

declare module 'express-serve-static-core' {
  interface Request {
    authUser?: AuthUser;
  }
}

export const currentUser = (req: Request) => req.authUser ?? null;
export const isAdmin = (req: Request) => req.authUser?.role === 'ADMIN';

// ---------------------------------------------------------------------------
// Tokens: stateless HMAC-SHA256 bearer tokens base64url(userId|role|expiry).base64url(signature) – the format
// of the former Java backend, so a token it issued stays valid when APP_AUTH_SECRET is unchanged.
// ---------------------------------------------------------------------------

const BASE64URL = /^[A-Za-z0-9_-]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class TokenService {
  private readonly secret: Buffer;
  private readonly ttlMs: number;

  constructor(configuredSecret: string, ttlHours: number) {
    if (!configuredSecret || configuredSecret.length < 32) {
      this.secret = crypto.randomBytes(32);
      console.warn(
        '[auth] APP_AUTH_SECRET chưa đặt hoặc ngắn hơn 32 ký tự – dùng khoá ngẫu nhiên, ' +
          'mọi phiên đăng nhập quản trị sẽ mất khi khởi động lại.',
      );
    } else {
      this.secret = Buffer.from(configuredSecret, 'utf8');
    }
    this.ttlMs = Math.max(1, ttlHours) * 3_600_000;
  }

  issue(user: AuthUser): { token: string; expiresAt: Date } {
    const expiresAt = new Date(Date.now() + this.ttlMs);
    const payload = `${user.id}|${user.role}|${Math.floor(expiresAt.getTime() / 1000)}`;
    const encoded = Buffer.from(payload, 'utf8').toString('base64url');
    return { token: `${encoded}.${this.sign(encoded).toString('base64url')}`, expiresAt };
  }

  verify(token: string | null | undefined): AuthUser | null {
    if (!token) return null;
    const dot = token.indexOf('.');
    if (dot <= 0 || dot === token.length - 1) return null;
    const encoded = token.slice(0, dot);
    const signatureText = token.slice(dot + 1);
    if (!BASE64URL.test(encoded) || !BASE64URL.test(signatureText)) return null;

    const signature = Buffer.from(signatureText, 'base64url');
    const expected = this.sign(encoded);
    if (signature.length !== expected.length || !crypto.timingSafeEqual(signature, expected)) return null;

    const parts = Buffer.from(encoded, 'base64url').toString('utf8').split('|');
    if (parts.length !== 3) return null;
    const [id, role, expiry] = parts;
    const expirySeconds = Number(expiry);
    if (!Number.isInteger(expirySeconds) || Math.floor(Date.now() / 1000) >= expirySeconds) return null;
    if (!UUID.test(id) || !(ROLES as readonly string[]).includes(role)) return null;
    return { id: id.toLowerCase(), role: role as Role };
  }

  private sign(data: string): Buffer {
    return crypto.createHmac('sha256', this.secret).update(data, 'utf8').digest();
  }
}

// ---------------------------------------------------------------------------
// Passwords: PBKDF2-HMAC-SHA256, stored as pbkdf2$<iterations>$<salt b64>$<hash b64> (same as the Java backend,
// so existing accounts keep their passwords).
// ---------------------------------------------------------------------------

const pbkdf2 = promisify(crypto.pbkdf2);
const PREFIX = 'pbkdf2';
const ITERATIONS = 120_000;
const KEY_BYTES = 32;
const b64 = (bytes: Buffer) => bytes.toString('base64').replace(/=+$/, '');

export async function hashPassword(raw: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = await pbkdf2(raw, salt, ITERATIONS, KEY_BYTES, 'sha256');
  return `${PREFIX}$${ITERATIONS}$${b64(salt)}$${b64(key)}`;
}

export const isHashed = (stored: string | null | undefined) => typeof stored === 'string' && stored.startsWith(`${PREFIX}$`);

export async function passwordMatches(raw: string | null | undefined, stored: string | null | undefined): Promise<boolean> {
  if (raw == null || stored == null) return false;
  if (!isHashed(stored)) {
    // Plaintext row (seed data or a password reset typed in SQL): constant-time compare; callers re-hash it.
    const a = Buffer.from(raw, 'utf8');
    const b = Buffer.from(stored, 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  const parts = stored.split('$');
  if (parts.length !== 4) return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations <= 0 || iterations > 10_000_000) return false;
  const expected = Buffer.from(parts[3], 'base64');
  const key = await pbkdf2(raw, Buffer.from(parts[2], 'base64'), iterations, KEY_BYTES, 'sha256');
  return key.length === expected.length && crypto.timingSafeEqual(key, expected);
}

// ---------------------------------------------------------------------------
// Rate limiting (in memory, per process)
// ---------------------------------------------------------------------------

/** Locks a (client, username) pair for 5 minutes after 5 failed logins within 15 minutes. */
export class LoginAttemptLimiter {
  private static readonly MAX_FAILURES = 5;
  private static readonly WINDOW_MS = 15 * 60_000;
  private static readonly LOCK_MS = 5 * 60_000;

  private readonly attempts = new Map<string, { failures: number; windowStart: number; lockedUntil: number | null }>();

  isLocked(key: string): boolean {
    const current = this.attempts.get(key);
    return !!current?.lockedUntil && Date.now() < current.lockedUntil;
  }

  recordFailure(key: string) {
    const now = Date.now();
    const current = this.attempts.get(key);
    if (!current || now > current.windowStart + LoginAttemptLimiter.WINDOW_MS) {
      this.attempts.set(key, { failures: 1, windowStart: now, lockedUntil: null });
    } else {
      const failures = current.failures + 1;
      const lockedUntil = failures >= LoginAttemptLimiter.MAX_FAILURES ? now + LoginAttemptLimiter.LOCK_MS : null;
      this.attempts.set(key, { failures, windowStart: current.windowStart, lockedUntil });
    }
    if (this.attempts.size > 10_000) {
      for (const [k, v] of this.attempts) if (now > v.windowStart + LoginAttemptLimiter.WINDOW_MS) this.attempts.delete(k);
    }
  }

  recordSuccess(key: string) {
    this.attempts.delete(key);
  }
}

/** Caps public form submissions (feedback) per client: 5 per 30 minutes. */
export class SubmissionRateLimiter {
  private static readonly MAX_SUBMISSIONS = 5;
  private static readonly WINDOW_MS = 30 * 60_000;

  private readonly windows = new Map<string, { count: number; start: number }>();

  /** Records an attempt and returns whether it is allowed. */
  tryAcquire(key: string): boolean {
    const now = Date.now();
    const current = this.windows.get(key);
    const updated =
      !current || now > current.start + SubmissionRateLimiter.WINDOW_MS
        ? { count: 1, start: now }
        : { count: current.count + 1, start: current.start };
    this.windows.set(key, updated);
    if (this.windows.size > 10_000) {
      for (const [k, v] of this.windows) if (now > v.start + SubmissionRateLimiter.WINDOW_MS) this.windows.delete(k);
    }
    return updated.count <= SubmissionRateLimiter.MAX_SUBMISSIONS;
  }
}

/** The client address (the real one behind the hosting's proxy, see TRUST_PROXY). */
export const clientIp = (req: Request) => req.ip ?? req.socket.remoteAddress ?? 'unknown';

// ---------------------------------------------------------------------------
// Access rule: visitors may read (except feedback and post-by-id), submit feedback, count views and log in.
// Every other request under /api needs an admin bearer token from POST /api/auth/login.
// ---------------------------------------------------------------------------

const VIEW_COUNTER = /^\/api\/posts\/[^/]+\/views\/?$/;
/** Post lookup by id serves drafts too; visitors read published posts via /api/posts/by-slug/. */
const POST_BY_ID = /^\/api\/posts\/[0-9a-fA-F-]{36}\/?$/;
const FEEDBACK = '/api/feedback';

function requiresAdmin(method: string, path: string): boolean {
  if (path.startsWith('/api/users')) return true;
  if (method === 'GET' || method === 'HEAD') return path.startsWith(FEEDBACK) || POST_BY_ID.test(path);
  return !(
    method === 'POST' &&
    (path === '/api/auth/login' || VIEW_COUNTER.test(path) || path === FEEDBACK || path === `${FEEDBACK}/`)
  );
}

/** Mounted on /api: reads the bearer token, then rejects admin-only requests without a valid admin token. */
export function authenticate(tokens: TokenService): RequestHandler {
  return (req, res, next) => {
    if (req.method === 'OPTIONS') return next();
    const header = req.get('authorization');
    if (header && header.slice(0, 7).toLowerCase() === 'bearer ') {
      const user = tokens.verify(header.slice(7).trim());
      if (user) req.authUser = user;
    }
    if (!requiresAdmin(req.method, req.baseUrl + req.path) || isAdmin(req)) return next();
    res.status(401).json({ error: 'Unauthorized', message: 'Bạn cần đăng nhập quản trị để thực hiện thao tác này.' });
  };
}
