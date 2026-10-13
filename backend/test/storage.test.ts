import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import sharp from 'sharp';
import { localStorage } from '../src/storage/local.js';

const dir = await mkdtemp(path.join(tmpdir(), 'portal-uploads-'));
after(() => rm(dir, { recursive: true, force: true }));
const storage = localStorage({ dir });

const solid = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: '#0a4aa0' } });
const fileOf = (url: string) => path.join(dir, url.replace(/^\/uploads\//, ''));
const sizeOf = async (url: string) => {
  const meta = await sharp(await readFile(fileOf(url)), { animated: true }).metadata();
  return { format: meta.format, width: meta.width, pages: meta.pages ?? 1 };
};

test('images become WebP at most 1600 px wide, with 400 and 800 px copies next to them', async () => {
  const { url } = await storage.uploadImage({ bytes: await solid(2400, 1200).jpeg().toBuffer(), mimeType: 'image/jpeg', fileName: 'a.jpg' });
  assert.match(url, /^\/uploads\/images\/\d{4}\/\d{2}\/[0-9a-f]{16}\.webp$/);
  assert.deepEqual(await sizeOf(url), { format: 'webp', width: 1600, pages: 1 });
  assert.equal((await sizeOf(url.replace('.webp', '-800.webp'))).width, 800);
  assert.equal((await sizeOf(url.replace('.webp', '-400.webp'))).width, 400);
});

test('small images are never enlarged', async () => {
  const { url } = await storage.uploadImage({ bytes: await solid(300, 200).png().toBuffer(), mimeType: 'image/png', fileName: 'a.png' });
  assert.equal((await sizeOf(url)).width, 300);
  assert.equal((await sizeOf(url.replace('.webp', '-400.webp'))).width, 300);
});

test('photos are turned upright from their EXIF orientation', async () => {
  const sideways = await solid(200, 100).withMetadata({ orientation: 6 }).jpeg().toBuffer();
  const { url } = await storage.uploadImage({ bytes: sideways, mimeType: 'image/jpeg', fileName: 'a.jpg' });
  const meta = await sharp(await readFile(fileOf(url))).metadata();
  assert.deepEqual([meta.width, meta.height], [100, 200]);
});

test('animated GIFs keep their frames', async () => {
  const frames = [await solid(64, 64).png().toBuffer(), await solid(64, 64).negate().png().toBuffer()];
  const gif = await sharp(frames, { join: { animated: true } }).gif().toBuffer();
  const { url } = await storage.uploadImage({ bytes: gif, mimeType: 'image/gif', fileName: 'a.gif' });
  assert.equal((await sizeOf(url)).pages, 2);
});

test('documents keep their bytes, name and extension', async () => {
  const bytes = Buffer.from('%PDF-1.4 test');
  const { url } = await storage.uploadDocument({ bytes, mimeType: 'application/pdf', fileName: 'Kế hoạch.pdf', baseName: 'ke-hoach', extension: 'pdf' });
  assert.match(url, /^\/uploads\/files\/\d{4}\/\d{2}\/ke-hoach-[0-9a-f]{8}\.pdf$/);
  assert.deepEqual(await readFile(fileOf(url)), bytes);
});
