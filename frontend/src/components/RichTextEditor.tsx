import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Baseline, Bold, Highlighter, ImagePlus, Italic, Link2, List, ListOrdered,
  Minus, Plus, Quote, Redo2, RemoveFormatting, Strikethrough, Trash2, Underline, Undo2, Unlink,
} from 'lucide-react';
import { FONT_FAMILIES, sanitizeHtml, toEditorHtml } from '../lib/richText';

type Mark = 'bold' | 'italic' | 'underline' | 'strikeThrough' | 'insertUnorderedList' | 'insertOrderedList' | 'justifyLeft' | 'justifyCenter' | 'justifyRight' | 'justifyFull';
const MARKS: Mark[] = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'];
const NO_MARKS = Object.fromEntries(MARKS.map((m) => [m, false])) as Record<Mark, boolean>;
/** Google-Docs-like palette: greys, then bright and darker shades of each hue. */
const PALETTE = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
  '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
  '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130',
];
const FONT_SIZES = [10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];
const BLOCKS = [
  { value: 'p', label: 'Văn bản thường' },
  { value: 'h1', label: 'Tiêu đề 1' },
  { value: 'h2', label: 'Tiêu đề 2' },
  { value: 'h3', label: 'Tiêu đề 3' },
];

/** "moet.gov.vn" -> https://moet.gov.vn, "a@b.vn" -> mailto:a@b.vn; anything with a scheme (or a path) stays as typed. */
function normalizeUrl(input: string): string {
  const url = input.trim();
  if (!url) return '';
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(url)) return url;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) return `mailto:${url}`;
  return `https://${url}`;
}

const toHex = (color: string) => {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color);
  return m ? `#${[m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')}` : '#000000';
};

const buttonClass = (active: boolean) =>
  `grid size-8 shrink-0 place-items-center rounded text-[#444746] transition-colors hover:bg-[#e8eaed] disabled:opacity-40 disabled:pointer-events-none ${active ? 'bg-[#d3e3fd] text-[#0b57d0]' : ''}`;
const selectClass = 'h-8 rounded border border-transparent bg-transparent px-1.5 text-[13px] text-[#444746] outline-none hover:bg-[#e8eaed] focus:border-[#0b57d0]';
const Divider = () => <span className="mx-1 h-5 w-px shrink-0 bg-[#c7c7c7]" aria-hidden="true" />;

/**
 * Google-Docs-style document editor: styles (headings), font and size, bold/italic/underline/strike, text and highlight
 * colour, alignment, lists, quotes, links and photos placed (and resizable) right in the text.
 * `initial` is read once (plain text from older posts is converted); `onChange` receives sanitised HTML. Remount it
 * (key) to load different content. `uploadImage` stores a picture and returns its URL.
 */
export function RichTextEditor({ initial, onChange, placeholder, uploadImage }: {
  initial: string;
  onChange: (html: string) => void;
  placeholder?: string;
  uploadImage?: (file: File) => Promise<string>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const range = useRef<Range | null>(null);
  const pendingSize = useRef<number | null>(null);
  const [active, setActive] = useState(NO_MARKS);
  const [linked, setLinked] = useState(false);
  const [block, setBlock] = useState('p');
  const [font, setFont] = useState('');
  const [size, setSize] = useState(16);
  const [textColor, setTextColor] = useState('#000000');
  const [highlight, setHighlight] = useState('#ffff00');
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [box, setBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const editor = ref.current;
    if (!editor) return;
    editor.innerHTML = toEditorHtml(initial);
    editor.dataset.empty = String(isEmpty(editor));
    // New lines become <p>, like the stored format (Chrome's default is <div>).
    document.execCommand('defaultParagraphSeparator', false, 'p');
  }, []);

  const isEmpty = (editor: HTMLElement) => editor.textContent === '' && !editor.querySelector('img');

  const insideEditor = () => {
    const selection = window.getSelection();
    return !!selection && selection.rangeCount > 0 && !!ref.current?.contains(selection.anchorNode);
  };

  const elementOf = (node: Node | null | undefined) => (node instanceof Element ? node : node?.parentElement) ?? null;

  const measure = (target: HTMLImageElement | null) => {
    if (!target || !paper.current) return setBox(null);
    const outer = paper.current.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    setBox({ top: rect.top - outer.top, left: rect.left - outer.left, width: rect.width, height: rect.height });
  };

  // Keep the toolbar in step with the caret/selection.
  useEffect(() => {
    const sync = () => {
      if (!insideEditor()) return;
      const selection = window.getSelection()!;
      range.current = selection.getRangeAt(0).cloneRange();
      setActive(Object.fromEntries(MARKS.map((m) => [m, document.queryCommandState(m)])) as Record<Mark, boolean>);
      const element = elementOf(selection.anchorNode);
      setLinked(!!element?.closest('a'));
      const heading = element?.closest('h1,h2,h3');
      setBlock(heading ? heading.tagName.toLowerCase() : 'p');
      const face = (document.queryCommandValue('fontName') || '').replace(/["']/g, '').split(',')[0].trim();
      setFont(FONT_FAMILIES.find((f) => f.label.toLowerCase() === face.toLowerCase())?.label ?? '');
      if (element && ref.current?.contains(element)) {
        const px = Math.round(parseFloat(getComputedStyle(element).fontSize));
        if (px) setSize(px);
        setTextColor(toHex(getComputedStyle(element).color));
      }
    };
    document.addEventListener('selectionchange', sync);
    return () => document.removeEventListener('selectionchange', sync);
  }, []);

  useEffect(() => {
    const update = () => measure(image);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [image]);

  /** <font size="7"> (what execCommand writes for a font size) becomes a span with the chosen pixel size. */
  const fixFonts = (px: number | null) => {
    const editor = ref.current;
    if (!editor || px == null) return;
    editor.querySelectorAll('font[size="7"]').forEach((node) => {
      const span = document.createElement('span');
      span.style.fontSize = `${px}px`;
      while (node.firstChild) span.appendChild(node.firstChild);
      node.replaceWith(span);
    });
  };

  const emit = () => {
    const editor = ref.current;
    if (!editor) return;
    fixFonts(pendingSize.current);
    editor.dataset.empty = String(isEmpty(editor));
    onChange(isEmpty(editor) ? '' : sanitizeHtml(editor.innerHTML));
    if (image) measure(image.isConnected ? image : null);
  };

  const restoreSelection = () => {
    ref.current?.focus();
    if (!range.current) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range.current);
  };

  /** Runs a document command on the saved selection; `css` writes styles (alignment, colours, font) instead of tags. */
  const run = (command: string, value?: string, css = false) => {
    restoreSelection();
    document.execCommand('styleWithCSS', false, String(css));
    document.execCommand(command, false, value);
    document.execCommand('styleWithCSS', false, 'false');
    emit();
  };

  const applySize = (px: number) => {
    const next = Math.min(120, Math.max(6, px));
    setSize(next);
    pendingSize.current = next;
    restoreSelection();
    document.execCommand('styleWithCSS', false, 'false');
    document.execCommand('fontSize', false, '7');
    emit();
  };

  const applyBlock = (value: string) => {
    restoreSelection();
    document.execCommand('formatBlock', false, value);
    setBlock(value);
    emit();
  };

  const toggleQuote = () => {
    restoreSelection();
    const quoted = elementOf(window.getSelection()?.anchorNode)?.closest('blockquote');
    document.execCommand('formatBlock', false, quoted ? 'p' : 'blockquote');
    emit();
  };

  const addLink = () => {
    restoreSelection();
    const selection = window.getSelection();
    const existing = elementOf(selection?.anchorNode)?.closest('a');
    const input = window.prompt('Dán đường dẫn (https://… hoặc địa chỉ email)', existing?.getAttribute('href') ?? 'https://');
    const url = input ? normalizeUrl(input) : '';
    if (!url || url === 'https://') return;
    restoreSelection();
    if (selection && selection.isCollapsed && !existing) {
      // Nothing selected: insert the address itself as the link text.
      const label = url.replace(/^(mailto:|tel:|https?:\/\/)/i, '');
      document.execCommand('insertHTML', false, `<a href="${url.replace(/"/g, '&quot;')}">${label.replace(/</g, '&lt;')}</a>`);
    } else {
      document.execCommand('createLink', false, url);
    }
    emit();
  };

  const insertImages = async (files: File[]) => {
    if (!uploadImage) return;
    const pictures = files.filter((f) => f.type.startsWith('image/'));
    if (pictures.length === 0) return;
    setBusy(true);
    try {
      for (const file of pictures) {
        try {
          const url = await uploadImage(file);
          restoreSelection();
          document.execCommand('insertHTML', false, `<img src="${url.replace(/"/g, '&quot;')}" alt="">`);
          range.current = window.getSelection()?.rangeCount ? window.getSelection()!.getRangeAt(0).cloneRange() : range.current;
          emit();
        } catch {
          /* the form reports upload failures through uploadImage */
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const selectImage = (target: HTMLImageElement | null) => {
    setImage(target);
    measure(target);
  };

  const contentWidth = () => {
    const editor = ref.current;
    if (!editor) return 600;
    const style = getComputedStyle(editor);
    return editor.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  };

  const resizeTo = (width: number) => {
    if (!image) return;
    image.setAttribute('width', String(Math.round(Math.min(contentWidth(), Math.max(40, width)))));
    measure(image);
  };

  const startDrag = (event: React.PointerEvent) => {
    if (!image) return;
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = image.getBoundingClientRect().width;
    const move = (e: PointerEvent) => resizeTo(startWidth + (e.clientX - startX));
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      emit();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const removeImage = () => {
    image?.remove();
    selectImage(null);
    emit();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      addLink();
    }
  };

  const tool = (label: string, Icon: typeof Bold, onClick: () => void, pressed = false, disabled = false) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      // Keep the selection in the editor while the button is pressed.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={buttonClass(pressed)}
    >
      <Icon size={16} />
    </button>
  );

  const colorTool = (id: string, label: string, Icon: typeof Bold, value: string, onPick: (color: string) => void, resetColor: string) => (
    <div className="relative" onMouseDown={(event) => { if (!(event.target instanceof HTMLInputElement)) event.preventDefault(); }}>
      <button type="button" title={label} aria-label={label} aria-expanded={menu === id} onClick={() => setMenu(menu === id ? null : id)} className={`relative ${buttonClass(menu === id)}`}>
        <Icon size={16} />
        <span className="absolute bottom-1 left-1.5 right-1.5 h-[3px] rounded-sm border border-black/10" style={{ backgroundColor: value }} />
      </button>
      {menu === id && (
        <div className="absolute left-0 top-9 z-20 w-[15.5rem] rounded-lg border border-[#dadce0] bg-white p-2.5 shadow-lg">
          <button type="button" className="mb-2 w-full rounded px-2 py-1.5 text-left text-[13px] text-[#444746] hover:bg-[#e8eaed]" onClick={() => { onPick(resetColor); setMenu(null); }}>
            {id === 'text' ? 'Màu mặc định (đen)' : 'Bỏ màu nền'}
          </button>
          <div className="grid grid-cols-10 gap-1">
            {PALETTE.map((color) => (
              <button key={color} type="button" title={color} aria-label={color} onClick={() => { onPick(color); setMenu(null); }}
                className="size-5 rounded-sm border border-black/15 hover:scale-110" style={{ backgroundColor: color }} />
            ))}
          </div>
          <label className="mt-2 flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-[13px] text-[#444746] hover:bg-[#e8eaed]">
            <input type="color" value={value} onChange={(e) => onPick(e.target.value)} className="size-6 cursor-pointer border-0 bg-transparent p-0" />
            Màu tuỳ chọn…
          </label>
        </div>
      )}
    </div>
  );

  return (
    <div className="border border-[#dadce0] bg-[#f9fbfd] focus-within:border-[#0b57d0]">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-[#dadce0] bg-[#edf2fa] p-1.5" role="toolbar" aria-label="Định dạng văn bản">
        {tool('Hoàn tác (Ctrl+Z)', Undo2, () => run('undo'))}
        {tool('Làm lại (Ctrl+Y)', Redo2, () => run('redo'))}
        <Divider />
        <select aria-label="Kiểu đoạn" className={`${selectClass} w-[8.5rem]`} value={block} onChange={(e) => applyBlock(e.target.value)}>
          {BLOCKS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
        <select aria-label="Phông chữ" className={`${selectClass} w-[8.5rem]`} value={font} onChange={(e) => e.target.value && run('fontName', FONT_FAMILIES.find((f) => f.label === e.target.value)!.label, true)}>
          <option value="">Mặc định</option>
          {FONT_FAMILIES.map((f) => <option key={f.label} value={f.label} style={{ fontFamily: f.css }}>{f.label}</option>)}
        </select>
        <Divider />
        {tool('Giảm cỡ chữ', Minus, () => applySize(size - 1))}
        <select aria-label="Cỡ chữ" className={`${selectClass} w-14 text-center`} value={FONT_SIZES.includes(size) ? size : ''} onChange={(e) => e.target.value && applySize(Number(e.target.value))}>
          {!FONT_SIZES.includes(size) && <option value="">{size}</option>}
          {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {tool('Tăng cỡ chữ', Plus, () => applySize(size + 1))}
        <Divider />
        {tool('In đậm (Ctrl+B)', Bold, () => run('bold'), active.bold)}
        {tool('In nghiêng (Ctrl+I)', Italic, () => run('italic'), active.italic)}
        {tool('Gạch dưới (Ctrl+U)', Underline, () => run('underline'), active.underline)}
        {tool('Gạch ngang', Strikethrough, () => run('strikeThrough'), active.strikeThrough)}
        {colorTool('text', 'Màu chữ', Baseline, textColor, (color) => { setTextColor(color); run('foreColor', color, true); }, '#000000')}
        {colorTool('bg', 'Màu nền chữ', Highlighter, highlight, (color) => { setHighlight(color); run('hiliteColor', color, true); }, '#ffffff')}
        <Divider />
        {tool('Gắn liên kết (Ctrl+K)', Link2, addLink, linked)}
        {tool('Gỡ liên kết', Unlink, () => run('unlink'), false, !linked)}
        {uploadImage && <>
          {tool(busy ? 'Đang tải ảnh…' : 'Chèn ảnh', ImagePlus, () => fileInput.current?.click(), false, busy)}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => { const files = Array.from(e.target.files ?? []); e.target.value = ''; void insertImages(files); }}
          />
        </>}
        <Divider />
        {tool('Căn trái', AlignLeft, () => run('justifyLeft', undefined, true), active.justifyLeft)}
        {tool('Căn giữa', AlignCenter, () => run('justifyCenter', undefined, true), active.justifyCenter)}
        {tool('Căn phải', AlignRight, () => run('justifyRight', undefined, true), active.justifyRight)}
        {tool('Căn đều hai bên', AlignJustify, () => run('justifyFull', undefined, true), active.justifyFull)}
        <Divider />
        {tool('Danh sách dấu đầu dòng', List, () => run('insertUnorderedList'), active.insertUnorderedList)}
        {tool('Danh sách đánh số', ListOrdered, () => run('insertOrderedList'), active.insertOrderedList)}
        {tool('Trích dẫn', Quote, toggleQuote, block === 'p' && !!elementOf(range.current?.startContainer)?.closest('blockquote'))}
        {tool('Xoá định dạng', RemoveFormatting, () => run('removeFormat'))}
      </div>

      <div className="max-h-[70vh] overflow-auto bg-[#f9fbfd] px-2 py-5 sm:px-6" onScroll={() => measure(image)}>
        <div ref={paper} className="relative mx-auto w-full max-w-[816px] bg-white shadow-[0_0_0_1px_#dadce0,0_1px_3px_rgba(60,64,67,0.2)]">
          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            data-placeholder={placeholder}
            className="rich-editor"
            onInput={emit}
            onBlur={emit}
            onKeyDown={onKeyDown}
            onMouseDown={(event) => {
              const target = event.target as HTMLElement;
              if (target instanceof HTMLImageElement) {
                // Select the picture so it can be resized, aligned (paragraph alignment) or deleted.
                const selection = window.getSelection();
                const picked = document.createRange();
                picked.selectNode(target);
                selection?.removeAllRanges();
                selection?.addRange(picked);
                event.preventDefault();
                ref.current?.focus();
                selectImage(target);
              } else if (image) {
                selectImage(null);
              }
            }}
            onPaste={(event) => {
              const files = Array.from(event.clipboardData.files);
              if (files.some((f) => f.type.startsWith('image/'))) {
                event.preventDefault();
                void insertImages(files);
                return;
              }
              // Keep what the editor can express (from Word, Docs or the web); the rest is dropped.
              event.preventDefault();
              const html = event.clipboardData.getData('text/html');
              if (html) document.execCommand('insertHTML', false, sanitizeHtml(html));
              else document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
              emit();
            }}
            onDrop={(event) => {
              const files = Array.from(event.dataTransfer.files);
              if (files.some((f) => f.type.startsWith('image/'))) {
                event.preventDefault();
                void insertImages(files);
              }
            }}
          />
          {image && box && (
            <div className="pointer-events-none absolute z-[5]" style={{ top: box.top, left: box.left, width: box.width, height: box.height }}>
              <div className="absolute inset-0 border-2 border-[#0b57d0]" />
              <div className="pointer-events-auto absolute -top-9 left-0 flex items-center gap-0.5 rounded border border-[#dadce0] bg-white p-0.5 shadow" onMouseDown={(e) => e.preventDefault()}>
                {[25, 50, 75, 100].map((pct) => (
                  <button key={pct} type="button" className="h-7 rounded px-1.5 text-[12px] text-[#444746] hover:bg-[#e8eaed]" onClick={() => resizeTo((contentWidth() * pct) / 100)}>{pct}%</button>
                ))}
                <button type="button" title="Xoá ảnh" aria-label="Xoá ảnh" className={buttonClass(false)} onClick={removeImage}><Trash2 size={15} /></button>
              </div>
              <span
                role="slider"
                aria-label="Kéo để đổi kích thước ảnh"
                aria-valuenow={Math.round(box.width)}
                className="pointer-events-auto absolute -bottom-1.5 -right-1.5 size-3 cursor-nwse-resize border border-white bg-[#0b57d0]"
                onPointerDown={startDrag}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
