import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Bold, Italic, Link2, Underline, Unlink } from 'lucide-react';
import { sanitizeHtml, toEditorHtml } from '../lib/richText';

type Command = 'bold' | 'italic' | 'underline';

const COMMANDS: { command: Command; label: string; shortcut: string; Icon: typeof Bold }[] = [
  { command: 'bold', label: 'In đậm', shortcut: 'Ctrl+B', Icon: Bold },
  { command: 'italic', label: 'In nghiêng', shortcut: 'Ctrl+I', Icon: Italic },
  { command: 'underline', label: 'Gạch dưới', shortcut: 'Ctrl+U', Icon: Underline },
];

/** "moet.gov.vn" -> https://moet.gov.vn, "a@b.vn" -> mailto:a@b.vn; anything with a scheme (or a path) stays as typed. */
function normalizeUrl(input: string): string {
  const url = input.trim();
  if (!url) return '';
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(url)) return url;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) return `mailto:${url}`;
  return `https://${url}`;
}

const buttonClass = (active: boolean) =>
  `grid size-8 place-items-center border text-[#536b80] transition-colors hover:border-[#0052cc] hover:text-[#0052cc] ${
    active ? 'border-[#0052cc] bg-[#e8f3fb] text-[#0052cc]' : 'border-[#e3ebf3] bg-white'
  }`;

/**
 * Small WYSIWYG editor for a text block: bold, italic, underline, links. `initial` is read once (plain text from
 * older posts is converted); `onChange` receives sanitised HTML. Remount it (key) to load different content.
 */
export function RichTextEditor({ initial, onChange, placeholder }: { initial: string; onChange: (html: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const range = useRef<Range | null>(null);
  const [active, setActive] = useState<Record<Command, boolean>>({ bold: false, italic: false, underline: false });
  const [linked, setLinked] = useState(false);

  useLayoutEffect(() => {
    const editor = ref.current;
    if (!editor) return;
    editor.innerHTML = toEditorHtml(initial);
    editor.dataset.empty = String(editor.textContent === '');
    // New lines become <p>, like the stored format (Chrome's default is <div>).
    document.execCommand('defaultParagraphSeparator', false, 'p');
  }, []);

  const insideEditor = () => {
    const selection = window.getSelection();
    return !!selection && selection.rangeCount > 0 && !!ref.current?.contains(selection.anchorNode);
  };

  // Keep the toolbar in step with the caret/selection (bold/italic/underline on, caret inside a link).
  useEffect(() => {
    const sync = () => {
      if (!insideEditor()) return;
      const selection = window.getSelection()!;
      range.current = selection.getRangeAt(0).cloneRange();
      setActive({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
      });
      const node = selection.anchorNode;
      setLinked(!!(node instanceof Element ? node : node?.parentElement)?.closest('a'));
    };
    document.addEventListener('selectionchange', sync);
    return () => document.removeEventListener('selectionchange', sync);
  }, []);

  const emit = () => {
    const editor = ref.current;
    if (!editor) return;
    editor.dataset.empty = String(editor.textContent === '');
    onChange(editor.textContent === '' ? '' : sanitizeHtml(editor.innerHTML));
  };

  const restoreSelection = () => {
    ref.current?.focus();
    if (!range.current) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range.current);
  };

  const run = (command: string, value?: string) => {
    restoreSelection();
    document.execCommand(command, false, value);
    emit();
  };

  const addLink = () => {
    restoreSelection();
    const selection = window.getSelection();
    const existing = (selection?.anchorNode instanceof Element ? selection.anchorNode : selection?.anchorNode?.parentElement)?.closest('a');
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

  const onKeyDown = (event: React.KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      addLink();
    }
  };

  return (
    <div className="border border-[#e3ebf3] bg-white focus-within:border-[#0052cc]">
      <div className="flex flex-wrap items-center gap-1 border-b border-[#e3ebf3] bg-[#f5f8fb] p-1.5" role="toolbar" aria-label="Định dạng chữ">
        {COMMANDS.map(({ command, label, shortcut, Icon }) => (
          <button
            key={command}
            type="button"
            title={`${label} (${shortcut})`}
            aria-label={label}
            aria-pressed={active[command]}
            // Keep the selection in the editor while the button is pressed.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => run(command)}
            className={buttonClass(active[command])}
          >
            <Icon size={15} />
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-[#dbe4ec]" aria-hidden="true" />
        <button type="button" title="Gắn liên kết (Ctrl+K)" aria-label="Gắn liên kết" onMouseDown={(event) => event.preventDefault()} onClick={addLink} className={buttonClass(linked)}>
          <Link2 size={15} />
        </button>
        <button type="button" title="Gỡ liên kết" aria-label="Gỡ liên kết" disabled={!linked} onMouseDown={(event) => event.preventDefault()} onClick={() => run('unlink')} className={`${buttonClass(false)} disabled:opacity-40 disabled:pointer-events-none`}>
          <Unlink size={15} />
        </button>
      </div>
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
        onPaste={(event) => {
          // Paste as plain text: formatting from Word/web pages would not survive the allow-list anyway.
          event.preventDefault();
          document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
        }}
      />
    </div>
  );
}
