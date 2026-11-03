import assert from 'node:assert/strict';
import { test } from 'node:test';
import { blankToNull, blockText, excerpt, htmlToText, isBlank, isRichHtml, sanitizeHtml, searchable, slugOf, trim } from '../src/text.js';

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

test('sanitizeHtml keeps the editor formatting and drops everything else', () => {
  assert.equal(sanitizeHtml('<p>Xin <b>chào</b> <i>các</i> <u>em</u></p>'), '<p>Xin <strong>chào</strong> <em>các</em> <u>em</u></p>');
  assert.equal(sanitizeHtml('<div>một</div><div>hai<br></div>'), '<p>một</p><p>hai<br></p>');
  assert.equal(
    sanitizeHtml('<p onclick="x()" style="color:red">a<script>alert(1)</script><img src=x onerror=y></p>'),
    '<p>aalert(1)</p>',
  );
  assert.equal(sanitizeHtml('a < b && c > d'), 'a &lt; b && c &gt; d');
  assert.equal(sanitizeHtml('<p><strong>mở mà không đóng'), '<p><strong>mở mà không đóng</strong></p>');
});

test('sanitizeHtml only keeps safe link targets', () => {
  assert.equal(
    sanitizeHtml('<a href="https://moet.gov.vn/a?b=1&amp;c=2" class="x">Bộ</a>'),
    '<a href="https://moet.gov.vn/a?b=1&amp;c=2" target="_blank" rel="noopener noreferrer">Bộ</a>',
  );
  assert.equal(sanitizeHtml('<a href="/tin-tuc">trong trang</a>'), '<a href="/tin-tuc">trong trang</a>');
  assert.equal(sanitizeHtml('<a href="mailto:a@b.vn">mail</a>'), '<a href="mailto:a@b.vn">mail</a>');
  assert.equal(sanitizeHtml('<a href="javascript:alert(1)">x</a>'), 'x');
  assert.equal(sanitizeHtml('<a href=" JavaScript:alert(1)">x</a>'), 'x');
  assert.equal(sanitizeHtml('<a href="&#106;avascript:alert(1)">x</a>'), 'x');
  assert.equal(sanitizeHtml('<a href="//evil.example">x</a>'), 'x');
  assert.equal(sanitizeHtml('<a>không có href</a>'), 'không có href');
});

test('htmlToText and blockText give readable text for summaries', () => {
  assert.equal(htmlToText('<p>Lễ&nbsp;khai giảng &amp; <b>tựu trường</b></p><p>Hai</p>'), 'Lễ khai giảng & tựu trường Hai');
  assert.equal(htmlToText('<p><br></p>'), '');
  assert.equal(blockText('Văn bản thuần <3 không phải HTML'), 'Văn bản thuần <3 không phải HTML');
  assert.equal(blockText('<p>Có <u>HTML</u></p>'), 'Có HTML');
  assert.ok(isRichHtml('<p>x</p>'));
  assert.ok(!isRichHtml('x < y và y > z'));
});

test('sanitizeHtml keeps document formatting: headings, lists, alignment, font styles and images', () => {
  assert.equal(sanitizeHtml('<h1 style="text-align: center; color:red">T</h1>'), '<h1 style="text-align:center">T</h1>');
  assert.equal(sanitizeHtml('<ul><li>a</li><li style="text-align:right">b</li></ul>'), '<ul><li>a</li><li style="text-align:right">b</li></ul>');
  assert.equal(
    sanitizeHtml('<p><span style="font-size: 24px; color: rgb(255, 0, 0); position:fixed; font-family: Georgia, serif">x</span></p>'),
    '<p><span style="font-size:24px;color:rgb(255, 0, 0);font-family:Georgia,serif">x</span></p>',
  );
  assert.equal(sanitizeHtml('<span style="font-family: evil; color: url(x)">x</span>'), '<span>x</span>');
  assert.equal(sanitizeHtml('<p><img src="/uploads/a.png" width="300" onerror="x()" alt="A"></p>'), '<p><img src="/uploads/a.png" alt="A" width="300"></p>');
  assert.equal(sanitizeHtml('<img src="javascript:alert(1)"><img src="data:image/png;base64,AA"><img src="//evil.example/a.png">'), '');
  assert.equal(sanitizeHtml('<p>a</p><h2>b'), '<p>a</p><h2>b</h2>');
  assert.ok(isRichHtml('<img src="/a.png">'));
});
