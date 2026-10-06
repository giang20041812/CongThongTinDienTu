import React, { useMemo } from 'react';
import { usePostPage } from '../api';
import { Link } from '../lib/router';
import { categoryRoute, useMenu } from '../lib/menu';
import { formatNumber, isRecent, postRoute, toPostView, type PostView } from '../lib/content';
import { useIsDesktop } from '../lib/media';
import { toneAt, toneFor, toneStyle } from '../lib/tones';
import { Coverflow } from './Coverflow';
import { ArrowRight, CalendarDots, Eye, MegaphoneSimple, Newspaper, Sparkle } from './icons';
import { DocumentRow } from './PostParts';
import { Container, EmptyState, ListSkeleton, Reveal, SectionHeading, SmartImage, cx, trackPointer } from './ui';

/** Category of a post on a white chip, with a dot in the category's tone. */
const TopicChip: React.FC<{ post: PostView }> = ({ post }) => (
  <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-(--tone-ink) shadow-sm backdrop-blur">
    <span className="size-1.5 shrink-0 rounded-full bg-gradient-to-br from-(--tone) to-(--tone-2)" aria-hidden="true" />
    <span className="truncate">{post.categoryName}</span>
  </span>
);

const NewFlag: React.FC = () => (
  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-flame-500 to-orange-500 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-md shadow-flame-600/30">
    <Sparkle className="size-3 animate-twinkle" />
    Mới
  </span>
);

/** Chips over the top of a cover image. */
const CoverBadges: React.FC<{ post: PostView; className?: string }> = ({ post, className }) => (
  <div className={cx('absolute flex items-start justify-between gap-2', className)}>
    {post.categoryName ? <TopicChip post={post} /> : <span />}
    {isRecent(post.publishedAt) && <NewFlag />}
  </div>
);

const PostMeta: React.FC<{ post: PostView }> = ({ post }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted">
    <span className="inline-flex items-center gap-1.5">
      <CalendarDots className="size-4 text-(--tone)" />
      {post.date}
    </span>
    <span className="inline-flex items-center gap-1.5">
      <Eye className="size-4 text-(--tone)" />
      {formatNumber(post.views)} lượt xem
    </span>
  </div>
);

const ReadMore: React.FC<{ className?: string }> = ({ className }) => (
  <span className={cx('mt-auto inline-flex items-center gap-2 self-start pt-4 text-sm font-semibold text-(--tone-ink)', className)}>
    Đọc tiếp
    <span className="tone-glow grid size-7 place-items-center rounded-full bg-gradient-to-br from-(--tone) to-(--tone-2) text-white transition-transform duration-300 group-hover:translate-x-1">
      <ArrowRight className="size-3.5" />
    </span>
  </span>
);

const FeaturedNewsCard: React.FC<{ post: PostView }> = ({ post }) => (
  <Link
    to={postRoute(post)}
    style={toneStyle(toneFor(post.category?.id))}
    onPointerMove={trackPointer}
    className="spotlight tilt group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card transition-all duration-500 ease-(--ease-soft) hover:-translate-y-1 hover:border-(--tone)/30 hover:shadow-card-hover"
  >
    <div className="relative">
      <SmartImage
        src={post.image}
        alt={post.title}
        width={900}
        priority
        className="shine aspect-[16/10]"
        imgClassName="group-hover:scale-[1.05]"
        placeholderLabel={post.categoryName}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/40 via-transparent to-transparent" aria-hidden="true" />
      <CoverBadges post={post} className="inset-x-4 top-4" />
    </div>
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <PostMeta post={post} />
      <h3 className="mt-3 line-clamp-3 text-xl font-bold leading-snug transition-colors duration-300 group-hover:text-(--tone-ink)">
        {post.title}
      </h3>
      {post.summary && <p className="mt-2.5 line-clamp-3 text-[14.5px] leading-relaxed text-body">{post.summary}</p>}
      <ReadMore className="pt-5" />
    </div>
  </Link>
);

const CompactNewsCard: React.FC<{ post: PostView }> = ({ post }) => (
  <Link
    to={postRoute(post)}
    style={toneStyle(toneFor(post.category?.id))}
    onPointerMove={trackPointer}
    className="spotlight group relative flex gap-4 overflow-hidden rounded-2xl border border-line bg-white p-3 shadow-card transition-all duration-500 ease-(--ease-soft) hover:-translate-y-0.5 hover:border-(--tone)/30 hover:shadow-card-hover"
  >
    <span
      className="absolute inset-y-3 left-0 w-1 scale-y-0 rounded-r-full bg-gradient-to-b from-(--tone) to-(--tone-2) transition-transform duration-500 ease-(--ease-soft) group-hover:scale-y-100"
      aria-hidden="true"
    />
    <SmartImage src={post.image} alt={post.title} width={300} className="shine aspect-[4/3] w-28 shrink-0 rounded-xl sm:w-32" imgClassName="group-hover:scale-105" />
    <div className="flex min-w-0 flex-col py-0.5">
      <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-(--tone-ink)">
        <span className="size-1.5 shrink-0 rounded-full bg-(--tone)" aria-hidden="true" />
        <span className="truncate">{post.categoryName}</span>
      </span>
      <h3 className="mt-1 line-clamp-3 text-[14px] font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-(--tone-ink)">
        {post.title}
      </h3>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-1.5 text-[12px] text-muted">
        <CalendarDots className="size-3.5 text-(--tone)" />
        {post.date}
        {isRecent(post.publishedAt) && <span className="ml-1 rounded-full bg-flame-50 px-1.5 text-[10.5px] font-bold uppercase text-flame-600">Mới</span>}
      </span>
    </div>
  </Link>
);

/** Card of the mobile/tablet carousel. */
const NewsSlide: React.FC<{ post: PostView }> = ({ post }) => (
  <Link
    to={postRoute(post)}
    style={toneStyle(toneFor(post.category?.id))}
    draggable={false}
    className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_50px_-22px_rgb(4_26_58/0.45)] ring-1 ring-brand-900/5"
  >
    <div className="relative">
      <SmartImage src={post.image} alt={post.title} width={720} className="aspect-[16/10]" placeholderLabel={post.categoryName} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/45 via-transparent to-transparent" aria-hidden="true" />
      <CoverBadges post={post} className="inset-x-3 top-3" />
    </div>
    <span className="h-1 bg-gradient-to-r from-(--tone) to-(--tone-2)" aria-hidden="true" />
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <PostMeta post={post} />
      <h3 className="mt-2 line-clamp-3 text-[16px] font-bold leading-snug text-ink">{post.title}</h3>
      {post.summary && <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-body">{post.summary}</p>}
      <ReadMore />
    </div>
  </Link>
);

/** Optional "see all" targets; if an admin renames or hides these entries the links simply disappear. */
const NEWS_SLUG = 'tin-tuc-su-kien';
const NOTICES_SLUG = 'thong-bao';

/** Home: newest articles (all article lists) beside the newest notices/documents (all document lists). */
export const NewsAndAnnouncementsSection: React.FC = () => {
  const { bySlug } = useMenu();
  const desktop = useIsDesktop();
  const newsPage = usePostPage({ type: ['POST_LIST'], size: 5 });
  const docsPage = usePostPage({ type: ['DOCUMENT_LIST'], size: 5 });
  const news = useMemo(() => newsPage.data.items.map(toPostView), [newsPage.data]);
  const docs = useMemo(() => docsPage.data.items.map(toPostView), [docsPage.data]);
  const newsEntry = bySlug.get(NEWS_SLUG);
  const noticesEntry = bySlug.get(NOTICES_SLUG);

  return (
    <section className="relative isolate overflow-hidden py-12 sm:py-16">
      {/* Drifting colour washes behind the section */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -left-48 top-0 size-[32rem] animate-drift rounded-full bg-[radial-gradient(closest-side,rgb(56_189_248/0.16),transparent)]" />
        <div className="absolute -right-40 top-1/3 size-[30rem] animate-drift rounded-full bg-[radial-gradient(closest-side,rgb(167_139_250/0.16),transparent)] [animation-delay:-8s]" />
        <div className="absolute bottom-0 left-1/3 size-[26rem] animate-drift rounded-full bg-[radial-gradient(closest-side,rgb(251_191_36/0.12),transparent)] [animation-delay:-15s]" />
      </div>

      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <Reveal className="min-w-0 lg:col-span-8">
          <SectionHeading
            icon={Newspaper}
            eyebrow="Bản tin nhà trường"
            title="Tin tức – Sự kiện"
            action={newsEntry ? { to: categoryRoute(newsEntry), label: 'Xem tất cả' } : undefined}
          />
          {newsPage.loading ? (
            desktop ? (
              <div className="grid gap-5 md:grid-cols-5">
                <div className="skeleton aspect-[4/3] md:col-span-3" />
                <div className="md:col-span-2">
                  <ListSkeleton rows={4} />
                </div>
              </div>
            ) : (
              <div className="skeleton mx-auto aspect-[4/5] w-[72%] max-w-sm rounded-3xl sm:w-[52%] md:w-[42%]" />
            )
          ) : news.length === 0 ? (
            <EmptyState title="Chưa có bài viết" description="Tin tức mới sẽ được cập nhật tại đây." />
          ) : desktop ? (
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
          ) : (
            <Coverflow
              items={news}
              itemKey={(post) => post.id}
              itemLabel={(post) => post.title}
              itemTone={(post) => toneFor(post.category?.id)}
              renderItem={(post) => <NewsSlide post={post} />}
              label="Tin tức mới"
            />
          )}
        </Reveal>

        <Reveal className="min-w-0 lg:col-span-4" delay={120}>
          <SectionHeading tone="flame" icon={MegaphoneSimple} eyebrow="Văn bản điều hành" title="Thông báo – Văn bản" />
          <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
            <div className="h-1 bg-gradient-to-r from-flame-500 via-gold-400 to-brand-500" aria-hidden="true" />
            {docsPage.loading ? (
              <div className="p-4">
                <ListSkeleton rows={4} />
              </div>
            ) : docs.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted">Chưa có thông báo mới.</p>
            ) : (
              <div className="divide-y divide-line">
                {docs.map((item, index) => (
                  <DocumentRow key={item.id} post={item} tone={toneAt(index + 4)} />
                ))}
              </div>
            )}
            {noticesEntry && (
              <Link
                to={categoryRoute(noticesEntry)}
                className="group flex items-center justify-center gap-2 border-t border-line bg-gradient-to-r from-flame-50 via-gold-50 to-brand-50 p-3.5 text-sm font-semibold text-flame-600 transition-colors hover:text-flame-700"
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
