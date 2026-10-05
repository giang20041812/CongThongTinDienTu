import React, { useMemo } from 'react';
import { ArrowRight, CalendarDays, Eye } from 'lucide-react';
import { usePostPage } from '../api';
import { Link } from '../lib/router';
import { categoryRoute, useMenu } from '../lib/menu';
import { formatNumber, postRoute, toPostView, type PostView } from '../lib/content';
import { DocumentRow } from './PostParts';
import { CategoryBadge, Container, EmptyState, ListSkeleton, Reveal, SectionHeading, SmartImage, cardClass, cx } from './ui';

const FeaturedNewsCard: React.FC<{ post: PostView }> = ({ post }) => (
  <Link to={postRoute(post)} className={cx(cardClass, 'h-full')}>
    <div className="relative">
      <SmartImage
        src={post.image}
        alt={post.title}
        width={900}
        priority
        className="aspect-[16/10]"
        imgClassName="group-hover:scale-[1.04]"
        placeholderLabel={post.categoryName}
      />
      <div className="absolute left-4 top-4">
        <CategoryBadge tone="light">{post.categoryName}</CategoryBadge>
      </div>
    </div>
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <div className="flex items-center gap-4 text-[12.5px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5 text-gold-600" />
          {post.date}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Eye className="size-3.5 text-gold-600" />
          {formatNumber(post.views)} lượt xem
        </span>
      </div>
      <h3 className="mt-2.5 line-clamp-3 text-lg font-bold leading-snug transition-colors duration-300 group-hover:text-brand-600 sm:text-xl">
        {post.title}
      </h3>
      {post.summary && <p className="mt-2.5 line-clamp-3 text-[14.5px] leading-relaxed text-body">{post.summary}</p>}
      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-brand-600">
        Đọc tiếp
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </div>
  </Link>
);

const CompactNewsCard: React.FC<{ post: PostView }> = ({ post }) => (
  <Link
    to={postRoute(post)}
    className="group flex gap-4 rounded-2xl border border-line bg-white p-3 shadow-card transition-all duration-500 ease-(--ease-soft) hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
  >
    <SmartImage src={post.image} alt={post.title} width={300} className="aspect-[4/3] w-28 shrink-0 rounded-xl sm:w-32" imgClassName="group-hover:scale-105" />
    <div className="flex min-w-0 flex-col py-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-gold-600">{post.categoryName}</span>
      <h3 className="mt-1 line-clamp-3 text-[14px] font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-brand-600">
        {post.title}
      </h3>
      <span className="mt-auto pt-1.5 text-[12px] text-muted">{post.date}</span>
    </div>
  </Link>
);

/** Optional "see all" targets; if an admin renames or hides these entries the links simply disappear. */
const NEWS_SLUG = 'tin-tuc-su-kien';
const NOTICES_SLUG = 'thong-bao';

/** Home: newest articles (all article lists) beside the newest notices/documents (all document lists). */
export const NewsAndAnnouncementsSection: React.FC = () => {
  const { bySlug } = useMenu();
  const newsPage = usePostPage({ type: ['POST_LIST'], size: 5 });
  const docsPage = usePostPage({ type: ['DOCUMENT_LIST'], size: 5 });
  const news = useMemo(() => newsPage.data.items.map(toPostView), [newsPage.data]);
  const docs = useMemo(() => docsPage.data.items.map(toPostView), [docsPage.data]);
  const newsEntry = bySlug.get(NEWS_SLUG);
  const noticesEntry = bySlug.get(NOTICES_SLUG);

  return (
    <section className="py-12 sm:py-16">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-8">
          <SectionHeading
            eyebrow="Bản tin nhà trường"
            title="Tin tức – Sự kiện"
            action={newsEntry ? { to: categoryRoute(newsEntry), label: 'Xem tất cả' } : undefined}
          />
          {newsPage.loading ? (
            <div className="grid gap-5 md:grid-cols-5">
              <div className="skeleton aspect-[4/3] md:col-span-3" />
              <div className="md:col-span-2">
                <ListSkeleton rows={4} />
              </div>
            </div>
          ) : news.length === 0 ? (
            <EmptyState title="Chưa có bài viết" description="Tin tức mới sẽ được cập nhật tại đây." />
          ) : (
            <div className="grid gap-5 md:grid-cols-5">
              <div className="md:col-span-3">
                <FeaturedNewsCard post={news[0]} />
              </div>
              <div className="flex flex-col gap-3 md:col-span-2">
                {news.slice(1).map((post) => (
                  <CompactNewsCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
        </Reveal>

        <Reveal className="lg:col-span-4" delay={120}>
          <SectionHeading tone="flame" eyebrow="Văn bản điều hành" title="Thông báo – Văn bản" />
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            {docsPage.loading ? (
              <div className="p-4">
                <ListSkeleton rows={4} />
              </div>
            ) : docs.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted">Chưa có thông báo mới.</p>
            ) : (
              <div className="divide-y divide-line">
                {docs.map((item) => (
                  <DocumentRow key={item.id} post={item} />
                ))}
              </div>
            )}
            {noticesEntry && (
              <Link
                to={categoryRoute(noticesEntry)}
                className="group flex items-center justify-center gap-2 border-t border-line bg-surface/70 p-3.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
              >
                Xem tất cả thông báo
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
};
