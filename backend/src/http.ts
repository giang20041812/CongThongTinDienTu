import type { ErrorRequestHandler, Request } from 'express';

/** An error answered as JSON {message} (or a custom body) with the given status; 404 without a body. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export const badRequest = (message: string) => new HttpError(400, message);
export const conflict = (message: string) => new HttpError(409, message);
export const notFound = () => new HttpError(404, '');

const MALFORMED = 'Dữ liệu gửi lên không đúng định dạng.';
const malformed = () => badRequest(MALFORMED);

// PostgreSQL integrity (class 23) and data (class 22) errors: the Java backend answered 409 with this message.
const INTEGRITY_MESSAGE = 'Dữ liệu bị trùng hoặc thiếu trường bắt buộc.';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof HttpError) {
    if (err.status === 404 && !err.message && !err.body) return void res.status(404).end();
    return void res.status(err.status).json(err.body ?? { message: err.message });
  }
  const type = (err as { type?: string }).type;
  if (type === 'entity.parse.failed' || type === 'encoding.unsupported' || type === 'charset.unsupported') {
    return void res.status(400).json({ message: MALFORMED });
  }
  if (type === 'entity.too.large') {
    return void res.status(413).json({ message: 'Dữ liệu gửi lên quá lớn.' });
  }
  const code = (err as { code?: unknown }).code;
  if (typeof code === 'string' && /^2[23][0-9A-Z]{3}$/.test(code)) {
    console.warn(`[api] ${req.method} ${req.originalUrl}: ${(err as Error).message}`);
    return void res.status(409).json({ message: INTEGRITY_MESSAGE });
  }
  console.error(`[api] ${req.method} ${req.originalUrl} thất bại:`, err);
  res.status(500).json({ message: 'Máy chủ gặp lỗi, vui lòng thử lại sau.' });
};

// ---------------------------------------------------------------------------
// Request reading. Mirrors the leniency of the Java API (Jackson): unknown properties are ignored, numbers and
// booleans may arrive as strings, and a value of the wrong shape is a 400 "malformed" error.
// ---------------------------------------------------------------------------

export type Json = Record<string, unknown>;

/** A JSON request body is required (Express leaves req.body undefined when none was sent). */
export function requireBody(body: unknown): unknown {
  if (body === undefined) throw malformed();
  return body;
}

export function jsonObject(body: unknown): Json {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) throw malformed();
  return body as Json;
}

export function jsonArray(body: unknown): unknown[] {
  if (!Array.isArray(body)) throw malformed();
  return body;
}

export function str(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  throw malformed();
}

export function bool(value: unknown): boolean | null {
  if (value == null) return null;
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1) return true;
  if (value === 'false' || value === 0) return false;
  if (value === '') return null;
  throw malformed();
}

export function int(value: unknown): number | null {
  if (value == null) return null;
  const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof number !== 'number' || !Number.isFinite(number)) {
    if (value === '') return null;
    throw malformed();
  }
  const truncated = Math.trunc(number);
  if (truncated > 2_147_483_647 || truncated < -2_147_483_648) throw malformed();
  return truncated;
}

/** Same as int(), for byte sizes (Java Long). */
export function long(value: unknown): number | null {
  if (value == null || value === '') return null;
  const number = typeof value === 'string' ? Number(value) : value;
  if (typeof number !== 'number' || !Number.isSafeInteger(Math.trunc(number))) throw malformed();
  return Math.trunc(number);
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => UUID_PATTERN.test(value);

/** A UUID (lower-cased, as PostgreSQL returns it) or null. */
export function uuid(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || !isUuid(value)) throw malformed();
  return value.toLowerCase();
}

/** A path or query parameter that must be a UUID. */
export function uuidParam(value: unknown): string {
  const id = typeof value === 'string' ? uuid(value) : null;
  if (!id) throw malformed();
  return id;
}

export function enumValue<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  if (value == null) return null;
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) return value as T;
  throw malformed();
}

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

function validDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** "YYYY-MM-DD" (Java LocalDate). */
export function localDate(value: unknown): string | null {
  if (value == null) return null;
  const match = typeof value === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  if (!match || !validDate(+match[1], +match[2], +match[3])) throw malformed();
  return value as string;
}

/** "HH:mm" or "HH:mm:ss[.fraction]" (Java LocalTime), returned as "HH:mm:ss[.fraction]". */
export function localTime(value: unknown): string | null {
  if (value == null) return null;
  const match = typeof value === 'string' ? /^(\d{2}):(\d{2})(?::(\d{2})(\.\d{1,9})?)?$/.exec(value) : null;
  if (!match || +match[1] > 23 || +match[2] > 59 || +(match[3] ?? 0) > 59) throw malformed();
  return `${match[1]}:${match[2]}:${match[3] ?? '00'}${match[4] ?? ''}`;
}

/** "YYYY-MM-DDTHH:mm[:ss[.fraction]]" (Java LocalDateTime), returned with seconds. */
export function localDateTime(value: unknown): string | null {
  if (value == null) return null;
  const match =
    typeof value === 'string' ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(\.\d{1,9})?)?$/.exec(value) : null;
  if (!match || !validDate(+match[1], +match[2], +match[3])) throw malformed();
  if (+match[4] > 23 || +match[5] > 59 || +(match[6] ?? 0) > 59) throw malformed();
  return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6] ?? pad(0)}${match[7] ?? ''}`;
}

/** Spring's boolean request-parameter conversion ("true"/"false", "on"/"off", "yes"/"no", "1"/"0"). */
export function boolParam(value: unknown): boolean | null {
  if (value === undefined || value === '') return null;
  if (typeof value !== 'string') throw malformed();
  const v = value.trim().toLowerCase();
  if (['true', 'on', 'yes', '1'].includes(v)) return true;
  if (['false', 'off', 'no', '0'].includes(v)) return false;
  throw malformed();
}

export function intParam(value: unknown, fallback: number): number {
  if (value === undefined || value === '') return fallback;
  if (typeof value !== 'string' || !/^[+-]?\d+$/.test(value.trim())) throw malformed();
  const number = Number(value.trim());
  if (number > 2_147_483_647 || number < -2_147_483_648) throw malformed();
  return number;
}

/** First value of a query parameter (repeated parameters are joined by Spring with commas). */
export function queryParam(req: Request, name: string): string | undefined {
  const value = req.query[name];
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value.map(String).join(',');
  return typeof value === 'string' ? value : undefined;
}
