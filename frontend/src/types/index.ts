/** How a menu entry is rendered (mirrors the backend PageType enum). */
export type PageType = 'GROUP' | 'PAGE' | 'POST_LIST' | 'DOCUMENT_LIST' | 'SCHEDULE' | 'CONTACT' | 'MAP' | 'FEEDBACK' | 'LINK';

/** A menu entry. Top-level entries have parentId = null; the menu has two levels. */
export interface Category {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  pageType: PageType;
  sortOrder: number;
  visible: boolean;
  showOnHome: boolean;
  externalUrl?: string | null;
  description?: string | null;
}

export interface MenuNode extends Category {
  children: Category[];
}

export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
  pageType: PageType;
}

export interface PostSummaryDto {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  coverUrl: string | null;
  status: string;
  pinned: boolean;
  views: number;
  publishedAt: string | null;
  category: CategoryRef | null;
  author: string | null;
  documentNumber: string | null;
  issuer: string | null;
  issuedDate: string | null;
  attachmentCount: number;
}

export interface BlockDto {
  type: 'TEXT' | 'IMAGE';
  content?: string | null;
  imageUrl?: string | null;
}

export interface AttachmentDto {
  id?: string;
  name: string;
  url: string;
  sizeBytes?: number | null;
  mimeType?: string | null;
}

export interface PostDetailDto extends Omit<PostSummaryDto, 'attachmentCount'> {
  updatedAt: string | null;
  recipient: string | null;
  actionRequired: string | null;
  blocks: BlockDto[];
  attachments: AttachmentDto[];
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface FeedbackDto {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  content: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  note: string | null;
  createdAt: string;
}

/** Lesson slot; times come from the API as "HH:mm" or "HH:mm:ss". */
export interface TimetablePeriod {
  period: number;
  startTime: string;
  endTime: string;
}

/** dayOfWeek uses Vietnamese numbering: 2 = Thứ Hai … 7 = Thứ Bảy, 8 = Chủ nhật. */
export interface TimetableEntry {
  className: string;
  grade: number;
  dayOfWeek: number;
  period: number;
  subject: string;
  teacher: string | null;
}

export interface Timetable {
  periods: TimetablePeriod[];
  entries: TimetableEntry[];
}

export type PageRoute =
  | { view: 'home' }
  | { view: 'category'; slug: string }
  | { view: 'post'; slug: string };
