import busboy from 'busboy';
import type { Request } from 'express';
import { HttpError } from './http.js';

export interface UploadedFile {
  bytes: Buffer;
  /** Original name sent by the browser (UTF-8, e.g. "Thời khóa biểu.pdf"); empty when none was sent. */
  fileName: string;
  /** Content type sent by the browser for this part. */
  mimeType: string;
}

const TOO_LARGE = () => new HttpError(413, 'Tệp vượt quá dung lượng cho phép.');

/**
 * Reads the multipart field `field` into memory (at most `maxBytes`). Resolves null when the request has no
 * such file. Other fields are ignored.
 */
export function readSingleFile(req: Request, field: string, maxBytes: number): Promise<UploadedFile | null> {
  return new Promise((resolve, reject) => {
    let parser: busboy.Busboy;
    try {
      // defParamCharset: browsers send UTF-8 file names; busboy's latin1 default would garble Vietnamese ones.
      parser = busboy({ headers: req.headers, defParamCharset: 'utf8', limits: { files: 1, fileSize: maxBytes, fields: 20 } });
    } catch {
      return reject(new HttpError(400, 'Thiếu tệp tải lên (multipart/form-data, trường "file").'));
    }

    let found: Promise<UploadedFile | null> = Promise.resolve(null);
    let failed = false;
    const fail = (error: Error) => {
      if (failed) return;
      failed = true;
      req.unpipe(parser);
      req.resume();
      reject(error);
    };

    parser.on('file', (name, stream, info) => {
      if (name !== field) {
        stream.resume();
        return;
      }
      found = new Promise((done) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('limit', () => fail(TOO_LARGE()));
        stream.on('end', () =>
          done({ bytes: Buffer.concat(chunks), fileName: info.filename ?? '', mimeType: info.mimeType ?? '' }),
        );
      });
    });
    parser.on('error', (error: Error) => fail(new HttpError(400, `Dữ liệu tải lên không hợp lệ: ${error.message}`)));
    parser.on('close', () => {
      if (!failed) found.then(resolve, reject);
    });
    req.pipe(parser);
  });
}
