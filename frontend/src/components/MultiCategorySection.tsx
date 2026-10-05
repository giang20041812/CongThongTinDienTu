import React, { useMemo } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { usePostPage } from '../api';
import { Link } from '../lib/router';
import { categoryRoute, iconFor, useMenu } from '../lib/menu';
import { postRoute, toPostView } from '../lib/content';
import type { Category } from '../types';
import { Container, Reveal, SectionHeading, SmartImage } from './ui';

const MAX_COLUMNS = 8;

/** One home-page column: the 3 newest posts of a menu entry. */
const CategoryColumn: React.FC<{ category: Category; index: number }> = ({ category, index }) => {
  const { data, loading } = usePostPage({ category: category.slug, size: 3 });
  const [featured, ...rest] = useMemo(() => data.items.map(toPostView), [data]);
  const Icon = iconFor(category.pageType);

  return (
    <Reveal delay={(index % 4) * 80} className="h-full">
      <article className="group/col flex h-full flex-col rounded-2xl border border-line bg-white p-4 shadow-card transition-all duration-500 ease-(--ease-soft) hover:border-brand-200 hover:shadow-card-hover sm:p-5">
        <header className="flex items-center gap-3 border-b border-line pb-3">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-300 group-hover/col:bg-brand-600 group-hover/col:text-white">
            <Icon className="size-[18px]" />
          </span>
          <h3 className="text-[13.5px] font-bold uppercase tracking-wide text-brand-700">{category.name}</h3>
          <span className="ml-auto h-[3px] w-6 rounded-full bg-gold-400 transition-all duration-500 group-hover/col:w-10" aria-hidden="true" />
        </header>

        {loading ? (
          <div className="skeleton mt-4 aspect-[16/10] rounded-xl" />
        ) : featured ? (
          <Link to={postRoute(featured)} className="group mt-4 block">
            <SmartImage
              src={featured.image}
              alt={featured.title}
              width={520}
              className="aspect-[16/10] rounded-xl"
              imgClassName="group-hover:scale-105"
              placeholderLabel={category.name}
            />
            <h4 className="mt-3 line-clamp-3 text-[14px] font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-brand-600">
              {featured.title}
            </h4>
            {featured.date && <p className="mt-1 text-[12px] text-muted">{featured.date}</p>}
          </Link>
        ) : (
          <div className="mt-4 grid flex-1 place-items-center rounded-xl border border-dashed border-brand-100 bg-surface/60 p-6 text-center text-[13px] text-muted">
            Nội dung đang được cập nhật
          </div>
        )}

        {rest.length > 0 && (
          <ul className="mt-3 divide-y divide-line">
            {rest.map((item) => (
              <li key={item.id}>
                <Link to={postRoute(item)} className="group flex items-start gap-2 py-2.5 text-[13px] leading-snug text-body transition-colors hover:text-brand-600">
                  <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-gold-500 transition-transform group-hover:translate-x-0.5" />
                  <span className="line-clamp-2">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link
          to={categoryRoute(category)}
          className="mt-auto inline-flex items-center gap-1.5 self-end pt-3 text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-500"
        >
          Xem thêm
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/col:translate-x-0.5" />
        </Link>
      </article>
    </Reveal>
  );
};

/** Entries flagged "Hiện trên trang chủ" in the admin, in menu order. */
export const MultiCategorySection: React.FC = () => {
  const { tree } = useMenu();
  const featured = useMemo(
    () => tree.flatMap((root) => [root, ...root.children]).filter((c) => c.showOnHome && c.pageType !== 'LINK').slice(0, MAX_COLUMNS),
    [tree],
  );
  if (featured.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Khám phá" title="Chuyên mục nổi bật" />
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((category, index) => (
            <CategoryColumn key={category.id} category={category} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
};
