import React, { useMemo } from 'react';
import { usePostPage } from '../api';
import { Link } from '../lib/router';
import { categoryIcon, categoryRoute, useMenu } from '../lib/menu';
import { formatNumber, postRoute, toPostView } from '../lib/content';
import { useIsDesktop } from '../lib/media';
import { toneAt, toneStyle, type Tone } from '../lib/tones';
import type { Category } from '../types';
import { Coverflow } from './Coverflow';
import { ArrowRight, CalendarDots, CaretRight, Compass } from './icons';
import { Container, Reveal, SectionHeading, SmartImage, trackPointer } from './ui';

const MAX_COLUMNS = 8;

/** One home-page card: the 3 newest posts of a menu entry, in the entry's tone. */
const CategoryCard: React.FC<{ category: Category; tone: Tone }> = ({ category, tone }) => {
  const { data, loading } = usePostPage({ category: category.slug, size: 3 });
  const [featured, ...rest] = useMemo(() => data.items.map(toPostView), [data]);
  const Icon = categoryIcon(category);

  return (
    <article
      style={toneStyle(tone)}
      onPointerMove={trackPointer}
      className="spotlight tilt group/col relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white p-4 shadow-card transition-all duration-500 ease-(--ease-soft) hover:-translate-y-1 hover:border-(--tone)/30 hover:shadow-card-hover sm:p-5"
    >
      <span className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-(--tone) to-(--tone-2)" aria-hidden="true" />
      <header className="flex items-center gap-3 pt-1">
        <span className="tone-glow grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-(--tone) to-(--tone-2) text-white transition-transform duration-500 ease-(--ease-soft) group-hover/col:-rotate-6 group-hover/col:scale-110">
          <Icon className="size-[22px]" />
        </span>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-[13.5px] font-bold uppercase leading-tight tracking-wide text-ink">{category.name}</h3>
          <p className="mt-1 text-[12px] font-semibold text-(--tone-ink)">
            {loading ? 'Đang tải…' : `${formatNumber(data.total)} bài viết`}
          </p>
        </div>
      </header>

      {loading ? (
        <div className="skeleton mt-4 aspect-[16/10] rounded-2xl" />
      ) : featured ? (
        <Link to={postRoute(featured)} draggable={false} className="group mt-4 block">
          <SmartImage
            src={featured.image}
            alt={featured.title}
            width={560}
            className="shine aspect-[16/10] rounded-2xl"
            imgClassName="group-hover:scale-105"
            placeholderLabel={category.name}
          />
          <h4 className="mt-3 line-clamp-3 text-[14px] font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-(--tone-ink)">
            {featured.title}
          </h4>
          {featured.date && (
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] text-muted">
              <CalendarDots className="size-3.5 text-(--tone)" />
              {featured.date}
            </p>
          )}
        </Link>
      ) : (
        <div className="mt-4 grid flex-1 place-items-center rounded-2xl border border-dashed border-(--tone)/30 bg-(--tone)/5 p-6 text-center text-[13px] text-muted">
          Nội dung đang được cập nhật
        </div>
      )}

      {rest.length > 0 && (
        <ul className="mt-3 divide-y divide-line">
          {rest.map((item) => (
            <li key={item.id}>
              <Link
                to={postRoute(item)}
                draggable={false}
                className="group flex items-start gap-2 py-2.5 text-[13px] leading-snug text-body transition-colors hover:text-(--tone-ink)"
              >
                <CaretRight className="mt-0.5 size-3.5 shrink-0 text-(--tone) transition-transform group-hover:translate-x-0.5" />
                <span className="line-clamp-2">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        to={categoryRoute(category)}
        draggable={false}
        className="group mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-(--tone)/10 py-2 pl-4 pr-3 text-[13px] font-semibold text-(--tone-ink) transition-all duration-300 hover:bg-(--tone) hover:text-white"
      >
        Xem thêm
        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
};

/** Entries flagged "Hiện trên trang chủ" in the admin, in menu order. */
export const MultiCategorySection: React.FC = () => {
  const { tree } = useMenu();
  const desktop = useIsDesktop();
  const featured = useMemo(
    () => tree.flatMap((root) => [root, ...root.children]).filter((c) => c.showOnHome && c.pageType !== 'LINK').slice(0, MAX_COLUMNS),
    [tree],
  );
  if (featured.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden py-14 sm:py-20">
      {/* Colour wash, dot grid and slowly floating shapes */}
      <div className="bg-aurora absolute inset-0 -z-10" aria-hidden="true" />
      <div className="bg-dots-brand absolute inset-0 -z-10 [mask-image:linear-gradient(180deg,transparent,#000_30%,#000_70%,transparent)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-10 hidden sm:block" aria-hidden="true">
        <span className="absolute left-[2%] top-[42%] size-16 animate-float rounded-2xl border-4 border-sky-300/50 [rotate:12deg]" />
        <span className="absolute right-[8%] top-24 size-10 animate-float rounded-full bg-gold-300/60 [animation-delay:-2s]" />
        <span className="absolute bottom-20 left-[12%] size-6 animate-float rounded-full bg-violet-400/50 [animation-delay:-4s]" />
        <span className="absolute -right-24 bottom-[-6rem] size-72 animate-orbit rounded-full border-2 border-dashed border-flame-300/40" />
      </div>

      <Container>
        <Reveal>
          <SectionHeading
            icon={Compass}
            eyebrow="Khám phá"
            title="Chuyên mục nổi bật"
            description="Hoạt động, thành tích và thông tin mới nhất theo từng lĩnh vực của nhà trường."
          />
        </Reveal>
        {desktop ? (
          <div className="grid grid-cols-4 gap-5">
            {featured.map((category, index) => (
              <Reveal key={category.id} delay={(index % 4) * 90} className="h-full">
                <CategoryCard category={category} tone={toneAt(index)} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <Coverflow
              items={featured}
              itemKey={(category) => category.id}
              itemLabel={(category) => category.name}
              itemTone={(_, index) => toneAt(index)}
              renderItem={(category, index) => <CategoryCard category={category} tone={toneAt(index)} />}
              label="Chuyên mục nổi bật"
              interval={6000}
            />
          </Reveal>
        )}
      </Container>
    </section>
  );
};
