import React, { useCallback, useEffect, useState } from 'react';
import banner1 from '../assets/bannger.jpg';
import banner2 from '../assets/banner2.jpg';
import banner3 from '../assets/banner3.png';
import { categoryIcon, MenuLink, useMenu } from '../lib/menu';
import { useReducedMotion } from '../lib/media';
import { telHref, useSite } from '../lib/site';
import { toneAt, toneStyle } from '../lib/tones';
import type { Category } from '../types';
import { ArrowRight, CaretLeft, CaretRight, PhoneCall, Sparkle } from './icons';
import { Container, Eyebrow, cx } from './ui';

/** Fixed banner artwork shipped with the site (src/assets) – not news posts. */
const BANNERS = [banner1, banner2, banner3];
const SLIDE_MS = 6500;

const arrowClass =
  'absolute top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white hover:bg-white hover:text-brand-700 focus-visible:opacity-100 sm:grid sm:opacity-0 sm:group-hover:opacity-100';

/**
 * Banner sits below the navbar and ticker in a fixed frame
 * (16:9 on phones, 2:1 on tablets, fixed 420px row on desktop next to the quick-access panel),
 * so images of different resolutions always render at the same size.
 */
const BannerSlider: React.FC<{ className?: string }> = ({ className }) => {
  const site = useSite();
  const count = BANNERS.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();
  const autoplay = !reducedMotion && count > 1;

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
      aria-label={`Ảnh Trường ${site.school_name}`}
      className={cx('group relative isolate overflow-hidden rounded-3xl bg-brand-900 shadow-card', className)}
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
      {BANNERS.map((src, index) => {
        const active = index === current;
        return (
          <img
            key={src}
            src={src}
            alt={`Trường ${site.school_name} – ảnh ${index + 1}`}
            aria-hidden={!active}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className={cx(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-(--ease-soft)',
              active ? 'opacity-100' : 'opacity-0',
            )}
          />
        );
      })}

      {/* Light scrim so the controls stay visible on bright images */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-950/55 to-transparent" aria-hidden="true" />

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-5 sm:p-6">
        <div className="flex items-center gap-2" role="tablist" aria-label="Chọn ảnh">
          {BANNERS.map((src, index) => {
            const active = index === current;
            return (
              <button
                key={src}
                role="tab"
                aria-selected={active}
                aria-label={`Ảnh ${index + 1}`}
                onClick={() => go(index)}
                className={cx(
                  'relative h-1.5 overflow-hidden rounded-full bg-white/40 transition-all duration-500 ease-(--ease-soft) hover:bg-white/70',
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
        <span className="ml-auto text-[12px] font-semibold tabular-nums text-white/70" aria-hidden="true">
          <span className="text-[15px] text-white">{String(current + 1).padStart(2, '0')}</span> / {String(count).padStart(2, '0')}
        </span>
      </div>

      <button onClick={prev} aria-label="Ảnh trước" className={cx(arrowClass, 'left-3')}>
        <CaretLeft className="size-5" />
      </button>
      <button onClick={next} aria-label="Ảnh tiếp theo" className={cx(arrowClass, 'right-3')}>
        <CaretRight className="size-5" />
      </button>
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
      <div className="relative flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <Eyebrow>Truy cập nhanh</Eyebrow>
          <h2 className="mt-1 text-lg font-bold">Thông tin & tiện ích</h2>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gold-100 text-gold-600" aria-hidden="true">
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
          className="group relative m-4 mt-3 flex items-center gap-3 overflow-hidden rounded-2xl bg-brand-700 p-4 text-white transition-colors hover:bg-brand-600 lg:m-5 lg:mt-3"
        >
          <span className="absolute inset-0 bg-dots opacity-50" aria-hidden="true" />
          <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-gold-400 text-brand-950" aria-hidden="true">
            <PhoneCall className="size-5 animate-ring" />
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
