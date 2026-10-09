import { Router } from 'express';
import { query, queryOne } from '../db.js';
import { jsonObject, str } from '../http.js';
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
    if (!user || user.role !== 'ADMIN' || !(await passwordMatches(password, user.password_hash))) {
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
    const user = current && (await queryOne<UserRow>(`SELECT username, role FROM users WHERE id = $1`, [current.id]));
    if (!user) {
      res.status(401).end();
      return;
    }
    res.json({ username: user.username, role: user.role });
  });

  return router;
}
