import assert from 'node:assert/strict';
import { test } from 'node:test';
import { blankToNull, excerpt, isBlank, searchable, slugOf, trim } from '../src/text.js';

const NBSP = String.fromCodePoint(0xa0);
const IDEOGRAPHIC_SPACE = String.fromCodePoint(0x3000);

test('slugOf turns Vietnamese titles into ASCII slugs', () => {
  assert.equal(slugOf('Lễ khai giảng năm học 2026 – 2027'), 'le-khai-giang-nam-hoc-2026-2027');
  assert.equal(slugOf('Đoàn Thanh niên'), 'doan-thanh-nien');
  assert.equal(slugOf('Sách HAY tháng 9!!'), 'sach-hay-thang-9');
  assert.equal(slugOf('Thông báo nghỉ lễ Quốc khánh 2/9'), 'thong-bao-nghi-le-quoc-khanh-2-9');
  assert.equal(slugOf('--a--'), 'a');
});

test('slugOf falls back to "bai-viet" and caps the length at 90', () => {
  assert.equal(slugOf(null), 'bai-viet');
  assert.equal(slugOf('   '), 'bai-viet');
  assert.equal(slugOf('!!!'), 'bai-viet');
  const long = slugOf(`${'ab '.repeat(30)}cuối`);
  assert.ok(long.length <= 90);
  assert.ok(!long.endsWith('-'));
});

test('searchable joins the non-blank parts as accent-free lower-case words', () => {
  assert.equal(searchable('Khai giảng!', null, '142/TB-ĐTĐ', '  '), 'khai giang 142 tb dtd');
  assert.equal(searchable(), '');
});

test('excerpt keeps short text and cuts long text at a word boundary', () => {
  assert.equal(excerpt('  Một   đoạn\n\nngắn  '), 'Một đoạn ngắn');
  const long = `${'chữ '.repeat(80)}cuối`;
  const cut = excerpt(long);
  assert.ok(cut.endsWith('…'));
  assert.ok(cut.length <= 221);
  assert.ok(!cut.slice(0, -1).endsWith(' '));
  // Like Java's \s, a no-break space is not collapsed.
  assert.equal(excerpt(`a${NBSP}${NBSP}b`), `a${NBSP}${NBSP}b`);
});

test('isBlank, trim and blankToNull follow Java String semantics', () => {
  assert.equal(isBlank(''), true);
  assert.equal(isBlank(' \t\n'), true);
  assert.equal(isBlank(IDEOGRAPHIC_SPACE), true);
  assert.equal(isBlank(NBSP), false);
  assert.equal(trim(`${String.fromCodePoint(1)} x${NBSP} `), `x${NBSP}`);
  assert.equal(blankToNull('  '), null);
  assert.equal(blankToNull(' a '), 'a');
  assert.equal(blankToNull(undefined), null);
});
