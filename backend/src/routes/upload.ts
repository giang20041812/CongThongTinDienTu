import { Router } from 'express';
import { readSingleFile } from '../multipart.js';
import type { FileStorage } from '../storage/index.js';
import { slugOf } from '../text.js';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'txt', 'zip', 'rar']);
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

/** Admin-only uploads (form field "file"): images for posts, documents for attachments. */
export function uploadRoutes(storage: FileStorage): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const file = await readSingleFile(req, 'file', MAX_DOCUMENT_BYTES);
    if (!file || file.bytes.length === 0) {
      res.status(400).json({ error: 'Tệp tải lên đang trống.' });
      return;
    }
    if (!IMAGE_TYPES.has(file.mimeType)) {
      res.status(400).json({ error: 'Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF.' });
      return;
    }
    if (file.bytes.length > MAX_IMAGE_BYTES) {
      res.status(400).json({ error: 'Ảnh vượt quá dung lượng 5 MB.' });
      return;
    }
    try {
      const stored = await storage.uploadImage(file);
      res.json({ url: stored.url });
    } catch (err) {
      console.error(`[upload] Tải ảnh lên ${storage.name} thất bại:`, err);
      res.status(500).json({ error: 'Không thể tải ảnh lên. Vui lòng thử lại.' });
    }
  });

  /** Document attachments (PDF, Word, Excel...), keeping their extension. */
  router.post('/file', async (req, res) => {
    const file = await readSingleFile(req, 'file', MAX_DOCUMENT_BYTES);
    if (!file || file.bytes.length === 0) {
      res.status(400).json({ error: 'Tệp tải lên đang trống.' });
      return;
    }
    const original = file.fileName || 'tep-dinh-kem';
    const dot = original.lastIndexOf('.');
    const extension = dot < 0 ? '' : original.slice(dot + 1).toLowerCase();
    if (!DOCUMENT_EXTENSIONS.has(extension)) {
      res.status(400).json({ error: 'Chỉ chấp nhận tệp PDF, Word, Excel, PowerPoint, TXT, ZIP hoặc RAR.' });
      return;
    }
    try {
      const stored = await storage.uploadDocument({ ...file, baseName: slugOf(original.slice(0, Math.max(dot, 0))), extension });
      res.json({
        url: stored.url,
        name: original,
        sizeBytes: file.bytes.length,
        mimeType: file.mimeType || 'application/octet-stream',
      });
    } catch (err) {
      console.error(`[upload] Tải tệp lên ${storage.name} thất bại:`, err);
      res.status(500).json({ error: 'Không thể tải tệp lên. Vui lòng thử lại.' });
    }
  });

  return router;
}
