/**
 * Text blocks written in the admin editor are small HTML fragments (paragraphs, line breaks, bold, italic,
 * underline, links); older posts hold plain text with blank-line paragraphs. This file converts between the two and
 * sanitises HTML with the same allow-list as the server (backend/src/text.ts), so a post is safe even if a
 * stored block was not cleaned.
 */

const RICH_TAG = /<\/?(?:p|br|strong|em|u|a|b|i|div)(?:\s[^>]*)?\/?>/i;
const SAFE_HREF = /^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

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

const ALIASES: Record<string, string> = { B: 'strong', I: 'em', DIV: 'p', INS: 'u', STRONG: 'strong', EM: 'em', U: 'u', P: 'p', BR: 'br', A: 'a' };
const BLOCK = new Set(['p']);

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
      // Unknown element (span, font, h1...): keep its text, drop it. <script>/<style> contents are not text.
      if (!/^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT)$/.test(element.tagName)) copyInto(element, target, doc);
      return;
    }
    if (name === 'br') {
      target.appendChild(doc.createElement('br'));
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
    copyInto(element, copy, doc);
    target.appendChild(copy);
  });
}

/** Allow-listed HTML, with loose text and inline runs wrapped in <p> so every stored block is paragraph-shaped. */
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
  return (new DOMParser().parseFromString(content, 'text/html').body.textContent ?? '').replace(/ /g, ' ');
}

export const hasText = (content?: string | null) => !!content && blockToText(content).trim() !== '';

/** Editor HTML for any stored text block. */
export const toEditorHtml = (content: string) => sanitizeHtml(isRichHtml(content) ? content : plainToHtml(content));
