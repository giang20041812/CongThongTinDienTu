import React, { useState } from 'react';
import { ArrowRight, CalendarDays, Check, Download, Eye, FileText, Link2, Paperclip, Pin, Printer } from 'lucide-react';
import { Link } from '../lib/router';
import { formatFileSize, formatNumber, postRoute, splitParagraphs, type PostView } from '../lib/content';
import type { AttachmentDto } from '../types';
import { CategoryBadge, Reveal, SmartImage, cardClass, cx, secondaryButton } from './ui';

/** Card for article listings. */
export const PostCard: React.FC<{ post: PostView; index?: number; showCategory?: boolean }> = ({ post, index = 0, showCategory = true }) => (
  <Reveal delay={(index % 3) * 70} className="h-full">
    <Link to={postRoute(post)} className={cx(cardClass, 'h-full')}>
      <div className="relative">
        <SmartImage
          src={post.image}
          alt={post.title}
          width={640}
          className="aspect-[16/10]"
          imgClassName="group-hover:scale-[1.05]"
          placeholderLabel={post.categoryName}
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {showCategory && post.categoryName && <CategoryBadge tone="light">{post.categoryName}</CategoryBadge>}
          {post.pinned && (
            <CategoryBadge tone="gold" className="gap-1">
              <Pin className="size-3" /> Nổi bật
            </CategoryBadge>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-[12.5px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-gold-600" />
            {post.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="size-3.5 text-gold-600" />
            {formatNumber(post.views)}
          </span>
        </div>
        <h3 className="mt-2 line-clamp-3 text-[16px] font-bold leading-snug transition-colors duration-300 group-hover:text-brand-600">
          {post.title}
        </h3>
        {post.summary && <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-body">{post.summary}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13.5px] font-semibold text-brand-600">
          Đọc tiếp
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  </Reveal>
);

/** Renders a post's ordered blocks (paragraphs and figures). */
export const ArticleBody: React.FC<{ post: PostView; emptyText?: string }> = ({ post, emptyText = 'Nội dung đang được cập nhật.' }) => {
  if (post.blocks.length === 0) {
    return post.summary ? <div className="prose-article"><p>{post.summary}</p></div> : <p className="text-muted">{emptyText}</p>;
  }
  return (
    <div className="prose-article">
      {post.blocks.map((block, index) =>
        block.type === 'IMAGE' ? (
          <figure key={index}>
            <SmartImage src={block.imageUrl} alt={post.title} width={1100} className="aspect-[16/9] rounded-xl" />
          </figure>
        ) : (
          splitParagraphs(block.content ?? '').map((paragraph, i) => <p key={`${index}-${i}`}>{paragraph}</p>)
        ),
      )}
    </div>
  );
};

export const AttachmentList: React.FC<{ items: AttachmentDto[]; className?: string }> = ({ items, className }) =>
  items.length === 0 ? null : (
    <section className={cx('rounded-xl border border-line bg-surface p-4 sm:p-5', className)}>
      <h2 className="flex items-center gap-2 text-[14px] font-bold text-ink">
        <Paperclip className="size-4 text-gold-600" />
        Tệp đính kèm ({items.length})
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((file, index) => (
          <li key={file.id ?? index}>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-lg border border-line bg-white p-3 transition-colors hover:border-brand-300"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-flame-50 text-flame-600">
                <FileText className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-ink group-hover:text-brand-600">{file.name}</span>
                {file.sizeBytes ? <span className="text-[12px] text-muted">{formatFileSize(file.sizeBytes)}</span> : null}
              </span>
              <Download className="size-4 shrink-0 text-brand-500" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );

export const ArticleActions: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };
  return (
    <div className="no-print flex flex-wrap gap-2">
      <button onClick={copyLink} className={cx(secondaryButton, 'px-4 py-2 text-[13px]')}>
        {copied ? <Check className="size-4 text-green-600" /> : <Link2 className="size-4" />}
        {copied ? 'Đã sao chép' : 'Sao chép liên kết'}
      </button>
      <button onClick={() => window.print()} className={cx(secondaryButton, 'px-4 py-2 text-[13px]')}>
        <Printer className="size-4" />
        In trang
      </button>
    </div>
  );
};

export const SidebarPostList: React.FC<{ title: string; posts: PostView[] }> = ({ title, posts }) =>
  posts.length === 0 ? null : (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <h2 className="flex items-center gap-2 text-[15px] font-bold">
        <span className="h-4 w-1 rounded-full bg-gold-400" aria-hidden="true" />
        {title}
      </h2>
      <ul className="mt-3 divide-y divide-line">
        {posts.map((post) => (
          <li key={post.id}>
            <Link to={postRoute(post)} className="group flex gap-3 py-3">
              <SmartImage src={post.image} alt={post.title} width={200} className="aspect-square w-16 shrink-0 rounded-lg" imgClassName="group-hover:scale-105" />
              <span className="min-w-0">
                <span className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink transition-colors group-hover:text-brand-600">{post.title}</span>
                <span className="mt-1 block text-[12px] text-muted">{post.date}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

/** Compact row for notices/documents (home page and sidebars). */
export const DocumentRow: React.FC<{ post: PostView }> = ({ post }) => {
  const date = post.issuedDate ?? post.publishedAt;
  const day = date ? String(date.getDate()).padStart(2, '0') : '--';
  const month = date ? `Th${date.getMonth() + 1}` : '';
  return (
    <Link to={postRoute(post)} className="group flex gap-4 p-4 transition-colors duration-300 hover:bg-surface">
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-brand-100 bg-brand-50 py-1.5 transition-colors duration-300 group-hover:border-brand-600 group-hover:bg-brand-600">
        <span className="text-lg font-bold leading-none text-brand-700 transition-colors group-hover:text-white">{day}</span>
        <span className="mt-1 text-[10.5px] font-medium uppercase text-muted transition-colors group-hover:text-white/80">{month}</span>
      </div>
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-brand-600">
          {post.pinned && (
            <span className="mr-1.5 inline-flex -translate-y-px rounded-md bg-flame-500 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase text-white">
              Quan trọng
            </span>
          )}
          {post.title}
        </h3>
        <p className="mt-1.5 truncate text-[12.5px] text-muted">
          {[post.documentNumber && `Số ${post.documentNumber}`, post.issuer ?? post.categoryName].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  );
};
