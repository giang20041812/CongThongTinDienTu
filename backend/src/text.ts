import { config } from './config.js';

// Same semantics as the Java backend these replace, so stored slugs, search text and summaries stay identical.

/** Java Character.isWhitespace code points (no-break spaces U+00A0, U+2007, U+202F are not whitespace). */
const WHITESPACE = new Set([
  0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0x1680,
  0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2008, 0x2009, 0x200a,
  0x2028, 0x2029, 0x205f, 0x3000,
]);

/** Java String.isBlank(): empty or only whitespace (a no-break space counts as text). */
export const isBlank = (value: string) => {
  for (const char of value) if (!WHITESPACE.has(char.codePointAt(0)!)) return false;
  return true;
};

/** Java's String.trim(): strips control characters and spaces (code points up to U+0020) at both ends. */
export const trim = (value: string) => value.replace(/^[\x00-\x20]+|[\x00-\x20]+$/g, '');

export const blankToNull = (value: string | null | undefined): string | null =>
  value == null || isBlank(value) ? null : trim(value);

const MARKS = /\p{M}+/gu;
const NON_ALNUM = /[^a-z0-9]+/g;
const EDGE_DASHES = /(^-+|-+$)/g;
const MAX_SLUG_LENGTH = 90;

const asciiLower = (input: string) =>
  input.normalize('NFD').replace(MARKS, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

/** ASCII URL slug for a Vietnamese title: "Lễ khai giảng 2026" -> "le-khai-giang-2026". */
export function slugOf(input: string | null | undefined): string {
  if (input == null) return 'bai-viet';
  let slug = asciiLower(input).replace(NON_ALNUM, '-').replace(EDGE_DASHES, '');
  if (slug.length > MAX_SLUG_LENGTH) slug = slug.slice(0, MAX_SLUG_LENGTH).replace(EDGE_DASHES, '');
  return slug || 'bai-viet';
}

/** Accent-free, lower-case words joined by single spaces ("Khai giảng!" -> "khai giang"), for search. */
export function searchable(...parts: (string | null | undefined)[]): string {
  const joined = parts.filter((p): p is string => p != null && !isBlank(p)).map((p) => `${p} `).join('');
  return trim(asciiLower(joined).replace(NON_ALNUM, ' '));
}

const SUMMARY_LENGTH = 220;

/** First ~220 characters of a text block, cut at a word boundary. */
export function excerpt(text: string): string {
  const flat = trim(text.replace(/[ \t\n\v\f\r]+/g, ' '));
  if (flat.length <= SUMMARY_LENGTH) return flat;
  const cut = flat.lastIndexOf(' ', SUMMARY_LENGTH);
  return `${flat.slice(0, cut > 0 ? cut : SUMMARY_LENGTH)}…`;
}

const clock = new Intl.DateTimeFormat('en-CA', {
  timeZone: config.timeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

/**
 * The current wall-clock time of the school (APP_TIMEZONE) as "YYYY-MM-DDTHH:mm:ss.SSS". Timestamps are stored
 * without a zone and the browser shows them as local time, so they must be written in the school's zone.
 */
export function localNow(): string {
  const now = new Date();
  const part: Record<string, string> = {};
  for (const { type, value } of clock.formatToParts(now)) part[type] = value;
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${part.year}-${part.month}-${part.day}T${part.hour}:${part.minute}:${part.second}.${ms}`;
}
