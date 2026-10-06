import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowSquareOut, CalendarDots, MagnifyingGlass, Paperclip } from '../components/icons';
import { usePost, usePostPage } from '../api';
import { Link } from '../lib/router';
import { categoryIcon, categoryRoute, MenuLink, PAGE_TYPE_LABELS, useMenu } from '../lib/menu';
import { formatDate, postRoute, toPostView } from '../lib/content';
import { usePageTitle } from '../lib/site';
import type { Category } from '../types';
import { ArticleActions, ArticleBody, AttachmentList, PostCard } from '../components/PostParts';
import {
  CardGridSkeleton,
  Container,
  EmptyState,
  ListSkeleton,
  NotFound,
  Pagination,
  Reveal,
  SmartImage,
  StatPill,
  cardClass,
  cx,
  primaryButton,
  type Crumb,
} from '../components/ui';
import { SectionHeader, type SectionProps } from '../components/SectionHeader';
import { SchedulePage } from './SchedulePage';
import { ContactPage, FeedbackPage, MapPage } from './InfoPages';

/** Resolves /{slug} against the menu and renders the entry according to its page type. */
export const CategoryPage: React.FC<{ slug: string }> = ({ slug }) => {
  const { bySlug, byId, categories, loading } = useMenu();
  const category = bySlug.get(slug);
  usePageTitle(category?.name ?? (loading ? null : 'Không tìm thấy trang'));

  if (loading && !category) {
    return (
      <Container className="py-12">
        <ListSkeleton rows={4} />
      </Container>
    );
  }
  if (!category) return <NotFound title="Không tìm thấy trang" description="Mục này có thể đã được đổi tên, ẩn hoặc gỡ khỏi menu." />;

  const parent = category.parentId ? byId.get(category.parentId) : undefined;
  const sortByOrder = (a: Category, b: Category) => a.sortOrder - b.sortOrder;
  const section = parent
    ? categories.filter((c) => c.parentId === parent.id).sort(sortByOrder)
    : categories.filter((c) => c.parentId === category.id).sort(sortByOrder);
  const crumbs: Crumb[] = parent ? [{ label: parent.name, to: categoryRoute(parent) }, { label: category.name }] : [{ label: category.name }];
  const props: SectionProps = { category, parent, section, crumbs };

  switch (category.pageType) {
    case 'GROUP':
      return <GroupPage {...props} />;
    case 'PAGE':
      return <StaticPage {...props} />;
    case 'DOCUMENT_LIST':
      return <DocumentListPage {...props} />;
    case 'SCHEDULE':
      return <SchedulePage {...props} />;
    case 'CONTACT':
      return <ContactPage {...props} />;
    case 'MAP':
      return <MapPage {...props} />;
    case 'FEEDBACK':
      return <FeedbackPage {...props} />;
    case 'LINK':
      return <LinkPage {...props} />;
    case 'POST_LIST':
    default:
      return <PostListPage {...props} />;
  }
};

const useDebounced = <T,>(value: T, delay = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const SearchField: React.FC<{ value: string; onChange: (value: string) => void; placeholder: string }> = ({ value, onChange, placeholder }) => (
  <div className="relative w-full sm:w-80">
    <MagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="h-11 w-full rounded-full border border-line bg-white pl-11 pr-4 text-sm text-ink outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
    />
  </div>
);

/** Server-paged, searchable listing of one entry's posts. */
const usePagedPosts = (slug: string, size: number) => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const q = useDebounced(query);
  useEffect(() => setPage(1), [q, slug]);
  const resource = usePostPage({ category: slug, q, page: page - 1, size });
  const posts = useMemo(() => resource.data.items.map(toPostView), [resource.data]);
  return { ...resource, posts, page, setPage, query, setQuery, searching: !!q };
};

const PostListPage: React.FC<SectionProps> = (props) => {
  const { posts, data, loading, page, setPage, query, setQuery, searching } = usePagedPosts(props.category.slug, 9);
  return (
    <>
      <SectionHeader {...props} aside={data.total > 0 ? <StatPill label="Bài viết" value={String(data.total)} /> : undefined} />
      <Container className="py-10 sm:py-12">
        <div className="mb-8 flex justify-end">
          <SearchField value={query} onChange={setQuery} placeholder={`Tìm trong ${props.category.name.toLowerCase()}...`} />
        </div>
        {loading ? (
          <CardGridSkeleton />
        ) : posts.length === 0 ? (
          <EmptyState
            title={searching ? 'Không tìm thấy bài viết phù hợp' : 'Chưa có bài viết'}
            description={searching ? 'Hãy thử thay đổi từ khóa tìm kiếm.' : 'Nội dung của mục này sẽ sớm được cập nhật.'}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} showCategory={false} />
            ))}
          </div>
        )}
        <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
      </Container>
    </>
  );
};

const DocumentListPage: React.FC<SectionProps> = (props) => {
  const { posts, data, loading, page, setPage, query, setQuery, searching } = usePagedPosts(props.category.slug, 15);
  return (
    <>
      <SectionHeader {...props} aside={data.total > 0 ? <StatPill label="Văn bản" value={String(data.total)} /> : undefined} />
      <Container className="py-10 sm:py-12">
        <div className="mb-6 flex justify-end">
          <SearchField value={query} onChange={setQuery} placeholder="Tìm số hiệu, trích yếu..." />
        </div>
        {loading ? (
          <ListSkeleton rows={6} />
        ) : posts.length === 0 ? (
          <EmptyState
            title={searching ? 'Không có văn bản phù hợp' : 'Chưa có văn bản'}
            description={searching ? 'Hãy thử đổi từ khóa.' : 'Văn bản sẽ được cập nhật tại đây.'}
          />
        ) : (
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
              <div className="hidden grid-cols-12 gap-4 border-b border-line bg-surface px-6 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted md:grid">
                <div className="col-span-2">Ngày ban hành</div>
                <div className="col-span-7">Trích yếu nội dung</div>
                <div className="col-span-3">Đơn vị ban hành</div>
              </div>
              <ul className="divide-y divide-line">
                {posts.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={postRoute(item)}
                      className="group grid gap-2 px-5 py-4 transition-colors duration-300 hover:bg-brand-50/50 md:grid-cols-12 md:items-center md:gap-4 md:px-6"
                    >
                      <div className="flex items-center gap-2 md:col-span-2 md:flex-col md:items-start md:gap-1">
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700">
                          <CalendarDots className="size-3.5 text-gold-600" />
                          {formatDate(item.issuedDate ?? item.publishedAt)}
                        </span>
                        {item.documentNumber && <span className="text-[12px] text-muted">Số: {item.documentNumber}</span>}
                      </div>
                      <div className="md:col-span-7">
                        <h3 className="text-[14.5px] font-semibold leading-snug text-ink transition-colors group-hover:text-brand-600">
                          {item.pinned && (
                            <span className="mr-2 inline-flex -translate-y-px rounded-md bg-flame-500 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase text-white">
                              Quan trọng
                            </span>
                          )}
                          {item.title}
                        </h3>
                        {item.summary && <p className="mt-1 line-clamp-1 text-[13px] text-muted">{item.summary}</p>}
                      </div>
                      <div className="flex items-center justify-between gap-3 md:col-span-3">
                        <span className="truncate text-[13px] text-body">{item.issuer ?? '—'}</span>
                        <span className="inline-flex shrink-0 items-center gap-2 text-muted">
                          {item.attachmentCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[12px]" title="Có tệp đính kèm">
                              <Paperclip className="size-3.5" />
                              {item.attachmentCount}
                            </span>
                          )}
                          <ArrowRight className="size-4 text-brand-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-600" />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}
        <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
      </Container>
    </>
  );
};

/** A single content page: shows the newest (or pinned) post filed under the entry. */
const StaticPage: React.FC<SectionProps> = (props) => {
  const list = usePostPage({ category: props.category.slug, size: 1 });
  const first = list.data.items[0];
  const detail = usePost(first?.slug ?? null);
  const post = detail.data ? toPostView(detail.data) : null;
  const loading = list.loading || (!!first && detail.loading);

  return (
    <>
      <SectionHeader {...props} />
      <Container className="py-10 sm:py-12">
        <article className="mx-auto max-w-4xl animate-fade-up rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8 lg:p-10">
          {loading ? (
            <ListSkeleton rows={4} />
          ) : !post ? (
            <p className="py-10 text-center text-muted">Nội dung đang được cập nhật.</p>
          ) : (
            <>
              {post.title.trim().toLowerCase() !== props.category.name.trim().toLowerCase() && (
                <h2 className="mb-6 text-[1.5rem] font-bold leading-tight sm:text-[1.9rem]">{post.title}</h2>
              )}
              {post.image && <SmartImage src={post.image} alt={post.title} width={1200} priority className="mb-7 aspect-[16/9] rounded-xl" />}
              <ArticleBody post={post} />
              <AttachmentList items={post.attachments} className="mt-8" />
              <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] text-muted">Cập nhật: {post.date}</p>
                <ArticleActions />
              </div>
            </>
          )}
        </article>
      </Container>
    </>
  );
};

/** Top-level heading: its entries as cards plus the newest posts from all of them. */
const GroupPage: React.FC<SectionProps> = (props) => {
  const { category, section } = props;
  // Static pages (Giới thiệu chung...) are reached through the cards, not listed as news.
  const latest = usePostPage({ category: category.slug, type: ['POST_LIST', 'DOCUMENT_LIST'], size: 6 });
  const posts = useMemo(() => latest.data.items.map(toPostView), [latest.data]);

  return (
    <>
      <SectionHeader {...props} />
      <Container className="py-10 sm:py-12">
        {section.length === 0 ? (
          <EmptyState title="Mục này chưa có nội dung" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.map((child, index) => {
              const Icon = categoryIcon(child);
              return (
                <Reveal key={child.id} delay={(index % 3) * 60} className="h-full">
                  <MenuLink category={child} className={cx(cardClass, 'h-full flex-row items-start gap-4 p-5')}>
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-[15.5px] font-bold text-ink transition-colors group-hover:text-brand-600">
                        {child.name}
                        {child.pageType === 'LINK' && <ArrowSquareOut className="size-3.5 text-muted" />}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-[13px] text-muted">{child.description || PAGE_TYPE_LABELS[child.pageType]}</span>
                    </span>
                  </MenuLink>
                </Reveal>
              );
            })}
          </div>
        )}

        {posts.length > 0 && (
          <section className="mt-12">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <span className="h-5 w-1 rounded-full bg-gold-400" aria-hidden="true" />
              Mới cập nhật
            </h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
};

const LinkPage: React.FC<SectionProps> = (props) => (
  <>
    <SectionHeader {...props} />
    <Container className="py-16">
      <EmptyState
        title={props.category.externalUrl ? 'Mục này mở ở một trang khác' : 'Liên kết đang được cập nhật'}
        description={props.category.externalUrl ?? undefined}
        action={
          props.category.externalUrl ? (
            <a href={props.category.externalUrl} target="_blank" rel="noopener noreferrer" className={primaryButton}>
              <ArrowSquareOut className="size-4" />
              Mở liên kết
            </a>
          ) : undefined
        }
      />
    </Container>
  </>
);
