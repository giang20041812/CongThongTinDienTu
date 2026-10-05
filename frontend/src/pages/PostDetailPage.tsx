import React, { useEffect, useMemo } from 'react';
import { ArrowRight, CalendarDays, Eye, UserRound } from 'lucide-react';
import { registerPostView, usePost, usePostPage } from '../api';
import { categoryRoute, useMenu } from '../lib/menu';
import { formatDate, formatNumber, toPostView, type PostView } from '../lib/content';
import { usePageTitle, useSite } from '../lib/site';
import { Link } from '../lib/router';
import { ArticleActions, ArticleBody, AttachmentList, DocumentRow, PostCard, SidebarPostList } from '../components/PostParts';
import { CategoryBadge, Container, DetailBar, ListSkeleton, NotFound, SmartImage, cx, primaryButton, type Crumb } from '../components/ui';

/** /bai-viet/{slug}. Documents (posts in a DOCUMENT_LIST entry) get the official-letter layout. */
export const PostDetailPage: React.FC<{ slug: string }> = ({ slug }) => {
  const { data, loading } = usePost(slug);
  const { byId } = useMenu();
  const post = useMemo(() => (data ? toPostView(data) : null), [data]);
  const others = usePostPage(post?.category ? { category: post.category.slug, size: 6 } : null);
  const otherPosts = useMemo(
    () => others.data.items.filter((p) => p.slug !== slug).slice(0, 5).map(toPostView),
    [others.data, slug],
  );

  usePageTitle(post?.title ?? (loading ? null : 'Không tìm thấy bài viết'));
  useEffect(() => {
    if (post) registerPostView(post.id);
  }, [post?.id]);

  if (loading) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton aspect-[16/9] w-full" />
        </div>
      </Container>
    );
  }
  if (!post) return <NotFound title="Bài viết không tồn tại" description="Bài viết có thể đã bị gỡ hoặc chưa được xuất bản." />;

  const category = post.category ? byId.get(post.category.id) : undefined;
  const parent = category?.parentId ? byId.get(category.parentId) : undefined;
  const crumbs: Crumb[] = [
    ...(parent ? [{ label: parent.name, to: categoryRoute(parent) }] : []),
    ...(post.category ? [{ label: post.category.name, to: categoryRoute(post.category) }] : []),
  ];
  const isDocument = post.category?.pageType === 'DOCUMENT_LIST';

  return (
    <>
      <DetailBar crumbs={crumbs} />
      <Container className="grid gap-8 py-10 lg:grid-cols-12 lg:py-12">
        <article className="animate-fade-up lg:col-span-8">
          {isDocument ? <DocumentBody post={post} /> : <ArticleView post={post} />}
          {!isDocument && otherPosts.length > 0 && (
            <section className="mt-10">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <span className="h-5 w-1 rounded-full bg-gold-400" aria-hidden="true" />
                Cùng chuyên mục
              </h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {otherPosts.slice(0, 3).map((item, index) => (
                  <PostCard key={item.id} post={item} index={index} showCategory={false} />
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-20">
            {isDocument ? (
              otherPosts.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                  <h2 className="flex items-center gap-2 border-b border-line px-5 py-4 text-[15px] font-bold">
                    <span className="h-4 w-1 rounded-full bg-flame-500" aria-hidden="true" />
                    Văn bản khác
                  </h2>
                  <div className="divide-y divide-line">
                    {otherPosts.map((other) => (
                      <DocumentRow key={other.id} post={other} />
                    ))}
                  </div>
                </div>
              )
            ) : (
              <SidebarPostList title="Bài viết khác" posts={otherPosts} />
            )}
            {post.category && (
              <Link to={categoryRoute(post.category)} className={cx(primaryButton, 'w-full')}>
                Xem tất cả: {post.category.name}
                <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </aside>
      </Container>
    </>
  );
};

const ArticleView: React.FC<{ post: PostView }> = ({ post }) => {
  const site = useSite();
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8 lg:p-10">
      {post.categoryName && <CategoryBadge>{post.categoryName}</CategoryBadge>}
      <h1 className="mt-4 text-[1.6rem] font-bold leading-tight sm:text-[2.1rem]">{post.title}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line pb-5 text-[13px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4 text-gold-600" />
          {post.publishedAt?.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <UserRound className="size-4 text-gold-600" />
          {post.author}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Eye className="size-4 text-gold-600" />
          {formatNumber(post.views)} lượt xem
        </span>
      </div>
      {post.image && <SmartImage src={post.image} alt={post.title} width={1200} priority className="mt-6 aspect-[16/9] rounded-xl" />}
      <div className="mt-7">
        <ArticleBody post={post} />
      </div>
      <AttachmentList items={post.attachments} className="mt-8" />
      <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-muted">
          Nguồn: <span className="font-semibold text-ink">Trường {site.school_name}</span>
        </p>
        <ArticleActions />
      </div>
    </div>
  );
};

/** Official-letter layout for notices and documents. */
const DocumentBody: React.FC<{ post: PostView }> = ({ post }) => {
  const site = useSite();
  const issued = post.issuedDate ?? post.publishedAt;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="brand-stripe h-1" aria-hidden="true" />
      <div className="p-6 sm:p-10">
        <div className="grid gap-6 text-center sm:grid-cols-2">
          <div>
            <p className="text-[12px] font-semibold uppercase text-body">{site.parent_org}</p>
            <p className="mt-0.5 text-[13px] font-bold uppercase text-brand-700">Trường {site.school_name}</p>
            <span className="mx-auto mt-1.5 block h-px w-20 bg-ink/40" aria-hidden="true" />
            {post.documentNumber && <p className="mt-2 text-[12.5px] text-body">Số: {post.documentNumber}</p>}
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase text-ink">Cộng hòa xã hội chủ nghĩa Việt Nam</p>
            <p className="mt-0.5 text-[13px] font-semibold text-ink">Độc lập – Tự do – Hạnh phúc</p>
            <span className="mx-auto mt-1.5 block h-px w-36 bg-ink/40" aria-hidden="true" />
            {issued && (
              <p className="mt-2 text-[12.5px] italic text-body">
                Ngày {issued.getDate()} tháng {issued.getMonth() + 1} năm {issued.getFullYear()}
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 text-center">
          {post.categoryName && <p className="text-[13px] font-bold uppercase tracking-[0.3em] text-flame-600">{post.categoryName}</p>}
          <h1 className="mx-auto mt-3 max-w-2xl text-xl font-bold leading-snug sm:text-[1.65rem]">{post.title}</h1>
          {post.pinned && (
            <span className="mt-4 inline-flex rounded-full bg-flame-50 px-3 py-1 text-[12px] font-semibold text-flame-700 ring-1 ring-flame-200">
              Văn bản quan trọng
            </span>
          )}
        </div>

        {(post.issuer || post.recipient || post.actionRequired) && (
          <dl className="mt-8 grid gap-3 rounded-xl border border-brand-100 bg-brand-50/60 p-5 text-[14px] sm:grid-cols-2">
            {post.issuer && (
              <div>
                <dt className="text-[12px] font-medium uppercase tracking-wide text-muted">Đơn vị ban hành</dt>
                <dd className="mt-0.5 font-semibold text-brand-700">{post.issuer}</dd>
              </div>
            )}
            {post.recipient && (
              <div>
                <dt className="text-[12px] font-medium uppercase tracking-wide text-muted">Đối tượng thực hiện</dt>
                <dd className="mt-0.5 font-semibold text-ink">{post.recipient}</dd>
              </div>
            )}
            {post.actionRequired && (
              <div className="sm:col-span-2">
                <dt className="text-[12px] font-medium uppercase tracking-wide text-muted">Yêu cầu thực hiện</dt>
                <dd className="mt-0.5 text-ink">{post.actionRequired}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="mt-8">
          <ArticleBody post={post} emptyText="Xem nội dung chi tiết trong tệp đính kèm." />
        </div>
        <AttachmentList items={post.attachments} className="mt-8" />

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-muted">Đăng ngày {formatDate(post.publishedAt)}</p>
          <ArticleActions />
        </div>
      </div>
    </div>
  );
};
