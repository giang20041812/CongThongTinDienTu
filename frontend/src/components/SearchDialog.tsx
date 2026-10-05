import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CornerDownLeft, FileText, FolderOpen, Search, X } from 'lucide-react';
import { usePostPage } from '../api';
import { useRouter } from '../lib/router';
import { categoryRoute, isExternal, useMenu } from '../lib/menu';
import { normalizeSearch, postRoute, toPostView } from '../lib/content';
import type { Category, PageRoute } from '../types';
import { cx } from './ui';

interface SearchResult {
  key: string;
  title: string;
  excerpt: string;
  meta: string;
  kind: 'post' | 'entry';
  to?: PageRoute;
  href?: string;
}

const SUGGESTION_COUNT = 6;

/** Menu entries match client-side; posts are searched (accent-insensitively) by the server. */
export const SearchDialog: React.FC<{ open: boolean; initialQuery: string; onClose: () => void }> = ({ open, initialQuery, onClose }) => {
  const { navigate } = useRouter();
  const { categories, byId } = useMenu();
  // Suggestions come from the menu: entries featured on the home page first, then other leaf entries.
  const suggestions = useMemo(() => {
    const leaves = categories.filter((c) => c.parentId && c.pageType !== 'LINK');
    return [...leaves.filter((c) => c.showOnHome), ...leaves.filter((c) => !c.showOnHome)].slice(0, SUGGESTION_COUNT).map((c) => c.name);
  }, [categories]);
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    setDebounced(initialQuery);
    setActiveIndex(0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
    };
  }, [open, initialQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const term = debounced.trim();
  const postsPage = usePostPage(open && term.length >= 2 ? { q: term, size: 15 } : null);

  const results = useMemo<SearchResult[]>(() => {
    const words = normalizeSearch(term).split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    const entries = categories
      .filter((c: Category) => words.every((w) => normalizeSearch(c.name).includes(w)))
      .slice(0, 5)
      .map((c) => {
        const parent = c.parentId ? byId.get(c.parentId) : undefined;
        return {
          key: `c-${c.id}`,
          title: c.name,
          excerpt: c.description ?? '',
          meta: parent ? `Mục · ${parent.name}` : 'Mục',
          kind: 'entry' as const,
          to: isExternal(c) ? undefined : categoryRoute(c),
          href: isExternal(c) ? c.externalUrl! : undefined,
        };
      });
    const posts = postsPage.data.items.map((raw) => {
      const p = toPostView(raw);
      return {
        key: `p-${p.id}`,
        title: p.title,
        excerpt: p.summary,
        meta: [p.categoryName, p.documentNumber && `Số ${p.documentNumber}`, p.date].filter(Boolean).join(' · '),
        kind: 'post' as const,
        to: postRoute(p),
      };
    });
    return [...entries, ...posts];
  }, [term, categories, byId, postsPage.data]);

  useEffect(() => setActiveIndex(0), [debounced]);

  if (!open) return null;

  const choose = (result: SearchResult) => {
    onClose();
    if (result.href) window.open(result.href, '_blank', 'noopener');
    else if (result.to) navigate(result.to);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') onClose();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
    if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault();
      choose(results[activeIndex]);
    }
  };

  const searching = query.trim() !== debounced.trim() || postsPage.loading;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[8vh] sm:pt-[12vh]" role="dialog" aria-modal="true" aria-label="Tìm kiếm" onKeyDown={onKeyDown}>
      <button type="button" aria-label="Đóng tìm kiếm" onClick={onClose} className="absolute inset-0 cursor-default bg-brand-950/55 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ animation: 'dialog-in 0.25s var(--ease-soft) both' }}>
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search className="size-5 shrink-0 text-brand-600" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm bài viết, thông báo, văn bản, mục..."
            aria-label="Từ khóa tìm kiếm"
            className="h-16 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
          />
          <button type="button" onClick={onClose} aria-label="Đóng" className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink">
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim().length === 0 ? (
            <div className="p-4">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Gợi ý tìm kiếm</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="rounded-full border border-line px-3.5 py-1.5 text-[13px] text-body transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="px-6 py-12 text-center">
              {searching ? (
                <p className="text-sm text-muted">Đang tìm…</p>
              ) : (
                <>
                  <p className="font-semibold text-ink">Không tìm thấy kết quả cho “{query}”</p>
                  <p className="mt-1 text-sm text-muted">Hãy thử từ khóa ngắn hơn, ví dụ “tuyển sinh”, “HSG”.</p>
                </>
              )}
            </div>
          ) : (
            <ul role="listbox" aria-label="Kết quả">
              <li className="px-3 pb-1 pt-2 text-[12px] text-muted">
                {results.length} kết quả{searching && ' · đang cập nhật…'}
              </li>
              {results.map((result, i) => (
                <li key={result.key} role="option" aria-selected={i === activeIndex}>
                  <button
                    onClick={() => choose(result)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cx('flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors', i === activeIndex ? 'bg-brand-50' : 'hover:bg-surface')}
                  >
                    <span
                      className={cx(
                        'mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg',
                        result.kind === 'entry' ? 'bg-gold-100 text-gold-700' : 'bg-brand-50 text-brand-600',
                      )}
                    >
                      {result.kind === 'entry' ? <FolderOpen className="size-4" /> : <FileText className="size-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11.5px] font-medium text-gold-700">{result.meta}</span>
                      <span className="mt-0.5 line-clamp-2 block text-[14px] font-semibold leading-snug text-ink">{result.title}</span>
                      {result.excerpt && <span className="mt-0.5 line-clamp-1 block text-[12.5px] text-muted">{result.excerpt}</span>}
                    </span>
                    {i === activeIndex ? <CornerDownLeft className="mt-2 size-4 shrink-0 text-brand-400" /> : <ArrowRight className="mt-2 size-4 shrink-0 text-line" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="hidden items-center gap-4 border-t border-line bg-surface/70 px-5 py-2.5 text-[11.5px] text-muted sm:flex">
          <span><kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-sans">↑</kbd> <kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-sans">↓</kbd> di chuyển</span>
          <span><kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-sans">Enter</kbd> mở</span>
          <span><kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-sans">Esc</kbd> đóng</span>
        </div>
      </div>
    </div>
  );
};
