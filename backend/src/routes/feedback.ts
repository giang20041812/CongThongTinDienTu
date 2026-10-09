import { Router } from 'express';
import { query, queryOne } from '../db.js';
import { HttpError, badRequest, enumValue, jsonObject, notFound, str, uuidParam } from '../http.js';
import { type SubmissionRateLimiter, clientIp } from '../security.js';
import { blankToNull, isBlank, localNow, trim } from '../text.js';

const STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED'] as const;
// Java's \s: ASCII whitespace only.
const EMAIL = /^[^@ \t\n\v\f\r]+@[^@ \t\n\v\f\r]+\.[^@ \t\n\v\f\r]+$/;
const PHONE = /^[0-9+(). \t\n\v\f\r-]{8,20}$/;

const COLUMNS = `id, full_name AS "fullName", email, phone, subject, content, status, note,
  created_at AS "createdAt", updated_at AS "updatedAt"`;

function limit(value: string | null, max: number, field: string): string | null {
  if (value == null || isBlank(value)) return null;
  const trimmed = trim(value);
  if (trimmed.length > max) throw badRequest(`${field} tối đa ${max} ký tự.`);
  return trimmed;
}

/** Public "Góp ý – Phản hồi" form (POST); reading and handling feedback is admin-only. */
export function feedbackRoutes(submissions: SubmissionRateLimiter): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const thanks = { message: 'Cảm ơn bạn! Nhà trường đã nhận được góp ý.' };
    const body = jsonObject(req.body);
    const fields = {
      fullName: str(body.fullName),
      email: str(body.email),
      phone: str(body.phone),
      subject: str(body.subject),
      content: str(body.content),
      website: str(body.website),
    };
    // "website" is a honeypot: real visitors never see or fill it.
    if (fields.website != null && !isBlank(fields.website)) {
      res.status(201).json(thanks);
      return;
    }
    if (!submissions.tryAcquire(clientIp(req))) {
      throw new HttpError(429, 'Bạn đã gửi quá nhiều góp ý. Vui lòng thử lại sau.');
    }

    const name = limit(fields.fullName, 100, 'Họ và tên');
    const content = limit(fields.content, 3000, 'Nội dung góp ý');
    if (name == null) throw badRequest('Vui lòng nhập họ và tên.');
    if (content == null) throw badRequest('Vui lòng nhập nội dung góp ý.');
    const email = limit(fields.email, 150, 'Email');
    const phone = limit(fields.phone, 20, 'Số điện thoại');
    if (email != null && !EMAIL.test(email)) throw badRequest('Email không hợp lệ.');
    if (phone != null && !PHONE.test(phone)) throw badRequest('Số điện thoại không hợp lệ.');
    const subject = limit(fields.subject, 200, 'Tiêu đề');

    const now = localNow();
    await query(
      `INSERT INTO feedbacks (full_name, email, phone, subject, content, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'NEW', $6, $6)`,
      [name, email, phone, subject, content, now],
    );
    res.status(201).json(thanks);
  });

  router.get('/', async (_req, res) => {
    res.json(await query(`SELECT ${COLUMNS} FROM feedbacks ORDER BY created_at DESC`));
  });

  router.put('/:id', async (req, res) => {
    const id = uuidParam(req.params.id);
    const body = jsonObject(req.body);
    const status = enumValue(body.status, STATUSES);
    const note = str(body.note);
    const updated = await queryOne(
      `UPDATE feedbacks SET status = COALESCE($2, status), note = CASE WHEN $3::boolean THEN $4 ELSE note END, updated_at = $5
       WHERE id = $1 RETURNING ${COLUMNS}`,
      [id, status, note != null, blankToNull(note), localNow()],
    );
    if (!updated) throw notFound();
    res.json(updated);
  });

  router.delete('/:id', async (req, res) => {
    const deleted = await query(`DELETE FROM feedbacks WHERE id = $1 RETURNING 1`, [uuidParam(req.params.id)]);
    if (!deleted.length) throw notFound();
    res.status(200).end();
  });

  return router;
}
