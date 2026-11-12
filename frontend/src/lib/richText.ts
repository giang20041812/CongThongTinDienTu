/**
 * Text blocks written in the admin editor are HTML fragments (paragraphs, headings, lists, quotes, bold / italic /
 * underline / strike, links, images, and a few text styles: alignment, font, size, colours); older posts hold plain
 * text with blank-line paragraphs. This file converts between the two and sanitises HTML with the same allow-list as
 * the server (backend/src/text.ts), so a post is safe even if a stored block was not cleaned.
 */

const RICH_TAG = /<\/?(?:p|br|strong|em|u|s|a|b|i|div|h[1-3]|ul|ol|li|blockquote|span|img)(?:\s[^>]*)?\/?>/i;
const SAFE_HREF = /^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;
const SAFE_SRC = /^(?:https?:\/\/|\/(?!\/))/i;

/** Whether a text block holds editor HTML (otherwise it is plain text). */
export const isRichHtml = (content: string) => RICH_TAG.test(content);

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Plain text (blank line = new paragraph, single newline = line break) as editor HTML. */
export const plainToHtml = (text: string) =>
  text
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\r?\n/g, '<br>')}</p>`)
    .join('');

/** Fonts the editor offers; stored as the first family name only (the stack is added when the style is cleaned). */
export const FONT_FAMILIES: { label: string; css: string }[] = [
  { label: 'Arial', css: 'Arial,sans-serif' },
  { label: 'Times New Roman', css: "'Times New Roman',serif" },
  { label: 'Georgia', css: 'Georgia,serif' },
  { label: 'Verdana', css: 'Verdana,sans-serif' },
  { label: 'Tahoma', css: 'Tahoma,sans-serif' },
  { label: 'Trebuchet MS', css: "'Trebuchet MS',sans-serif" },
  { label: 'Courier New', css: "'Courier New',monospace" },
];

const ALIASES: Record<string, string> = {
  B: 'strong', STRONG: 'strong', I: 'em', EM: 'em', U: 'u', INS: 'u', S: 's', STRIKE: 's', DEL: 's',
  P: 'p', DIV: 'p', H1: 'h1', H2: 'h2', H3: 'h3', UL: 'ul', OL: 'ol', LI: 'li', BLOCKQUOTE: 'blockquote',
  SPAN: 'span', BR: 'br', A: 'a', IMG: 'img',
};
const ALIGNABLE = new Set(['p', 'h1', 'h2', 'h3', 'li', 'blockquote']);
const BLOCK = new Set(['p', 'h1', 'h2', 'h3', 'ul', 'ol', 'blockquote']);
const COLOR = /^(?:#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*[01]?(?:\.\d+)?\s*)?\))$/i;

/** The CSS the editor writes, re-serialised; anything else is dropped (mirrors cleanStyle on the server). */
function cleanStyle(tag: string, style: string): string {
  const keep: string[] = [];
  for (const declaration of style.split(';')) {
    const colon = declaration.indexOf(':');
    if (colon < 0) continue;
    const prop = declaration.slice(0, colon).trim().toLowerCase();
    const value = declaration.slice(colon + 1).trim();
    if (ALIGNABLE.has(tag) && prop === 'text-align' && /^(?:left|right|center|justify)$/i.test(value)) {
      keep.push(`text-align:${value.toLowerCase()}`);
    } else if (ALIGNABLE.has(tag) && prop === 'text-indent') {
      const size = /^(\d{1,3}(?:\.\d+)?)(px|pt|em|rem|cm|mm|in)$/i.exec(value);
      if (size && Number(size[1]) > 0 && Number(size[1]) <= 200) {
        keep.push(`text-indent:${size[1]}${size[2].toLowerCase()}`);
      }
    } else if (tag === 'span') {
      if (prop === 'font-size') {
        const size = /^(\d{1,3}(?:\.\d+)?)(px|pt)$/i.exec(value);
        if (size && Number(size[1]) >= 6 && Number(size[1]) <= 120) keep.push(`font-size:${size[1]}${size[2].toLowerCase()}`);
      } else if ((prop === 'color' || prop === 'background-color') && COLOR.test(value)) {
        keep.push(`${prop}:${value.toLowerCase().replace(/\s+/g, ' ')}`);
      } else if (prop === 'font-family') {
        const first = value.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
        const font = FONT_FAMILIES.find((f) => f.label.toLowerCase() === first);
        if (font) keep.push(`font-family:${font.css}`);
      }
    }
  }
  return keep.join(';');
}

/** Copies the allowed formatting of `source`'s children into `target`; other elements are unwrapped. */
function copyInto(source: Node, target: Node, doc: Document) {
  source.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      target.appendChild(doc.createTextNode(node.textContent ?? ''));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as Element;
    const name = ALIASES[element.tagName];
    if (!name) {
      // Unknown element (font, table...): keep its text, drop it. <script>/<style> contents are not text.
      if (!/^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT)$/.test(element.tagName)) copyInto(element, target, doc);
      return;
    }
    if (name === 'br') {
      target.appendChild(doc.createElement('br'));
      return;
    }
    if (name === 'img') {
      const src = (element.getAttribute('src') ?? '').trim();
      if (!SAFE_SRC.test(src)) return;
      const image = doc.createElement('img');
      image.setAttribute('src', src);
      image.setAttribute('alt', (element.getAttribute('alt') ?? '').slice(0, 300));
      const width = Number((element.getAttribute('width') ?? '').replace(/px$/i, ''));
      if (width >= 20 && width <= 2400) image.setAttribute('width', String(Math.round(width)));
      target.appendChild(image);
      return;
    }
    if (name === 'a') {
      const href = (element.getAttribute('href') ?? '').trim();
      if (!SAFE_HREF.test(href)) {
        copyInto(element, target, doc);
        return;
      }
      const link = doc.createElement('a');
      link.setAttribute('href', href);
      if (/^https?:/i.test(href)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
      copyInto(element, link, doc);
      target.appendChild(link);
      return;
    }
    const copy = doc.createElement(name);
    const style = cleanStyle(name, element.getAttribute('style') ?? '');
    if (style) copy.setAttribute('style', style);
    copyInto(element, copy, doc);
    target.appendChild(copy);
  });
}

/** Allow-listed HTML, with loose text and inline runs wrapped in <p> so every stored block is block-shaped. */
export function sanitizeHtml(html: string): string {
  if (typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const clean = doc.createElement('div');
  copyInto(doc.body, clean, doc);

  let paragraph: HTMLElement | null = null;
  const out = doc.createElement('div');
  Array.from(clean.childNodes).forEach((node) => {
    if (node instanceof HTMLElement && BLOCK.has(node.tagName.toLowerCase())) {
      paragraph = null;
      out.appendChild(node);
      return;
    }
    if (!paragraph) {
      paragraph = doc.createElement('p');
      out.appendChild(paragraph);
    }
    paragraph.appendChild(node);
  });
  return out.innerHTML;
}

/** Plain text of a text block (HTML or plain), for emptiness checks. */
export function blockToText(content: string): string {
  if (!isRichHtml(content)) return content;
  if (typeof DOMParser === 'undefined') return content.replace(/<[^>]*>/g, ' ');
  return (new DOMParser().parseFromString(content, 'text/html').body.textContent ?? '').replace(/ /g, ' ');
}

/** A block has something to show: text, or (for editor HTML) an image. */
export const hasText = (content?: string | null) => !!content && (blockToText(content).trim() !== '' || /<img\b/i.test(content));

/** Editor HTML for any stored text block. */
export const toEditorHtml = (content: string) => sanitizeHtml(isRichHtml(content) ? content : plainToHtml(content));
