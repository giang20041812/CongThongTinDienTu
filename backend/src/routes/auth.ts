import { Router } from 'express';
import { query, queryOne } from '../db.js';
import { badRequest, jsonObject, str } from '../http.js';
import {
  type LoginAttemptLimiter,
  type Role,
  type TokenService,
  clientIp,
  currentUser,
  hashPassword,
  isHashed,
  passwordMatches,
} from '../security.js';
import { trim } from '../text.js';

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  role: Role;
}

export function authRoutes(tokens: TokenService, logins: LoginAttemptLimiter): Router {
  const router = Router();

  router.post('/login', async (req, res) => {
    const body = jsonObject(req.body);
    const username = trim(str(body.username) ?? '');
    const password = str(body.password) ?? '';
    const limiterKey = `${clientIp(req)}|${username.toLowerCase()}`;

    if (logins.isLocked(limiterKey)) {
      res.status(429).json({ message: 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 5 phút.' });
      return;
    }
    const user = username
      ? await queryOne<UserRow>(`SELECT id, username, password_hash, role FROM users WHERE username = $1`, [username])
      : undefined;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR') || !(await passwordMatches(password, user.password_hash))) {
      logins.recordFailure(limiterKey);
      res.status(401).json({ message: 'Tài khoản hoặc mật khẩu chưa đúng.' });
      return;
    }

    if (!isHashed(user.password_hash)) {
      await query(`UPDATE users SET password_hash = $2 WHERE id = $1`, [user.id, await hashPassword(password)]);
    }
    logins.recordSuccess(limiterKey);
    const issued = tokens.issue({ id: user.id, role: user.role });
    res.json({ token: issued.token, expiresAt: issued.expiresAt.toISOString(), username: user.username, role: user.role });
  });

  /** Lets the admin app check whether a stored token is still valid. */
  router.get('/me', async (req, res) => {
    const current = currentUser(req);
    const user =
      current &&
      (await queryOne<{ username: string; role: Role; categoryId: string | null; categoryName: string | null }>(
        `SELECT u.username, u.role, u.category_id AS "categoryId", c.name AS "categoryName"
         FROM users u LEFT JOIN categories c ON c.id = u.category_id WHERE u.id = $1`,
        [current.id],
      ));
    if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
      res.status(401).end();
      return;
    }
    res.json(user);
  });

  /** Allows any authenticated user (admin or editor) to change their own password. */
  router.post('/change-password', async (req, res) => {
    const current = currentUser(req);
    if (!current) {
      res.status(401).json({ message: 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.' });
      return;
    }

    const body = jsonObject(req.body);
    const currentPassword = str(body.currentPassword) ?? '';
    const newPassword = str(body.newPassword) ?? '';

    if (!currentPassword) {
      throw badRequest('Vui lòng nhập mật khẩu hiện tại.');
    }
    if (!newPassword || newPassword.length < 8) {
      throw badRequest('Mật khẩu mới phải có ít nhất 8 ký tự.');
    }

    const user = await queryOne<UserRow>(
      `SELECT id, username, password_hash, role FROM users WHERE id = $1`,
      [current.id],
    );
    if (!user) {
      res.status(401).json({ message: 'Tài khoản không tồn tại.' });
      return;
    }

    if (!(await passwordMatches(currentPassword, user.password_hash))) {
      throw badRequest('Mật khẩu hiện tại không chính xác.');
    }

    if (await passwordMatches(newPassword, user.password_hash)) {
      throw badRequest('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
    }

    const newHash = await hashPassword(newPassword);
    await query(`UPDATE users SET password_hash = $2 WHERE id = $1`, [user.id, newHash]);

    res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
  });

  return router;
}
