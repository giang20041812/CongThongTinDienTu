import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Menu, Search, X } from 'lucide-react';
import schoolLogo from '../assets/logo.jpg';
import { usePost, usePostPage } from '../api';
import { Link, useRouter } from '../lib/router';
import { MenuLink, rootOf, useMenu } from '../lib/menu';
import { postRoute, toPostView } from '../lib/content';
import type { MenuNode } from '../types';
import { WeatherWidget } from './WeatherWidget';
import { Container, cx } from './ui';

interface NavigationBarProps {
  onOpenSearch: (query?: string) => void;
}

/** Id of the top-level menu entry the current page belongs to ('' = home). */
const useActiveRootId = () => {
  const { route } = useRouter();
  const { bySlug, byId } = useMenu();
  const { data: post } = usePost(route?.view === 'post' ? route.slug : null);
  if (!route || route.view === 'home') return '';
  const category = route.view === 'category' ? bySlug.get(route.slug) : post?.category ? byId.get(post.category.id) : undefined;
  return rootOf(category, byId)?.id ?? '';
};

const tabClass = (active: boolean) =>
  cx(
    'relative flex h-11 items-center gap-1 whitespace-nowrap rounded-t-xl px-2 text-[12px] font-semibold uppercase tracking-[0.03em] transition-colors duration-300 ease-(--ease-soft) xl:px-3.5 xl:text-[13px]',
    active ? 'bg-white text-brand-700' : 'text-white/90 hover:bg-brand-500 hover:text-white',
  );

/** Desktop tab with a hover/focus dropdown of its children. */
const DesktopItem: React.FC<{ node: MenuNode; active: boolean }> = ({ node, active }) => (
  <li className="group/nav relative shrink-0">
    <MenuLink category={node} aria-current={active ? 'page' : undefined} aria-haspopup={node.children.length > 0 || undefined} className={tabClass(active)}>
      {active && <span className="absolute inset-x-3 top-0 h-[3px] rounded-b-full bg-gold-400" aria-hidden="true" />}
      {node.name}
      {node.children.length > 0 && <ChevronDown className="size-3.5 opacity-70 transition-transform duration-300 group-hover/nav:rotate-180" />}
    </MenuLink>
    {node.children.length > 0 && (
      <div className="invisible absolute left-0 top-full z-50 min-w-64 translate-y-1 pt-1 opacity-0 transition-all duration-200 ease-(--ease-soft) group-focus-within/nav:visible group-focus-within/nav:translate-y-0 group-focus-within/nav:opacity-100 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100">
        <ul className="overflow-hidden rounded-xl border border-line bg-white py-2 text-ink shadow-xl">
          {node.children.map((child) => (
            <li key={child.id}>
              <MenuLink
                category={child}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13.5px] font-medium text-body transition-colors hover:bg-brand-50 hover:text-brand-600"
              >
                {child.name}
                {child.pageType === 'LINK' && <ExternalLink className="size-3.5 text-muted" />}
              </MenuLink>
            </li>
          ))}
        </ul>
      </div>
    )}
  </li>
);

/** Mobile accordion row: the heading navigates, the chevron expands its children. */
const MobileItem: React.FC<{ node: MenuNode; active: boolean; open: boolean; onToggle: () => void }> = ({ node, active, open, onToggle }) => (
  <li className="rounded-xl">
    <div className={cx('flex items-center rounded-xl', active ? 'bg-brand-600 text-white' : 'text-body')}>
      <MenuLink category={node} className={cx('flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide', !active && 'hover:text-brand-600')}>
        {node.name}
      </MenuLink>
      {node.children.length > 0 && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`${open ? 'Thu gọn' : 'Mở'} ${node.name}`}
          className="grid size-11 place-items-center"
        >
          <ChevronDown className={cx('size-4 transition-transform duration-300', open && 'rotate-180', active ? 'text-gold-300' : 'text-muted')} />
        </button>
      )}
    </div>
    {open && node.children.length > 0 && (
      <ul className="mb-1 ml-4 mt-1 border-l-2 border-brand-100 pl-2">
        {node.children.map((child) => (
          <li key={child.id}>
            <MenuLink category={child} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] text-body hover:bg-brand-50 hover:text-brand-600">
              {child.name}
              <ChevronRight className="size-4 text-muted" />
            </MenuLink>
          </li>
        ))}
      </ul>
    )}
  </li>
);

/**
 * Sticky main navigation (built from the menu tree in the database) + "Điểm tin" ticker row.
 * Tabs: rounded top corners / flat bottom; hover = lighter blue, active = white.
 */
export const NavigationBar: React.FC<NavigationBarProps> = ({ onOpenSearch }) => {
  const { route } = useRouter();
  const { tree } = useMenu();
  const activeRootId = useActiveRootId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [stuck, setStuck] = useState(false);
  const [query, setQuery] = useState('');
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Detect when the bar is pinned to the top so it can gain a shadow and the mini logo.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setExpanded(null);
  }, [route]);

  useEffect(() => {
    if (!menuOpen) return;
    setExpanded((current) => current ?? (activeRootId || null));
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onOpenSearch(query.trim());
    setMenuOpen(false);
  };

  const activeLabel = tree.find((item) => item.id === activeRootId)?.name;

  return (
    <>
      <div ref={sentinelRef} className="h-px" aria-hidden="true" />
      <nav
        aria-label="Điều hướng chính"
        className={cx('no-print sticky top-0 z-40 bg-brand-600 text-white transition-shadow duration-500', stuck && 'shadow-nav')}
      >
        <Container className="relative flex h-14 items-end gap-1">
          <Link
            to={{ view: 'home' }}
            tabIndex={stuck ? 0 : -1}
            aria-hidden={!stuck}
            className={cx(
              'hidden shrink-0 items-center self-center overflow-hidden transition-all duration-500 ease-(--ease-soft) xl:flex',
              stuck ? 'mr-2 w-10 opacity-100' : 'w-0 opacity-0',
            )}
          >
            <img src={schoolLogo} alt="" className="size-10 rounded-full bg-white object-contain p-0.5" />
          </Link>

          <ul className="hidden min-w-0 flex-1 items-end gap-0.5 lg:flex">
            <li className="shrink-0">
              <Link to={{ view: 'home' }} aria-current={activeRootId === '' && route?.view === 'home' ? 'page' : undefined} className={tabClass(route?.view === 'home')}>
                {route?.view === 'home' && <span className="absolute inset-x-3 top-0 h-[3px] rounded-b-full bg-gold-400" aria-hidden="true" />}
                Trang chủ
              </Link>
            </li>
            {tree.map((node) => (
              <DesktopItem key={node.id} node={node} active={node.id === activeRootId} />
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex items-center gap-2 self-center rounded-xl px-2.5 py-2 transition-colors hover:bg-brand-500 lg:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="text-[13px] font-semibold uppercase tracking-wider">Danh mục</span>
          </button>
          {activeLabel && <span className="min-w-0 self-center truncate text-[13px] text-white/70 lg:hidden">/ {activeLabel}</span>}

          <button
            type="button"
            onClick={() => onOpenSearch()}
            aria-label="Tìm kiếm"
            title="Tìm kiếm (Ctrl + K)"
            className="ml-auto grid size-10 shrink-0 place-items-center self-center rounded-full transition-colors duration-300 hover:bg-brand-500"
          >
            <Search className="size-[18px]" />
          </button>

          {/* Mobile / tablet menu */}
          <div
            id="mobile-menu"
            className={cx(
              'absolute inset-x-0 top-full max-h-[calc(100vh-3.5rem)] origin-top overflow-y-auto border-b border-line bg-white text-ink shadow-xl transition-all duration-300 ease-(--ease-soft) lg:hidden',
              menuOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0',
            )}
          >
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              <form onSubmit={submitSearch} className="relative mb-3">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm bài viết, thông báo..."
                  className="h-11 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-sm outline-none transition focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
                />
              </form>
              <ul className="grid gap-1">
                <li>
                  <Link
                    to={{ view: 'home' }}
                    className={cx(
                      'block rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wide',
                      route?.view === 'home' ? 'bg-brand-600 text-white' : 'text-body hover:text-brand-600',
                    )}
                  >
                    Trang chủ
                  </Link>
                </li>
                {tree.map((node) => (
                  <MobileItem
                    key={node.id}
                    node={node}
                    active={node.id === activeRootId}
                    open={expanded === node.id}
                    onToggle={() => setExpanded((current) => (current === node.id ? null : node.id))}
                  />
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </nav>
      {menuOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-brand-950/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <NewsTicker query={query} setQuery={setQuery} onSubmit={submitSearch} />
    </>
  );
};

const NewsTicker: React.FC<{ query: string; setQuery: (q: string) => void; onSubmit: (e: React.FormEvent) => void }> = ({
  query,
  setQuery,
  onSubmit,
}) => {
  const { data } = usePostPage({ type: ['POST_LIST', 'DOCUMENT_LIST'], size: 6 });
  const items = useMemo(() => data.items.map(toPostView), [data]);
  const duration = Math.max(28, items.reduce((sum, item) => sum + item.title.length, 0) * 0.16);

  return (
    <div className="no-print relative z-20 border-b border-line bg-white">
      <Container className="flex items-center gap-4 py-2.5">
        <WeatherWidget className="hidden md:flex" />

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-flame-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
            <span className="relative flex size-1.5" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-white" />
            </span>
            Điểm tin
          </span>
          <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_3%,#000_97%,transparent)]">
            {items.length === 0 ? (
              <p className="truncate text-[13px] text-muted">Chào mừng quý thầy cô, phụ huynh và các em học sinh đến với cổng thông tin nhà trường.</p>
            ) : (
              <div className="marquee-track flex w-max animate-marquee" style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}>
                {[...items, ...items].map((item, index) => {
                  const duplicate = index >= items.length;
                  return (
                    <Link
                      key={`${item.id}-${index}`}
                      to={postRoute(item)}
                      tabIndex={duplicate ? -1 : undefined}
                      aria-hidden={duplicate || undefined}
                      className="mr-10 inline-flex items-center gap-2.5 whitespace-nowrap text-[13px] font-medium text-body transition-colors hover:text-brand-600"
                    >
                      <span className="size-1.5 rounded-full bg-gold-400" aria-hidden="true" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={onSubmit} className="relative hidden w-64 shrink-0 lg:block xl:w-72" role="search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm bài viết, thông báo..."
            aria-label="Tìm kiếm"
            className="h-10 w-full rounded-full border border-line bg-surface pl-4 pr-11 text-[13px] text-ink outline-none transition-all duration-300 placeholder:text-muted focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
          />
          <button type="submit" aria-label="Tìm kiếm" className="absolute right-1 top-1 grid size-8 place-items-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-500">
            <Search className="size-3.5" />
          </button>
        </form>
      </Container>
    </div>
  );
};
