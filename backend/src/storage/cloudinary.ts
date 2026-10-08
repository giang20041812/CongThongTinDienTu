import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from 'cloudinary';
import type { FileStorage, UploadInput } from './index.js';

interface CloudinarySettings {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  /** cloudinary://key:secret@cloud – read by the SDK itself when the three values above are not set. */
  url: string;
}

/** Images and documents on Cloudinary; the front-end resizes Cloudinary images through URL transformations. */
export function cloudinaryStorage(settings: CloudinarySettings): FileStorage {
  if (settings.cloudName && settings.apiKey && settings.apiSecret) {
    cloudinary.config({ cloud_name: settings.cloudName, api_key: settings.apiKey, api_secret: settings.apiSecret, secure: true });
  } else if (!settings.url) {
    console.warn('[storage] Thiếu CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET – tải ảnh/tệp lên sẽ lỗi.');
  }

  const upload = (input: UploadInput, options: UploadApiOptions) =>
    new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error || !result) reject(error ?? new Error('Cloudinary không trả kết quả'));
        else resolve(result);
      });
      stream.end(input.bytes);
    });

  const publicUrl = (result: UploadApiResponse) => String(result.secure_url ?? result.url);

  return {
    name: 'cloudinary',
    async uploadImage(input) {
      return { url: publicUrl(await upload(input, { resource_type: 'image' })) };
    },
    async uploadDocument(input) {
      // "raw" files keep their extension in the public id, so the downloaded file opens with the right program.
      const publicId = `${input.baseName}-${Date.now().toString(36)}.${input.extension}`;
      return { url: publicUrl(await upload(input, { resource_type: 'raw', public_id: publicId })) };
    },
  };
}
