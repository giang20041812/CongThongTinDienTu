import React, { useCallback, useEffect, useMemo, useState } from 'react';
import campusPhoto from '../assets/bannger.jpg';
import { usePostPage } from '../api';
import { Link } from '../lib/router';
import { categoryIcon, MenuLink, useMenu } from '../lib/menu';
import { optimizeImage, postRoute, toPostView, type PostView } from '../lib/content';
import { useReducedMotion } from '../lib/media';
import { telHref, useSite } from '../lib/site';
import { toneAt, toneStyle } from '../lib/tones';
import type { Category, PageRoute } from '../types';
import { ArrowRight, CaretLeft, CaretRight, PhoneCall, Sparkle } from './icons';
import { Container, Eyebrow, cx } from './ui';

interface Slide {
  key: string;
  src: string;
  eyebrow: string;
  title: string;
  caption?: string;
  to?: PageRoute;
}

const SLIDE_MS = 6500;
const MAX_SLIDES = 5;

const toSlide = (post: PostView): Slide => ({
  key: post.id,
  src: optimizeImage(post.image, 1400)!,
  eyebrow: [post.categoryName, post.date].filter(Boolean).join(' · '),
  title: post.title,
  caption: post.summary,
  to: postRoute(post),
});

/**
 * Slides are the pinned ("Ghim / nổi bật") posts that have a cover image; without any, the newest
 * articles with images; on an empty site, one campus photo.
 */
const useSlides = (): Slide[] => {
  const site = useSite();
  const pinned = usePostPage({ pinned: true, size: MAX_SLIDES });
  const pinnedSlides = useMemo(() => pinned.data.items.map(toPostView).filter((p) => p.image).map(toSlide), [pinned.data]);
  const needFallback = !pinned.loading && pinnedSlides.length === 0;
  const latest = usePostPage(needFallback ? { type: ['POST_LIST'], size: MAX_SLIDES } : null);
  return useMemo(() => {
    if (pinnedSlides.length > 0) return pinnedSlides;
    const latestSlides = latest.data.items.map(toPostView).filter((p) => p.image).map(toSlide);
    if (latestSlides.length > 0) return latestSlides;
    return [{ key: 'campus', src: campusPhoto, eyebrow: site.parent_org, title: `Trường ${site.school_name}`, caption: site.slogan }];
  }, [pinnedSlides, latest.data, site]);
};

const arrowClass =
  'absolute top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white hover:bg-white hover:text-brand-700 focus-visible:opacity-100 sm:grid sm:opacity-0 sm:group-hover:opacity-100';

/**
 * Banner sits below the navbar and ticker in a fixed frame
 * (16:9 on phones, 2:1 on tablets, fixed 420px row on desktop next to the quick-access panel),
 * so photos of different resolutions always render at the same size.
 */
const BannerSlider: React.FC<{ className?: string }> = ({ className }) => {
  const SLIDES = useSlides();
  const count = SLIDES.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();
  const autoplay = !reducedMotion && count > 1;

  useEffect(() => setCurrent((i) => (i < count ? i : 0)), [count]);
  const go = useCallback((index: number) => setCurrent((index + count) % count), [count]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setCurrent((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    // Pause while the tab is hidden so the slider doesn't jump when the visitor returns.
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const slide = SLIDES[current] ?? SLIDES[0];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Tin nổi bật"
      className={cx('group relative isolate overflow-hidden rounded-3xl bg-brand-900 shadow-[0_30px_60px_-32px_rgb(4_26_58/0.65)]', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart === null) return;
        const distance = e.changedTouches[0].clientX - touchStart;
        if (distance < -40) next();
        if (distance > 40) prev();
        setTouchStart(null);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
      }}
    >
      {SLIDES.map((item, index) => {
        const active = index === current;
        return (
          <div
            key={item.key}
            aria-hidden={!active}
            className={cx(
              'absolute inset-0 transition-opacity duration-1000 ease-(--ease-soft)',
              active ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <img
              src={item.src}
              alt={item.title}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={cx(
                'h-full w-full object-cover transition-transform ease-linear',
                active ? 'scale-100 duration-[7000ms]' : 'scale-[1.06] duration-1000',
              )}
            />
            {item.to && <Link to={item.to} tabIndex={-1} aria-hidden="true" className="absolute inset-0" />}
          </div>
        );
      })}

      {/* Readability gradients and soft coloured light leaks */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/25 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-950/50 via-transparent to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 size-96 animate-drift rounded-full bg-[radial-gradient(closest-side,rgb(56_189_248/0.4),transparent)] mix-blend-screen" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 -top-28 size-80 animate-drift rounded-full bg-[radial-gradient(closest-side,rgb(248_193_8/0.35),transparent)] mix-blend-screen [animation-delay:-11s]" aria-hidden="true" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-8">
        <div aria-live={paused ? 'polite' : 'off'} className="max-w-xl">
          {/* Re-keyed per slide so its lines rise in one after another. */}
          <div key={slide.key}>
          <span className="inline-flex max-w-full animate-rise items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-gold-200 backdrop-blur-md sm:text-[11px]">
            <span className="relative flex size-1.5 shrink-0" aria-hidden="true">
              <span className="absolute inset-0 animate-ping rounded-full bg-gold-300" />
              <span className="relative size-1.5 rounded-full bg-gold-300" />
            </span>
            <span className="truncate">{slide.eyebrow}</span>
          </span>
          {slide.to ? (
            <Link
              to={slide.to}
              className="mt-2.5 line-clamp-2 animate-rise text-base font-extrabold leading-snug text-white [animation-delay:90ms] [text-shadow:0_2px_18px_rgb(4_26_58/0.55)] hover:text-gold-200 sm:mt-3 sm:text-[1.6rem] lg:text-[1.85rem]"
            >
              {slide.title}
            </Link>
          ) : (
            <p className="mt-2.5 animate-rise text-base font-extrabold leading-snug text-white [animation-delay:90ms] sm:mt-3 sm:text-[1.6rem] lg:text-[1.85rem]">
              {slide.title}
            </p>
          )}
          {slide.caption && <p className="mt-2 hidden animate-rise text-sm leading-relaxed text-white/80 [animation-delay:180ms] sm:line-clamp-2">{slide.caption}</p>}
          {slide.to && (
            <Link
              to={slide.to}
              tabIndex={-1}
              aria-hidden="true"
              className="mt-4 hidden animate-rise items-center gap-2 rounded-full bg-gradient-to-r from-gold-300 to-gold-500 py-1.5 pl-4 pr-1.5 text-[13px] font-bold text-brand-950 shadow-lg shadow-gold-500/30 transition-transform duration-300 [animation-delay:270ms] hover:-translate-y-0.5 sm:inline-flex"
            >
              Xem chi tiết
              <span className="grid size-7 place-items-center rounded-full bg-brand-950/10">
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 sm:mt-5">
          <div className="flex items-center gap-2" role="tablist" aria-label="Chọn tin">
            {SLIDES.map((item, index) => {
              const active = index === current;
              return (
                <button
                  key={item.key}
                  role="tab"
                  aria-selected={active}
                  aria-label={`Tin ${index + 1}: ${item.title}`}
                  onClick={() => go(index)}
                  className={cx(
                    'relative h-1.5 overflow-hidden rounded-full bg-white/30 transition-all duration-500 ease-(--ease-soft) hover:bg-white/60',
                    active ? 'w-12' : 'w-5',
                  )}
                >
                  {active && (
                    <span
                      key={current}
                      className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-gold-300 via-gold-400 to-flame-500"
                      style={{
                        animation: autoplay ? `slide-progress ${SLIDE_MS}ms linear forwards` : undefined,
                        animationPlayState: paused ? 'paused' : 'running',
                        transform: autoplay ? undefined : 'scaleX(1)',
                      }}
                      onAnimationEnd={next}
                    />
                  )}
                </button>
              );
            })}
          </div>
          {count > 1 && (
            <span className="ml-auto text-[12px] font-semibold tabular-nums text-white/60" aria-hidden="true">
              <span className="text-[15px] text-white">{String(current + 1).padStart(2, '0')}</span> / {String(count).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {count > 1 && (
        <button onClick={prev} aria-label="Ảnh trước" className={cx(arrowClass, 'left-3')}>
          <CaretLeft className="size-5" />
        </button>
      )}
      {count > 1 && (
        <button onClick={next} aria-label="Ảnh tiếp theo" className={cx(arrowClass, 'right-3')}>
          <CaretRight className="size-5" />
        </button>
      )}
    </section>
  );
};

/** Preferred shortcuts (by slug); any that were renamed or hidden are replaced by other entries. */
const QUICK_SLUGS = ['thoi-khoa-bieu', 'thong-bao', 'tuyen-sinh-lop-10', 'tai-lieu-hoc-tap', 'cau-lac-bo', 'gop-y-phan-hoi'];
const QUICK_COUNT = 6;

const useQuickLinks = (): { category: Category; hint: string }[] => {
  const { categories, bySlug, byId } = useMenu();
  const picked = QUICK_SLUGS.map((slug) => bySlug.get(slug)).filter((c): c is Category => !!c);
  const fillers = categories.filter((c) => c.parentId && c.pageType !== 'PAGE' && !picked.includes(c));
  return [...picked, ...fillers].slice(0, QUICK_COUNT).map((category) => ({
    category,
    hint: (category.parentId && byId.get(category.parentId)?.name) || '',
  }));
};

const QuickAccess: React.FC<{ className?: string }> = ({ className }) => {
  const links = useQuickLinks();
  const site = useSite();
  return (
    <aside className={cx('relative flex flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card', className)} aria-label="Truy cập nhanh">
      <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-[radial-gradient(closest-side,rgb(248_193_8/0.2),transparent)]" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <Eyebrow>Truy cập nhanh</Eyebrow>
          <h2 className="mt-1 text-lg font-bold">Thông tin & tiện ích</h2>
        </div>
        <span className="grid size-10 shrink-0 animate-float place-items-center rounded-2xl bg-gradient-to-br from-gold-300 to-orange-500 text-white shadow-lg shadow-gold-500/30" aria-hidden="true">
          <Sparkle className="size-5" />
        </span>
      </div>
      <ul className="relative grid flex-1 auto-rows-fr grid-cols-3 gap-2 px-4 sm:grid-cols-6 lg:grid-cols-2 lg:px-5">
        {links.map(({ category, hint }, index) => {
          const Icon = categoryIcon(category);
          return (
            <li key={category.id} style={toneStyle(toneAt(index))}>
              <MenuLink
                category={category}
                className="group flex h-full flex-col items-center gap-2 rounded-2xl border border-transparent p-2.5 text-center transition-all duration-300 ease-(--ease-soft) hover:-translate-y-0.5 hover:border-(--tone)/20 hover:bg-(--tone)/5 lg:flex-row lg:items-center lg:gap-3 lg:text-left"
              >
                <span className="tone-glow grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-(--tone) to-(--tone-2) text-white transition-transform duration-300 ease-(--ease-soft) group-hover:-rotate-6 group-hover:scale-110">
                  <Icon className="size-[22px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-balance text-[12.5px] font-semibold leading-tight text-ink transition-colors group-hover:text-(--tone-ink) lg:text-[13.5px]">{category.name}</span>
                  {hint && <span className="mt-0.5 hidden truncate text-[11.5px] text-muted lg:block">{hint}</span>}
                </span>
              </MenuLink>
            </li>
          );
        })}
      </ul>
      {site.hotline && (
        <a
          href={telHref(site.hotline)}
          className="group relative m-4 mt-3 flex animate-gradient-pan items-center gap-3 overflow-hidden rounded-2xl bg-[linear-gradient(110deg,#07306a,#0a4aa0,#4338ca,#0a4aa0,#07306a)] bg-[length:200%_100%] p-4 text-white shadow-lg shadow-brand-900/25 lg:m-5 lg:mt-3"
        >
          <span className="absolute inset-0 bg-dots opacity-50" aria-hidden="true" />
          <span className="absolute -right-6 -top-8 size-24 rounded-full bg-gold-400/30 blur-xl" aria-hidden="true" />
          <span className="relative grid size-11 shrink-0 place-items-center" aria-hidden="true">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-gold-400" />
            <span className="relative grid size-11 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-brand-950 shadow-md">
              <PhoneCall className="size-5 animate-ring" />
            </span>
          </span>
          <span className="relative leading-tight">
            <span className="block text-[11px] font-medium uppercase tracking-wider text-white/70">Hỗ trợ tuyển sinh & học vụ</span>
            <span className="mt-0.5 block text-lg font-bold">{site.hotline}</span>
          </span>
          <ArrowRight className="relative ml-auto size-4 text-gold-300 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      )}
    </aside>
  );
};

export const HeroSection: React.FC = () => (
  <section className="relative isolate pt-5 sm:pt-7">
    <div className="pointer-events-none absolute -top-10 right-0 -z-10 h-80 w-2/3 bg-[radial-gradient(60%_60%_at_80%_20%,rgb(56_189_248/0.12),transparent),radial-gradient(50%_60%_at_30%_40%,rgb(167_139_250/0.1),transparent)]" aria-hidden="true" />
    <Container className="grid gap-5 lg:h-[420px] lg:grid-cols-12">
      <BannerSlider className="aspect-[16/9] sm:aspect-[2/1] lg:col-span-8 lg:aspect-auto lg:h-full" />
      <QuickAccess className="lg:col-span-4 lg:h-full" />
    </Container>
  </section>
);
