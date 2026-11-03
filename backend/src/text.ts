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

// ---------------------------------------------------------------------------
// Rich text. Text blocks written in the admin editor are small HTML fragments: paragraphs, headings, lists, quotes, text styles,
// links and images survive. Older posts hold plain text (see isRichHtml).
// ---------------------------------------------------------------------------

const RICH_TAG = /<\/?(?:p|br|strong|em|u|s|a|b|i|div|h[1-3]|ul|ol|li|blockquote|span|img)(?:\s[^>]*)?\/?>/i;
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g;
const TAG_ALIASES: Record<string, string> = { b: 'strong', i: 'em', div: 'p', ins: 'u', strike: 's', del: 's' };
const RICH_TAGS = new Set(['p', 'br', 'strong', 'em', 'u', 's', 'a', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'span', 'img']);
/** Block elements that may carry text-align. */
const ALIGNABLE = new Set(['p', 'h1', 'h2', 'h3', 'li', 'blockquote']);
/** Opening one of these ends an open paragraph. */
const BLOCK_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'ul', 'ol', 'blockquote']);
/** Link targets we keep: web, mail, phone, same-site paths and in-page anchors. */
const SAFE_HREF = /^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;
/** Photos: uploaded files (same site) or web images; never data: or script URLs. */
const SAFE_SRC = /^(?:https?:\/\/|\/(?!\/))/i;
const attr = (name: string) => new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i');
const HREF_ATTR = attr('href');
const STYLE_ATTR = attr('style');
const SRC_ATTR = attr('src');
const ALT_ATTR = attr('alt');
const WIDTH_ATTR = attr('width');
const attrValue = (found: RegExpExecArray | null) => found?.[1] ?? found?.[2] ?? found?.[3] ?? '';

const FONT_FAMILIES: Record<string, string> = {
  arial: 'Arial,sans-serif',
  'times new roman': "'Times New Roman',serif",
  georgia: 'Georgia,serif',
  verdana: 'Verdana,sans-serif',
  tahoma: 'Tahoma,sans-serif',
  'courier new': "'Courier New',monospace",
  'trebuchet ms': "'Trebuchet MS',sans-serif",
};
const COLOR = /^(?:#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*[01]?(?:\.\d+)?\s*)?\))$/i;

/**
 * The few CSS properties the editor writes, re-serialised: text-align on blocks; font-size, color, background-color and
 * a whitelisted font-family on spans. Any other property or value is dropped.
 */
function cleanStyle(tag: string, style: string): string {
  const keep: string[] = [];
  for (const declaration of style.split(';')) {
    const colon = declaration.indexOf(':');
    if (colon < 0) continue;
    const prop = declaration.slice(0, colon).trim().toLowerCase();
    const value = declaration.slice(colon + 1).trim();
    if (ALIGNABLE.has(tag) && prop === 'text-align' && /^(?:left|right|center|justify)$/i.test(value)) {
      keep.push(`text-align:${value.toLowerCase()}`);
    } else if (ALIGNABLE.has(tag) && prop === 'text-indent') {
      const size = /^(\d{1,3}(?:\.\d+)?)(px|pt|em|rem|cm|mm|in)$/i.exec(value);
      if (size && Number(size[1]) > 0 && Number(size[1]) <= 200) {
        keep.push(`text-indent:${size[1]}${size[2].toLowerCase()}`);
      }
    } else if (tag === 'span') {
      if (prop === 'font-size') {
        const size = /^(\d{1,3}(?:\.\d+)?)(px|pt)$/i.exec(value);
        if (size && Number(size[1]) >= 6 && Number(size[1]) <= 120) keep.push(`font-size:${size[1]}${size[2].toLowerCase()}`);
      } else if ((prop === 'color' || prop === 'background-color') && COLOR.test(value)) {
        keep.push(`${prop}:${value.toLowerCase().replace(/\s+/g, ' ')}`);
      } else if (prop === 'font-family') {
        const first = value.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
        if (FONT_FAMILIES[first]) keep.push(`font-family:${FONT_FAMILIES[first]}`);
      }
    }
  }
  return keep.join(';');
}

/** Whether a text block holds editor HTML (otherwise it is plain text with blank-line paragraphs). */
export const isRichHtml = (content: string) => RICH_TAG.test(content);

const escapeStray = (text: string) => text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (text: string) => text.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Keeps only the formatting the editor offers (paragraphs, headings, lists, quotes, bold/italic/underline/strike, links,
 * images, and the whitelisted styles of cleanStyle); every other tag and attribute is dropped, its text kept, and text
 * is escaped, so stored content can never carry script or event handlers.
 * <b>/<i>/<div> are normalised to strong/em/p and unbalanced tags are closed.
 */
export function sanitizeHtml(html: string): string {
  let out = '';
  let last = 0;
  const open: string[] = [];
  const close = (name: string) => {
    const at = open.lastIndexOf(name);
    if (at < 0) return;
    while (open.length > at) out += `</${open.pop()}>`;
  };

  for (const match of html.matchAll(TAG)) {
    out += escapeStray(html.slice(last, match.index));
    last = match.index + match[0].length;
    const closing = match[1] === '/';
    const raw = match[2].toLowerCase();
    const name = TAG_ALIASES[raw] ?? raw;
    if (!RICH_TAGS.has(name)) continue;

    if (closing) {
      if (name !== 'br' && name !== 'img') close(name);
    } else if (name === 'br') {
      out += '<br>';
    } else if (name === 'img') {
      const src = attrValue(SRC_ATTR.exec(match[3])).trim();
      if (!SAFE_SRC.test(src)) continue;
      const width = Number(attrValue(WIDTH_ATTR.exec(match[3])).replace(/px$/i, ''));
      const alt = attrValue(ALT_ATTR.exec(match[3])).slice(0, 300);
      out += `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}"${width >= 20 && width <= 2400 ? ` width="${Math.round(width)}"` : ''}>`;
    } else if (name === 'a') {
      const href = attrValue(HREF_ATTR.exec(match[3])).trim();
      if (!SAFE_HREF.test(href)) continue;
      close('a'); // links do not nest
      const external = /^https?:/i.test(href);
      out += `<a href="${escapeAttr(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>`;
      open.push('a');
    } else {
      if (BLOCK_TAGS.has(name)) close('p');
      const style = cleanStyle(name, attrValue(STYLE_ATTR.exec(match[3])));
      out += `<${name}${style ? ` style="${style}"` : ''}>`;
      open.push(name);
    }
  }
  out += escapeStray(html.slice(last));
  while (open.length) out += `</${open.pop()}>`;
  return out;
}

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** Plain text of editor HTML: block ends become spaces, tags are removed, entities decoded (no-break space = space). */
export function htmlToText(html: string): string {
  return trim(html
    .replace(/<\s*br\s*\/?>|<\/\s*(?:p|div|h[1-3]|li|blockquote|ul|ol)\s*>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (whole, dec, hex, named) => {
      if (named) return NAMED_ENTITIES[named.toLowerCase()] ?? whole;
      const code = dec ? Number(dec) : parseInt(hex, 16);
      return code === 0xa0 ? ' ' : code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }));
}

/** The readable text of a text block, whether it is plain text or editor HTML. */
export const blockText = (content: string) => (isRichHtml(content) ? htmlToText(content) : content);

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
