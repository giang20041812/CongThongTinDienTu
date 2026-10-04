import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CaretLeft, CaretRight, FileMagnifyingGlass, ImageIcon, type IconComponent } from './icons';
import { Link } from '../lib/router';
import { optimizeImage } from '../lib/content';
import type { PageRoute } from '../types';

export const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

/**
 * Pointer handler for cards with the `spotlight` glow (--mx/--my, in px) and/or the `tilt`
 * effect (--px/--py, 0–1). Mouse only: touch has no hover to light up.
 */
export const trackPointer = (event: React.PointerEvent<HTMLElement>) => {
  if (event.pointerType !== 'mouse') return;
  const element = event.currentTarget;
  const box = element.getBoundingClientRect();
  const x = event.clientX - box.left;
  const y = event.clientY - box.top;
  element.style.setProperty('--mx', `${x}px`);
  element.style.setProperty('--my', `${y}px`);
  element.style.setProperty('--px', (x / box.width).toFixed(3));
  element.style.setProperty('--py', (y / box.height).toFixed(3));
};

export const Container: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cx('mx-auto w-full max-w-7xl px-4 sm:px-6', className)}>{children}</div>
);

/** Fades children up the first time they scroll into view. */
export const Reveal: React.FC<{ className?: string; delay?: number; children: React.ReactNode; as?: 'div' | 'section' | 'li' }> = ({
  className,
  delay = 0,
  children,
  as: Tag = 'div',
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Content that mounts already on screen (e.g. after data loads) is shown right away
    // instead of waiting on an observer callback; only off-screen content is deferred.
    const rect = node.getBoundingClientRect();
    if (!('IntersectionObserver' in window) || (rect.top < window.innerHeight && rect.bottom > 0)) {
      const frame = requestAnimationFrame(() => setVisible(true));
      const fallback = window.setTimeout(() => setVisible(true), 120);
      return () => {
        cancelAnimationFrame(frame);
        window.clearTimeout(fallback);
      };
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as any}
      className={cx('reveal', visible && 'is-visible', className)}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
};

export const ImagePlaceholder: React.FC<{ label?: string; className?: string }> = ({ label, className }) => (
  <div
    className={cx(
      'relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white/80',
      className,
    )}
  >
    <div className="absolute inset-0 bg-dots opacity-70" />
    <div className="absolute -bottom-10 -right-10 size-32 rounded-full bg-gold-400/20 blur-2xl" />
    <ImageIcon className="relative size-7 text-gold-300" />
    {label && <span className="relative px-3 text-center text-xs font-semibold uppercase tracking-[0.14em]">{label}</span>}
  </div>
);

interface SmartImageProps {
  src?: string;
  alt: string;
  width?: number;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  placeholderLabel?: string;
}

/** Lazy, resized (Cloudinary/Unsplash), fades in on load and falls back to a branded placeholder. */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  width = 800,
  className,
  imgClassName,
  priority = false,
  placeholderLabel,
}) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const optimized = optimizeImage(src, width);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [optimized]);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, [optimized]);

  return (
    <div className={cx('relative overflow-hidden bg-brand-50', className)}>
      {!optimized || failed ? (
        <ImagePlaceholder label={placeholderLabel} />
      ) : (
        <img
          ref={imgRef}
          src={optimized}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cx(
            'h-full w-full object-cover transition-[opacity,transform] duration-700 ease-(--ease-soft)',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      )}
    </div>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode; tone?: 'gold' | 'flame' | 'light'; className?: string }> = ({
  children,
  tone = 'gold',
  className,
}) => (
  <p
    className={cx(
      'flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]',
      tone === 'gold' && 'text-gold-600',
      tone === 'flame' && 'text-flame-600',
      tone === 'light' && 'text-gold-300',
      className,
    )}
  >
    <span
      className={cx('h-[3px] w-6 rounded-full bg-gradient-to-r', tone === 'flame' ? 'from-flame-500 to-gold-400' : 'from-gold-400 to-flame-500')}
      aria-hidden="true"
    />
    {children}
  </p>
);

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  tone?: 'gold' | 'flame';
  /** Shown in a gradient tile before the title. */
  icon?: IconComponent;
  description?: string;
  action?: { to: PageRoute; label: string };
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ eyebrow, title, tone = 'gold', icon: Icon, description, action, className }) => (
  <div className={cx('mb-6 flex items-end justify-between gap-4', className)}>
    <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
      {Icon && (
        <span
          className={cx(
            'relative grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg sm:size-14',
            tone === 'flame' ? 'from-flame-400 via-flame-500 to-orange-500 shadow-flame-500/30' : 'from-brand-400 via-brand-600 to-violet-600 shadow-brand-600/30',
          )}
          aria-hidden="true"
        >
          <Icon className="size-6 sm:size-7" />
          <span className="absolute -right-1 -top-1 size-3.5 rounded-full border-2 border-white bg-gold-400" />
        </span>
      )}
      <div className="min-w-0">
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        <h2 className="mt-1.5 text-[1.375rem] font-extrabold leading-tight sm:text-[1.75rem]">{title}</h2>
        <span
          className={cx(
            'heading-bar mt-2.5 block h-1 w-20 rounded-full bg-gradient-to-r',
            tone === 'flame' ? 'from-flame-500 via-orange-400 to-gold-400' : 'from-brand-600 via-sky-400 to-gold-400',
          )}
          aria-hidden="true"
        />
        {description && <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-muted">{description}</p>}
      </div>
    </div>
    {action && (
      // A round arrow on phones, so the title keeps the width; the label shows from `sm` up.
      <Link
        to={action.to}
        aria-label={action.label}
        className="group grid size-10 shrink-0 place-items-center rounded-full border border-brand-100 bg-white text-sm font-semibold text-brand-600 shadow-sm transition-all duration-300 hover:border-brand-600 hover:bg-brand-600 hover:text-white sm:flex sm:size-auto sm:gap-1.5 sm:px-4 sm:py-2"
      >
        <span className="hidden sm:inline">{action.label}</span>
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    )}
  </div>
);

export interface Crumb {
  label: string;
  to?: PageRoute;
}

export const Breadcrumb: React.FC<{ items: Crumb[]; light?: boolean }> = ({ items, light = false }) => (
  <nav aria-label="Đường dẫn" className="min-w-0">
    <ol className={cx('flex flex-wrap items-center gap-1.5 text-[13px]', light ? 'text-white/70' : 'text-muted')}>
      <li>
        <Link to={{ view: 'home' }} className={cx('transition-colors', light ? 'hover:text-white' : 'hover:text-brand-600')}>
          Trang chủ
        </Link>
      </li>
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
          <CaretRight className="size-3 shrink-0 opacity-60" />
          {item.to ? (
            <Link to={item.to} className={cx('transition-colors', light ? 'hover:text-white' : 'hover:text-brand-600')}>
              {item.label}
            </Link>
          ) : (
            <span className={cx('truncate font-medium', light ? 'text-white' : 'text-ink')} aria-current="page">
              {item.label}
            </span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  crumbs: Crumb[];
  aside?: React.ReactNode;
}

/** Navy band shared by every list page so all sections read as one publication. */
export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, description, crumbs, aside }) => (
  <section className="relative overflow-hidden bg-brand-700 text-white">
    <div className="absolute inset-0 bg-dots opacity-60" aria-hidden="true" />
    <div className="absolute -right-20 -top-28 size-80 rounded-full bg-gold-400/15 blur-3xl" aria-hidden="true" />
    <div className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-brand-400/25 blur-3xl" aria-hidden="true" />
    <Container className="relative py-8 sm:py-11">
      <Breadcrumb items={crumbs} light />
      <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl animate-fade-up">
          <Eyebrow tone="light">{eyebrow}</Eyebrow>
          <h1 className="mt-2 text-[1.75rem] font-bold leading-tight text-white sm:text-4xl">{title}</h1>
          {description && <p className="mt-3 text-[15px] leading-relaxed text-white/75">{description}</p>}
        </div>
        {aside && <div className="shrink-0 animate-fade-up">{aside}</div>}
      </div>
    </Container>
    <div className="brand-stripe h-1" aria-hidden="true" />
  </section>
);

/** Slim white bar with breadcrumb, used above article/detail pages. */
export const DetailBar: React.FC<{ crumbs: Crumb[] }> = ({ crumbs }) => (
  <div className="border-b border-line bg-white">
    <Container className="py-3.5">
      <Breadcrumb items={crumbs} />
    </Container>
  </div>
);

export const StatPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-sm">
    <div className="text-[11px] font-medium uppercase tracking-wider text-white/65">{label}</div>
    <div className="mt-0.5 text-xl font-bold text-gold-300">{value}</div>
  </div>
);

interface FilterChipsProps<T extends string> {
  options: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

export function FilterChips<T extends string>({ options, value, onChange, label }: FilterChipsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            className={cx(
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-300',
              active
                ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                : 'border-line bg-white text-body hover:border-brand-300 hover:text-brand-600',
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={cx('rounded-full px-1.5 text-[11px]', active ? 'bg-white/20' : 'bg-surface text-muted')}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export const Pagination: React.FC<{ page: number; totalPages: number; onChange: (page: number) => void }> = ({
  page,
  totalPages,
  onChange,
}) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );
  const go = (next: number) => {
    onChange(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const button =
    'inline-flex size-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-40';
  return (
    <nav aria-label="Phân trang" className="mt-10 flex items-center justify-center gap-1.5">
      <button onClick={() => go(page - 1)} disabled={page === 1} className={cx(button, 'border border-line bg-white text-body hover:border-brand-300 hover:text-brand-600')} aria-label="Trang trước">
        <CaretLeft className="size-4" />
      </button>
      {pages.map((p, i) => (
        <React.Fragment key={p}>
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
          <button
            onClick={() => go(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cx(button, p === page ? 'bg-brand-600 text-white shadow-sm' : 'text-body hover:bg-white hover:text-brand-600')}
          >
            {p}
          </button>
        </React.Fragment>
      ))}
      <button onClick={() => go(page + 1)} disabled={page === totalPages} className={cx(button, 'border border-line bg-white text-body hover:border-brand-300 hover:text-brand-600')} aria-label="Trang sau">
        <CaretRight className="size-4" />
      </button>
    </nav>
  );
};

export const EmptyState: React.FC<{ title: string; description?: string; action?: React.ReactNode }> = ({ title, description, action }) => (
  <div className="flex flex-col items-center rounded-2xl border border-dashed border-brand-200 bg-white px-6 py-14 text-center">
    <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-violet-600 text-white shadow-lg shadow-brand-600/25">
      <FileMagnifyingGlass className="size-7" />
    </div>
    <h3 className="mt-4 text-base font-semibold">{title}</h3>
    {description && <p className="mt-1.5 max-w-md text-sm text-muted">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const CardGridSkeleton: React.FC<{ count?: number; columns?: string }> = ({ count = 6, columns = 'sm:grid-cols-2 lg:grid-cols-3' }) => (
  <div className={cx('grid grid-cols-1 gap-6', columns)} aria-busy="true" aria-label="Đang tải">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="skeleton aspect-[16/10] rounded-none" />
        <div className="space-y-3 p-5">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3" aria-busy="true" aria-label="Đang tải">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-line bg-white p-4">
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton mt-3 h-3 w-1/3" />
      </div>
    ))}
  </div>
);

export const NotFound: React.FC<{ title?: string; description?: string; back?: { to: PageRoute; label: string } }> = ({
  title = 'Không tìm thấy nội dung',
  description = 'Trang bạn tìm có thể đã bị gỡ hoặc đường dẫn chưa chính xác.',
  back = { to: { view: 'home' } as PageRoute, label: 'Về trang chủ' },
}) => (
  <Container className="py-20">
    <EmptyState
      title={title}
      description={description}
      action={
        <Link to={back.to} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500">
          <CaretLeft className="size-4" />
          {back.label}
        </Link>
      }
    />
  </Container>
);

export const CategoryBadge: React.FC<{ children: React.ReactNode; tone?: 'brand' | 'gold' | 'flame' | 'light'; className?: string }> = ({
  children,
  tone = 'brand',
  className,
}) => (
  <span
    className={cx(
      'inline-flex max-w-full items-center truncate rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
      tone === 'brand' && 'bg-brand-50 text-brand-700',
      tone === 'gold' && 'bg-gold-100 text-gold-700',
      tone === 'flame' && 'bg-flame-50 text-flame-700',
      tone === 'light' && 'bg-white/90 text-brand-700 shadow-sm backdrop-blur',
      className,
    )}
  >
    {children}
  </span>
);

/** Shared look for card containers. */
export const cardClass =
  'group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all duration-500 ease-(--ease-soft) hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover';

export const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-brand-500 hover:shadow-md active:scale-[0.98]';

export const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-all duration-300 hover:border-brand-300 hover:text-brand-600 active:scale-[0.98]';
