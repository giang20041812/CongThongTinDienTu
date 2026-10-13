import { pool, transaction } from '../db.js';
import { slugOf } from '../text.js';
import type { FileStorage, StoredFile } from './index.js';

/** Columns holding the URL of one file. */
const URL_COLUMNS = [
  ['posts', 'cover_url'],
  ['post_blocks', 'image_url'],
  ['post_attachments', 'url'],
] as const;
/** Text that may quote a URL among other words: rewritten too. */
const TEXT_COLUMNS = [
  ['post_blocks', 'content'],
  ['site_settings', 'setting_value'],
] as const;

const CLOUDINARY_URL = /^https?:\/\/res\.cloudinary\.com\/[^/]+\/(image|raw)\/upload\//;

/**
 * Copies every Cloudinary file the content links to into `storage` (the server's disk) and rewrites the links.
 * One file per transaction: it can be stopped and run again, links already rewritten are not looked at.
 * Cloudinary itself is only read.
 */
export async function importCloudinaryFiles(storage: FileStorage, log: (line: string) => void = console.log) {
  const select = URL_COLUMNS.map(([table, column]) => `SELECT ${column} AS url FROM ${table} WHERE ${column} LIKE '%res.cloudinary.com/%'`);
  const { rows } = await pool.query<{ url: string }>(`${select.join(' UNION ')} ORDER BY url`);
  log(`[import] ${rows.length} tệp trên Cloudinary cần chép về ${storage.name}.`);

  let copied = 0;
  let failed = 0;
  for (const [index, { url }] of rows.entries()) {
    const step = `[${index + 1}/${rows.length}]`;
    const kind = CLOUDINARY_URL.exec(url)?.[1];
    if (!kind) {
      log(`${step} Bỏ qua (không phải ảnh/tệp tải lên): ${url}`);
      continue;
    }
    try {
      const stored = await copy(storage, url, kind as 'image' | 'raw');
      await transaction(async (db) => {
        for (const [table, column] of URL_COLUMNS) {
          await db.query(`UPDATE ${table} SET ${column} = $2 WHERE ${column} = $1`, [url, stored.url]);
        }
        for (const [table, column] of TEXT_COLUMNS) {
          await db.query(`UPDATE ${table} SET ${column} = replace(${column}, $1, $2) WHERE strpos(${column}, $1) > 0`, [url, stored.url]);
        }
      });
      copied++;
      log(`${step} ${url} → ${stored.url}`);
    } catch (err) {
      failed++;
      log(`${step} LỖI ${url}: ${(err as Error).message} (giữ nguyên link cũ)`);
    }
  }
  return { total: rows.length, copied, failed };
}

async function copy(storage: FileStorage, url: string, kind: 'image' | 'raw'): Promise<StoredFile> {
  const response = await fetch(url.replace(/^http:/, 'https:'));
  if (!response.ok) throw new Error(`Cloudinary trả HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const mimeType = response.headers.get('content-type') ?? 'application/octet-stream';
  const fileName = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '');
  if (kind === 'image') return storage.uploadImage({ bytes, mimeType, fileName });

  // Documents were named "<slug>-<base-36 time>.<ext>" by cloudinary.ts: keep the slug and the extension.
  const dot = fileName.lastIndexOf('.');
  const stem = dot < 0 ? fileName : fileName.slice(0, dot);
  return storage.uploadDocument({
    bytes,
    mimeType,
    fileName,
    baseName: slugOf(stem.replace(/-[0-9a-z]{8}$/, '')),
    extension: dot < 0 ? '' : fileName.slice(dot + 1).toLowerCase(),
  });
}
