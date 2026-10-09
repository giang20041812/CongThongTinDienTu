import { Router } from 'express';
import { query, queryOne } from '../db.js';
import { badRequest, conflict, enumValue, jsonObject, notFound, str, uuidParam } from '../http.js';
import { ROLES, hashPassword } from '../security.js';
import { isBlank, localNow, trim } from '../text.js';

const MIN_PASSWORD_LENGTH = 8;
/** Never the password hash. */
const COLUMNS = `id, username, role, created_at AS "createdAt"`;

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

/** Admin accounts (admin-only). Passwords are always stored hashed. */
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
    const passwordHash = await hashPassword(requirePassword(str(body.password)));
    res.json(
      await queryOne(`INSERT INTO users (username, password_hash, role, created_at) VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`, [
        username,
        passwordHash,
        role,
        localNow(),
      ]),
    );
  });

  /** Partial update: username, role and/or a new password (an empty password keeps the current one). */
  router.put('/:id', async (req, res) => {
    const id = uuidParam(req.params.id);
    const body = jsonObject(req.body);
    const role = enumValue(body.role, ROLES);
    const usernameInput = str(body.username);
    const password = str(body.password);
    const current = await queryOne<{ username: string; role: string }>(`SELECT username, role FROM users WHERE id = $1`, [id]);
    if (!current) throw notFound();
    const username = usernameInput != null ? requireUsername(usernameInput) : current.username;
    const passwordHash = password != null && password !== '' ? await hashPassword(requirePassword(password)) : null;
    res.json(
      await queryOne(
        `UPDATE users SET username = $2, role = $3, password_hash = COALESCE($4, password_hash) WHERE id = $1 RETURNING ${COLUMNS}`,
        [id, username, role ?? current.role, passwordHash],
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
