import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { test } from 'node:test';
import { LoginAttemptLimiter, SubmissionRateLimiter, TokenService, hashPassword, isHashed, passwordMatches } from '../src/security.js';

// Produced by the former Java backend (PasswordHasher) for the password "admin123".
const JAVA_HASH = 'pbkdf2$120000$ee5CGhBwYL8k50hcCwpifg$SONscMr2i2+v5kVsNQnnU33hSGOlbptECwU74O8kPRg';
// Issued by the former Java backend (TokenService) with this secret, valid until 2140.
const JAVA_SECRET = 'unit-test-secret-0123456789abcdefghij';
const JAVA_TOKEN =
  'ZGE0NmZjYWQtMTBlZi00ZWFhLThjZmUtNjU0MzY3YTdlZGI1fEFETUlOfDUzOTE0NjgwMDM.-FXtHgejZym1moXuRrv0YBHLb144ColiQd9kl-22IwE';

test('passwords hashed by the Java backend still match', async () => {
  assert.equal(await passwordMatches('admin123', JAVA_HASH), true);
  assert.equal(await passwordMatches('admin1234', JAVA_HASH), false);
});

test('hashPassword uses the same pbkdf2 format', async () => {
  const hash = await hashPassword('mật khẩu mới');
  assert.match(hash, /^pbkdf2\$120000\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/);
  assert.equal(isHashed(hash), true);
  assert.equal(await passwordMatches('mật khẩu mới', hash), true);
  assert.equal(await passwordMatches('mat khau moi', hash), false);
});

test('plaintext rows (seed or SQL reset) are compared as is', async () => {
  assert.equal(isHashed('admin123'), false);
  assert.equal(await passwordMatches('admin123', 'admin123'), true);
  assert.equal(await passwordMatches('admin12', 'admin123'), false);
  assert.equal(await passwordMatches('x', 'pbkdf2$abc$x$y'), false);
  assert.equal(await passwordMatches(null, JAVA_HASH), false);
});

test('tokens issued by the Java backend are accepted', () => {
  const tokens = new TokenService(JAVA_SECRET, 8);
  assert.deepEqual(tokens.verify(JAVA_TOKEN), { id: 'da46fcad-10ef-4eaa-8cfe-654367a7edb5', role: 'ADMIN' });
  assert.equal(new TokenService(`${JAVA_SECRET}-other`, 8).verify(JAVA_TOKEN), null);
});

test('tokens round-trip and reject tampering and expiry', () => {
  const tokens = new TokenService(JAVA_SECRET, 8);
  const user = { id: '3dc0b7ec-2d9f-40ea-934d-27ce330dd785', role: 'ADMIN' as const };
  const { token, expiresAt } = tokens.issue(user);
  assert.deepEqual(tokens.verify(token), user);
  assert.ok(expiresAt.getTime() > Date.now() + 7.9 * 3_600_000);

  const [payload, signature] = token.split('.');
  const forged = Buffer.from(`${user.id}|ADMIN|9999999999`).toString('base64url');
  assert.equal(tokens.verify(`${forged}.${signature}`), null);
  assert.equal(tokens.verify(`${payload}.${signature.slice(1)}`), null);
  assert.equal(tokens.verify(`${payload}.`), null);
  assert.equal(tokens.verify('garbage'), null);

  const expired = Buffer.from(`${user.id}|ADMIN|${Math.floor(Date.now() / 1000) - 1}`).toString('base64url');
  const expiredSignature = crypto.createHmac('sha256', JAVA_SECRET).update(expired).digest('base64url');
  assert.equal(tokens.verify(`${expired}.${expiredSignature}`), null);
});

test('login limiter locks after 5 failures and resets on success', () => {
  const limiter = new LoginAttemptLimiter();
  for (let i = 0; i < 4; i++) limiter.recordFailure('ip|admin');
  assert.equal(limiter.isLocked('ip|admin'), false);
  limiter.recordFailure('ip|admin');
  assert.equal(limiter.isLocked('ip|admin'), true);
  assert.equal(limiter.isLocked('other|admin'), false);
  limiter.recordSuccess('ip|admin');
  assert.equal(limiter.isLocked('ip|admin'), false);
});

test('feedback limiter allows 5 submissions per client', () => {
  const limiter = new SubmissionRateLimiter();
  const results = Array.from({ length: 6 }, () => limiter.tryAcquire('1.2.3.4'));
  assert.deepEqual(results, [true, true, true, true, true, false]);
  assert.equal(limiter.tryAcquire('5.6.7.8'), true);
});
