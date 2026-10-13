import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Sharp, SharpConstructor } from 'sharp';
import { localNow } from '../text.js';
import type { FileStorage } from './index.js';

/** URL prefix of the stored files: Nginx (VPS) or Express (createApp) serves the upload folder there. */
export const UPLOADS_PATH = '/uploads';
/**
 * Every image is kept as WebP at most MAX_IMAGE_WIDTH wide, plus smaller copies "<name>-400.webp" and
 * "<name>-800.webp"; optimizeImage (frontend/src/lib/content.ts) picks one by the width it needs. Keep both in sync.
 */
export const IMAGE_WIDTHS = [400, 800] as const;
const MAX_IMAGE_WIDTH = 1600;
/** Refuses images that would take too much memory to decode (a tiny PNG can be 20000×20000 px). */
const MAX_INPUT_PIXELS = 50_000_000;

const randomId = (bytes: number) => randomBytes(bytes).toString('hex');

/** sharp (native image library) is loaded on the first image, so Cloudinary deployments never load it. */
let loadSharp: Promise<SharpConstructor> | undefined;
async function imageLibrary() {
  loadSharp ??= import('sharp').then(({ default: sharp }) => {
    // One image at a time and no decoded-image cache: a small VPS shares its RAM with the database.
    sharp.concurrency(1);
    sharp.cache(false);
    return sharp;
  });
  return loadSharp;
}

/** Files on this server's disk (a VPS keeps it across deploys), under images/YYYY/MM and files/YYYY/MM. */
export function localStorage(settings: { dir: string }): FileStorage {
  /** Writes `bytes` to <dir>/<kind>/YYYY/MM/<name> and returns its public URL. */
  const save = async (kind: 'images' | 'files', files: { name: string; bytes: Buffer }[]) => {
    const month = localNow().slice(0, 7).replace('-', '/');
    const folder = path.join(settings.dir, kind, month);
    await mkdir(folder, { recursive: true });
    for (const file of files) await writeFile(path.join(folder, file.name), file.bytes, { flag: 'wx' });
    return `${UPLOADS_PATH}/${kind}/${month}/${files.at(-1)!.name}`;
  };

  return {
    name: 'local',
    async uploadImage(input) {
      // GIF and WebP may be animated: all frames are kept. Photos are turned upright from their EXIF orientation;
      // metadata (camera, GPS) is not copied.
      const animated = input.mimeType === 'image/gif' || input.mimeType === 'image/webp';
      const sharp = await imageLibrary();
      const source: Sharp = sharp(input.bytes, { animated, limitInputPixels: MAX_INPUT_PIXELS });
      if (!animated) source.autoOrient();
      const encode = (width: number) =>
        source.clone().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();

      const id = randomId(8);
      const copies = await Promise.all(IMAGE_WIDTHS.map(async (w) => ({ name: `${id}-${w}.webp`, bytes: await encode(w) })));
      // The full-size file goes last: once its URL works, the smaller copies exist too.
      return { url: await save('images', [...copies, { name: `${id}.webp`, bytes: await encode(MAX_IMAGE_WIDTH) }]) };
    },
    async uploadDocument(input) {
      const name = `${input.baseName || 'tep'}-${randomId(4)}${input.extension ? `.${input.extension}` : ''}`;
      return { url: await save('files', [{ name, bytes: input.bytes }]) };
    },
  };
}
