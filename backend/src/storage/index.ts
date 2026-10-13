import { config } from '../config.js';
import { cloudinaryStorage } from './cloudinary.js';
import { localStorage } from './local.js';

export interface StoredFile {
  /** Public (https) URL saved in the posts – it must stay valid for as long as the content exists. */
  url: string;
}

export interface UploadInput {
  bytes: Buffer;
  mimeType: string;
  /** Original file name, e.g. "Kế hoạch năm học.pdf". */
  fileName: string;
}

/**
 * Where uploaded images and attachments are kept (STORAGE_PROVIDER): "cloudinary", or "local" = this server's disk,
 * which only a VPS keeps (hosting containers lose it on every redeploy). Another provider = an implementation next
 * to these. Existing URLs keep working as long as the old provider keeps serving them; `cli.js import-cloudinary`
 * copies Cloudinary files to the local disk and rewrites their URLs.
 */
export interface FileStorage {
  readonly name: string;
  /** A post image (JPG/PNG/WEBP/GIF, already validated). */
  uploadImage(input: UploadInput): Promise<StoredFile>;
  /** A downloadable document (PDF, Word, Excel..., already validated); `baseName` is a slug of the file name. */
  uploadDocument(input: UploadInput & { baseName: string; extension: string }): Promise<StoredFile>;
}

export function createStorage(): FileStorage {
  switch (config.storage.provider) {
    case 'cloudinary':
      return cloudinaryStorage(config.storage.cloudinary);
    case 'local':
      return localStorage(config.storage.local);
    default:
      throw new Error(`STORAGE_PROVIDER "${config.storage.provider}" chưa được hỗ trợ (hiện có: cloudinary, local).`);
  }
}
