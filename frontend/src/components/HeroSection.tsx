import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import campusPhoto from '../assets/bannger.jpg';
import { usePostPage } from '../api';
import { Link } from '../lib/router';
import { iconFor, MenuLink, useMenu } from '../lib/menu';
import { optimizeImage, postRoute, toPostView, type PostView } from '../lib/content';
import { telHref, useSite } from '../lib/site';
import type { Category, PageRoute } from '../types';
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

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

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
  const autoplay = !prefersReducedMotion() && count > 1;

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

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Tin nổi bật"
      className={cx('group relative overflow-hidden rounded-2xl bg-brand-900 shadow-card', className)}
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
      {SLIDES.map((slide, index) => {
        const active = index === current;
        return (
          <div
            key={slide.key}
            aria-hidden={!active}
            className={cx(
              'absolute inset-0 transition-opacity duration-1000 ease-(--ease-soft)',
              active ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <img
              src={slide.src}
              alt={slide.title}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={cx(
                'h-full w-full object-cover transition-transform ease-linear',
                active ? 'scale-100 duration-[7000ms]' : 'scale-[1.06] duration-1000',
              )}
            />
            {slide.to && <Link to={slide.to} tabIndex={-1} aria-hidden="true" className="absolute inset-0" />}
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/20 to-transparent" aria-hidden="true" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.key}
            aria-live={index === current ? 'polite' : undefined}
            className={cx(
              'max-w-xl transition-all duration-700 ease-(--ease-soft)',
              index === current ? 'relative translate-y-0 opacity-100' : 'pointer-events-none absolute bottom-5 translate-y-3 opacity-0 sm:bottom-7',
            )}
          >
            <Eyebrow tone="light">{slide.eyebrow}</Eyebrow>
            {slide.to ? (
              <Link to={slide.to} tabIndex={index === current ? 0 : -1} className="mt-2 line-clamp-2 text-base font-bold leading-snug text-white hover:text-gold-200 sm:text-2xl">
                {slide.title}
              </Link>
            ) : (
              <p className="mt-2 text-base font-bold leading-snug text-white sm:text-2xl">{slide.title}</p>
            )}
            {slide.caption && <p className="mt-1 hidden text-sm text-white/80 sm:line-clamp-2">{slide.caption}</p>}
          </div>
        ))}

        <div className="mt-4 flex items-center gap-2" role="tablist" aria-label="Chọn tin">
          {SLIDES.map((slide, index) => {
            const active = index === current;
            return (
              <button
                key={slide.key}
                role="tab"
                aria-selected={active}
                aria-label={`Tin ${index + 1}: ${slide.title}`}
                onClick={() => go(index)}
                className={cx(
                  'relative h-1.5 overflow-hidden rounded-full bg-white/35 transition-all duration-500 ease-(--ease-soft) hover:bg-white/60',
                  active ? 'w-12' : 'w-5',
                )}
              >
                {active && (
                  <span
                    key={current}
                    className="absolute inset-0 origin-left rounded-full bg-gold-400"
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
      </div>

      {count > 1 && <button
        onClick={prev}
        aria-label="Ảnh trước"
        className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-brand-700 shadow-lg backdrop-blur transition-all duration-300 hover:bg-white sm:grid sm:size-11 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
      >
        <ChevronLeft className="size-5" />
      </button>}
      {count > 1 && <button
        onClick={next}
        aria-label="Ảnh tiếp theo"
        className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-brand-700 shadow-lg backdrop-blur transition-all duration-300 hover:bg-white sm:grid sm:size-11 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
      >
        <ChevronRight className="size-5" />
      </button>}
    </section>
  );
};

/** Preferred shortcuts (by slug); any that were renamed or hidden are replaced by other entries. */
const QUICK_SLUGS = ['thoi-khoa-bieu', 'thong-bao', 'tuyen-sinh-lop-10', 'tai-lieu-hoc-tap', 'cau-lac-bo', 'gop-y-phan-hoi'];
const QUICK_COUNT = 6;
const TONES = ['bg-brand-50 text-brand-600', 'bg-gold-100 text-gold-700', 'bg-flame-50 text-flame-600'];

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
    <aside className={cx('flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card', className)} aria-label="Truy cập nhanh">
      <div className="px-5 pb-3 pt-5">
        <Eyebrow>Truy cập nhanh</Eyebrow>
        <h2 className="mt-1 text-lg font-bold">Thông tin & tiện ích</h2>
      </div>
      <ul className="grid flex-1 auto-rows-fr grid-cols-3 gap-2 px-4 sm:grid-cols-6 lg:grid-cols-2 lg:px-5">
        {links.map(({ category, hint }, index) => {
          const Icon = iconFor(category.pageType);
          return (
            <li key={category.id}>
              <MenuLink
                category={category}
                className="group flex h-full flex-col items-center gap-2 rounded-xl border border-transparent p-2.5 text-center transition-all duration-300 ease-(--ease-soft) hover:border-brand-100 hover:bg-brand-50/60 lg:flex-row lg:items-center lg:gap-3 lg:text-left"
              >
                <span className={cx('grid size-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110', TONES[index % TONES.length])}>
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-semibold leading-tight text-ink transition-colors group-hover:text-brand-600 lg:text-[13.5px]">{category.name}</span>
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
          className="group relative m-4 mt-3 flex items-center gap-3 overflow-hidden rounded-xl bg-brand-700 p-4 text-white transition-colors hover:bg-brand-600 lg:m-5 lg:mt-3"
        >
          <span className="absolute inset-0 bg-dots opacity-50" aria-hidden="true" />
          <span className="absolute -right-6 -top-8 size-24 rounded-full bg-gold-400/25 blur-xl" aria-hidden="true" />
          <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-gold-400 text-brand-900 transition-transform duration-300 group-hover:rotate-12">
            <Phone className="size-[18px]" />
          </span>
          <span className="relative leading-tight">
            <span className="block text-[11px] font-medium uppercase tracking-wider text-white/70">Hỗ trợ tuyển sinh & học vụ</span>
            <span className="mt-0.5 block text-lg font-bold">{site.hotline}</span>
          </span>
        </a>
      )}
    </aside>
  );
};

export const HeroSection: React.FC = () => (
  <section className="pt-5 sm:pt-7">
    <Container className="grid gap-5 lg:h-[420px] lg:grid-cols-12">
      <BannerSlider className="aspect-[16/9] sm:aspect-[2/1] lg:col-span-8 lg:aspect-auto lg:h-full" />
      <QuickAccess className="lg:col-span-4 lg:h-full" />
    </Container>
  </section>
);
