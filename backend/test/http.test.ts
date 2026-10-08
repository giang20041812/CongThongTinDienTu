import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HttpError, bool, boolParam, int, intParam, localDate, localDateTime, localTime, str, uuid } from '../src/http.js';

const isMalformed = (fn: () => unknown) =>
  assert.throws(fn, (err: unknown) => err instanceof HttpError && err.status === 400);

test('scalars are coerced like the Java API (Jackson)', () => {
  assert.equal(str(5), '5');
  assert.equal(str(null), null);
  isMalformed(() => str({}));
  assert.equal(int('7'), 7);
  assert.equal(int(7.9), 7);
  assert.equal(int(''), null);
  isMalformed(() => int('seven'));
  isMalformed(() => int(true));
  assert.equal(bool('true'), true);
  assert.equal(bool(0), false);
  isMalformed(() => bool('maybe'));
});

test('uuids are validated and lower-cased', () => {
  assert.equal(uuid('3DC0B7EC-2D9F-40EA-934D-27CE330DD785'), '3dc0b7ec-2d9f-40ea-934d-27ce330dd785');
  assert.equal(uuid(''), null);
  isMalformed(() => uuid('abc'));
});

test('dates and times accept the formats the admin pages send', () => {
  assert.equal(localDateTime('2026-10-08T09:30'), '2026-10-08T09:30:00');
  assert.equal(localDateTime('2026-10-08T09:30:15.5'), '2026-10-08T09:30:15.5');
  isMalformed(() => localDateTime('2026-13-01T00:00:00'));
  isMalformed(() => localDateTime('2026-10-08 09:30:00'));
  assert.equal(localDate('2024-02-29'), '2024-02-29');
  isMalformed(() => localDate('2026-02-29'));
  assert.equal(localTime('07:30'), '07:30:00');
  isMalformed(() => localTime('7h30'));
  isMalformed(() => localTime('24:00'));
});

test('query parameters follow Spring conversion rules', () => {
  assert.equal(boolParam('yes'), true);
  assert.equal(boolParam('0'), false);
  assert.equal(boolParam(undefined), null);
  isMalformed(() => boolParam('maybe'));
  assert.equal(intParam(undefined, 12), 12);
  assert.equal(intParam('', 12), 12);
  assert.equal(intParam('-1', 0), -1);
  isMalformed(() => intParam('1.5', 0));
});
