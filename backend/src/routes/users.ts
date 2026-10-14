import { Router } from 'express';
import { query, queryOne } from '../db.js';
import { badRequest, conflict, enumValue, jsonObject, notFound, str, uuid, uuidParam } from '../http.js';
import { ROLES, hashPassword } from '../security.js';
import { isBlank, localNow, trim } from '../text.js';

const MIN_PASSWORD_LENGTH = 8;
/** Never the password hash. */
const COLUMNS = `id, username, role, category_id AS "categoryId", created_at AS "createdAt"`;

function requireUsername(username: string | null): string {
  if (username == null || isBlank(username)) throw badRequest('Tên đăng nhập không được để trống.');
  return trim(username);
}

function requirePassword(password: string | null): string {
  if (password == null || password.length < MIN_PASSWORD_LENGTH) {
    throw badRequest(`Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`);
  }
  return password;
}

/** An editor manages exactly one menu entry (and its children); other roles have none. */
async function categoryFor(role: string, raw: unknown): Promise<string | null> {
  if (role !== 'EDITOR') return null;
  const id = uuid(raw);
  if (!id) throw badRequest('Tài khoản biên tập viên phải được gán một đầu mục.');
  if (!(await queryOne(`SELECT 1 FROM categories WHERE id = $1 AND parent_id IS NULL`, [id]))) {
    throw badRequest('Chỉ gán được đầu mục cấp trên cùng của menu.');
  }
  return id;
}

/** Accounts (admin-only): admins and per-entry editors. Passwords are always stored hashed. */
export function userRoutes(): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.json(await query(`SELECT ${COLUMNS} FROM users ORDER BY created_at`));
  });

  router.get('/:id', async (req, res) => {
    const user = await queryOne(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [uuidParam(req.params.id)]);
    if (!user) throw notFound();
    res.json(user);
  });

  router.post('/', async (req, res) => {
    const body = jsonObject(req.body);
    const role = enumValue(body.role, ROLES) ?? 'USER';
    const username = requireUsername(str(body.username));
    if (await queryOne(`SELECT 1 FROM users WHERE username = $1`, [username])) throw conflict('Tên đăng nhập đã tồn tại.');
    const categoryId = await categoryFor(role, body.categoryId);
    const passwordHash = await hashPassword(requirePassword(str(body.password)));
    res.json(
      await queryOne(
        `INSERT INTO users (username, password_hash, role, category_id, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING ${COLUMNS}`,
        [username, passwordHash, role, categoryId, localNow()],
      ),
    );
  });

  /** Partial update: username, role and/or a new password (an empty password keeps the current one). */
  router.put('/:id', async (req, res) => {
    const id = uuidParam(req.params.id);
    const body = jsonObject(req.body);
    const role = enumValue(body.role, ROLES);
    const usernameInput = str(body.username);
    const password = str(body.password);
    const current = await queryOne<{ username: string; role: string; categoryId: string | null }>(
      `SELECT username, role, category_id AS "categoryId" FROM users WHERE id = $1`,
      [id],
    );
    if (!current) throw notFound();
    const username = usernameInput != null ? requireUsername(usernameInput) : current.username;
    const passwordHash = password != null && password !== '' ? await hashPassword(requirePassword(password)) : null;
    const newRole = role ?? current.role;
    const categoryId = await categoryFor(newRole, body.categoryId !== undefined ? body.categoryId : current.categoryId);
    res.json(
      await queryOne(
        `UPDATE users SET username = $2, role = $3, category_id = $5, password_hash = COALESCE($4, password_hash)
         WHERE id = $1 RETURNING ${COLUMNS}`,
        [id, username, newRole, passwordHash, categoryId],
      ),
    );
  });

  router.delete('/:id', async (req, res) => {
    const deleted = await query(`DELETE FROM users WHERE id = $1 RETURNING 1`, [uuidParam(req.params.id)]);
    if (!deleted.length) throw notFound();
    res.status(200).end();
  });

  return router;
}
