import type { AttachmentDto, CategoryRef, PageRoute, PostDetailDto, PostSummaryDto } from '../types';

export interface ContentBlock {
  type: 'TEXT' | 'IMAGE';
  content?: string;
  imageUrl?: string;
}

/** A post normalised for display; works for both list summaries and full details. */
export interface PostView {
  id: string;
  slug: string;
  title: string;
  summary: string;
  image?: string;
  category: CategoryRef | null;
  categoryName: string;
  publishedAt: Date | null;
  date: string;
  views: number;
  author: string;
  pinned: boolean;
  documentNumber?: string;
  issuer?: string;
  issuedDate: Date | null;
  recipient?: string;
  actionRequired?: string;
  attachmentCount: number;
  blocks: ContentBlock[];
  attachments: AttachmentDto[];
}

export const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (date: Date | null, options?: Intl.DateTimeFormatOptions) =>
  date ? date.toLocaleDateString('vi-VN', options ?? { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

export const formatTime = (date: Date | null) =>
  date ? date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';

export const formatNumber = (value: number) => value.toLocaleString('vi-VN');

/** Published within the last `days` days – flagged "Mới" on the home page. */
export const isRecent = (date: Date | null, days = 7) => !!date && Date.now() - date.getTime() < days * 86_400_000;

export const formatFileSize = (bytes?: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const toPostView = (raw: PostSummaryDto | PostDetailDto): PostView => {
  const detail = 'blocks' in raw ? raw : null;
  const blocks: ContentBlock[] = (detail?.blocks ?? [])
    .map((b) => ({
      type: String(b?.type ?? 'TEXT').toUpperCase() === 'IMAGE' ? ('IMAGE' as const) : ('TEXT' as const),
      content: b?.content ?? undefined,
      imageUrl: b?.imageUrl ?? undefined,
    }))
    .filter((b) => (b.type === 'TEXT' ? !!b.content?.trim() : !!b.imageUrl));

  const publishedAt = parseDate(raw.publishedAt);
  const firstImage = blocks.find((b) => b.type === 'IMAGE')?.imageUrl;
  const attachments = detail?.attachments ?? [];

  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    summary: raw.summary?.trim() ?? '',
    image: raw.coverUrl || firstImage || undefined,
    category: raw.category,
    categoryName: raw.category?.name ?? '',
    publishedAt,
    date: formatDate(publishedAt),
    views: Number(raw.views ?? 0),
    author: raw.author ?? 'Ban biên tập',
    pinned: !!raw.pinned,
    documentNumber: raw.documentNumber || undefined,
    issuer: raw.issuer || undefined,
    issuedDate: parseDate(raw.issuedDate),
    recipient: detail?.recipient || undefined,
    actionRequired: detail?.actionRequired || undefined,
    attachmentCount: 'attachmentCount' in raw ? raw.attachmentCount : attachments.length,
    blocks,
    attachments,
  };
};

export const postRoute = (post: Pick<PostView, 'slug'>): PageRoute => ({ view: 'post', slug: post.slug });

/** Lower-case, accent-free text so "khai giang" matches "Khai giảng". */
export const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

export const splitParagraphs = (text: string) =>
  text
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/**
 * Serves Cloudinary images resized, in modern formats (WebP/AVIF) and over HTTPS;
 * resizes Unsplash images via their URL params. Other URLs pass through unchanged.
 */
export const optimizeImage = (url: string | undefined, width: number): string | undefined => {
  if (!url) return undefined;
  let result = url.replace(/^http:\/\/res\.cloudinary\.com/, 'https://res.cloudinary.com');
  if (/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(result) && !/\/upload\/[a-z]_[^/]*\//.test(result)) {
    result = result.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
  } else if (result.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(result);
      parsed.searchParams.set('w', String(width));
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('q', '75');
      result = parsed.toString();
    } catch {
      /* keep original */
    }
  }
  return result;
};
