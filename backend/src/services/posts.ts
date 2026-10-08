import type { ContentCache } from '../cache.js';
import { type Db, pool, query, queryOne, transaction } from '../db.js';
import { HttpError, badRequest, bool, enumValue, jsonArray, jsonObject, localDate, localDateTime, long, str, uuid } from '../http.js';
import type { AuthUser } from '../security.js';
import { blankToNull, excerpt, isBlank, localNow, searchable, slugOf, trim } from '../text.js';
import type { CategoryService, PageType } from './categories.js';

const MAX_PAGE_SIZE = 50;
const MAX_PHOTOS = 24;
/** The home gallery shows a few photos of each event rather than one album filling it. */
const PHOTOS_PER_POST = 2;
/** Rows scanned to pick the gallery from (duplicates and extra photos per post are skipped). */
const PHOTO_SCAN = 400;

export const PUBLISHED = 'PUBLISHED';

/**
 * Canonical publication states (PUBLISHED / DRAFT / HIDDEN). The admin UI once sent Vietnamese labels
 * ("Đã đăng", "Bản nháp"), so every write goes through this.
 */
export function normalizeStatus(raw: string | null | undefined): string {
  if (raw == null || isBlank(raw)) return PUBLISHED;
  const value = trim(raw);
  switch (value.toLowerCase()) {
    case 'published':
    case 'đã đăng':
    case 'da dang':
      return PUBLISHED;
    case 'draft':
    case 'bản nháp':
    case 'ban nhap':
      return 'DRAFT';
    case 'hidden':
    case 'ẩn':
    case 'an':
      return 'HIDDEN';
    default:
      return value.toUpperCase();
  }
}

export interface PostQuery {
  /** Category slug; a GROUP (or descendants=true) also covers its children. */
  category: string | null;
  descendants: boolean;
  /** Only posts in categories of these page types. */
  types: PageType[];
  /** Accent-insensitive search terms. */
  q: string | null;
  /** Admin-only status filter (visitors always get PUBLISHED). */
  status: string | null;
  /** Only pinned (true) or unpinned (false) posts. */
  pinned: boolean | null;
  page: number;
  size: number;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

interface CategoryRef {
  id: string;
  name: string;
  slug: string;
  pageType: PageType;
}

/** List item: no blocks, so a page of results stays small. */
export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  coverUrl: string | null;
  status: string;
  pinned: boolean;
  views: number;
  publishedAt: string;
  category: CategoryRef;
  author: string | null;
  documentNumber: string | null;
  issuer: string | null;
  issuedDate: string | null;
  attachmentCount: number;
}

interface Block {
  type: string;
  content: string | null;
  imageUrl: string | null;
}

interface Attachment {
  id?: string;
  name: string;
  url: string;
  sizeBytes: number | null;
  mimeType: string | null;
}

export interface PostDetail extends Omit<PostSummary, 'attachmentCount'> {
  updatedAt: string | null;
  recipient: string | null;
  actionRequired: string | null;
  blocks: Block[];
  attachments: Attachment[];
}

export interface PhotoItem {
  url: string;
  title: string;
  slug: string;
}

// JSON shapes: same fields, in the same order, as the DTOs of the Java API.
const CATEGORY_REF = `json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'pageType', c.page_type)`;

const SUMMARY_COLUMNS = `p.id, p.title, p.slug, p.summary, p.cover_url AS "coverUrl", p.status, p.pinned, p.views,
  p.published_at AS "publishedAt", ${CATEGORY_REF} AS category, u.username AS author,
  p.document_number AS "documentNumber", p.issuer, p.issued_date AS "issuedDate",
  (SELECT count(*) FROM post_attachments a WHERE a.post_id = p.id)::int AS "attachmentCount"`;

/** A whole post – blocks and attachments included – in one query. */
const SELECT_DETAIL = `SELECT p.id, p.title, p.slug, p.summary, p.cover_url AS "coverUrl", p.status, p.pinned, p.views,
  p.published_at AS "publishedAt", p.updated_at AS "updatedAt", ${CATEGORY_REF} AS category, u.username AS author,
  p.document_number AS "documentNumber", p.issuer, p.issued_date AS "issuedDate", p.recipient,
  p.action_required AS "actionRequired",
  COALESCE((SELECT json_agg(json_build_object('type', b.type, 'content', b.content, 'imageUrl', b.image_url)
            ORDER BY b.order_index) FROM post_blocks b WHERE b.post_id = p.id), '[]'::json) AS blocks,
  COALESCE((SELECT json_agg(json_build_object('id', a.id, 'name', a.name, 'url', a.url, 'sizeBytes', a.size_bytes,
            'mimeType', a.mime_type) ORDER BY a.sort_order) FROM post_attachments a WHERE a.post_id = p.id), '[]'::json) AS attachments
  FROM posts p JOIN categories c ON c.id = p.category_id LEFT JOIN users u ON u.id = p.author_id`;

// ---------------------------------------------------------------------------
// Request body (POST/PUT /api/posts). On update, null or missing fields are left unchanged.
// ---------------------------------------------------------------------------

const BLOCK_TYPES = ['TEXT', 'IMAGE'] as const;

interface PostRequest {
  title: string | null;
  slug: string | null;
  categoryId: string | null;
  summary: string | null;
  coverUrl: string | null;
  status: string | null;
  pinned: boolean | null;
  publishedAt: string | null;
  documentNumber: string | null;
  issuer: string | null;
  issuedDate: string | null;
  recipient: string | null;
  actionRequired: string | null;
  blocks: Block[] | null;
  attachments: Attachment[] | null;
}

/** Accepts "text", "Text", "TEXT"...; a missing type is a text block. */
function blockType(value: unknown): string {
  const text = str(value);
  if (text == null || isBlank(text)) return 'TEXT';
  return enumValue(trim(text).toUpperCase(), BLOCK_TYPES)!;
}

function readRequest(body: unknown): PostRequest {
  const b = jsonObject(body);
  return {
    title: str(b.title),
    slug: str(b.slug),
    categoryId: uuid(b.categoryId),
    summary: str(b.summary),
    coverUrl: str(b.coverUrl),
    status: str(b.status),
    pinned: bool(b.pinned),
    publishedAt: localDateTime(b.publishedAt),
    documentNumber: str(b.documentNumber),
    issuer: str(b.issuer),
    issuedDate: localDate(b.issuedDate),
    recipient: str(b.recipient),
    actionRequired: str(b.actionRequired),
    blocks: b.blocks == null ? null : readBlocks(jsonArray(b.blocks)),
    attachments: b.attachments == null ? null : readAttachments(jsonArray(b.attachments)),
  };
}

/** Empty blocks (no text, no image) are dropped; the rest keep their order. Text is stored as typed. */
function readBlocks(list: unknown[]): Block[] {
  const blocks: Block[] = [];
  for (const raw of list) {
    if (raw == null) continue;
    const source = jsonObject(raw);
    const type = blockType(source.type);
    const content = str(source.content);
    const imageUrl = blankToNull(str(source.imageUrl));
    if ((content == null || isBlank(content)) && imageUrl == null) continue;
    blocks.push({ type, content, imageUrl });
  }
  return blocks;
}

/** Entries without a URL are dropped; a nameless file is called "Tệp đính kèm N". */
function readAttachments(list: unknown[]): Attachment[] {
  const attachments: Attachment[] = [];
  for (const raw of list) {
    if (raw == null) continue;
    const source = jsonObject(raw);
    const url = blankToNull(str(source.url));
    if (url == null) continue;
    attachments.push({
      url,
      name: blankToNull(str(source.name)) ?? `Tệp đính kèm ${attachments.length + 1}`,
      sizeBytes: long(source.sizeBytes),
      mimeType: blankToNull(str(source.mimeType)),
    });
  }
  return attachments;
}

function checkAttachmentUrls(attachments: Attachment[] | null) {
  if (attachments?.some((a) => !a.url.startsWith('https://') && !a.url.startsWith('http://'))) {
    throw badRequest('Đường dẫn tệp đính kèm phải bắt đầu bằng http:// hoặc https://.');
  }
}

function requireText(value: string | null, field: string): string {
  if (value == null || isBlank(value)) throw badRequest(`${field} không được để trống.`);
  return trim(value);
}

/** The summary derived from the first text block when the editor left it empty. */
function summaryFrom(blocks: Block[]): string | null {
  const first = blocks.find((b) => b.type === 'TEXT' && b.content != null && !isBlank(b.content));
  return first ? excerpt(first.content!) : null;
}

/** An optional text field on update: null = unchanged, blank = cleared. */
const changed = (value: string | null, current: string | null) => (value != null ? blankToNull(value) : current);

const pageOf = <T>(items: T[], page: number, size: number, total: number): PageResponse<T> => ({
  items,
  page,
  size,
  total,
  totalPages: Math.ceil(total / size),
});

export class PostService {
  constructor(
    private readonly categories: CategoryService,
    private readonly cache: ContentCache,
  ) {}

  /** Paged summaries. Visitors only get published posts in visible entries, pinned first then newest. */
  list(q: PostQuery, admin: boolean): Promise<PageResponse<PostSummary>> {
    if (admin) return this.search(q, true);
    return this.cache.get(`posts:${JSON.stringify(q)}`, () => this.search(q, false));
  }

  /** A published post whose menu entry is visible (what visitors may open). */
  findPublishedBySlug(slug: string): Promise<PostDetail | null> {
    return this.cache.get(`post:${slug}`, async () => {
      const post = await queryOne<PostDetail>(`${SELECT_DETAIL} WHERE p.slug = $1`, [slug]);
      if (!post || post.status !== PUBLISHED) return null;
      const visible = await this.categories.listPublic();
      return visible.some((c) => c.id === post.category.id) ? post : null;
    });
  }

  async findAnyBySlug(slug: string): Promise<PostDetail | null> {
    return (await queryOne<PostDetail>(`${SELECT_DETAIL} WHERE p.slug = $1`, [slug])) ?? null;
  }

  async findAny(id: string, db: Db = pool): Promise<PostDetail | null> {
    return (await queryOne<PostDetail>(`${SELECT_DETAIL} WHERE p.id = $1`, [id], db)) ?? null;
  }

  /** Newest photos (covers and body images) of published posts in visible entries, for the home gallery. */
  recentPhotos(limit: number): Promise<PhotoItem[]> {
    const size = Math.min(Math.max(limit, 1), MAX_PHOTOS);
    return this.cache.get(`photos:${size}`, async () => {
      const visible = (await this.categories.listPublic()).map((c) => c.id);
      if (visible.length === 0) return [];
      // Covers and body images of the matching posts, newest post first, each post's photos in reading order.
      const rows = await query<PhotoItem>(
        `SELECT x.url, x.title, x.slug FROM (
           SELECT p.cover_url AS url, p.title, p.slug, p.published_at, p.created_at, -1 AS ord
           FROM posts p
           WHERE p.cover_url IS NOT NULL AND p.status = $1 AND p.category_id = ANY($2::uuid[])
           UNION ALL
           SELECT b.image_url, p.title, p.slug, p.published_at, p.created_at, b.order_index
           FROM post_blocks b JOIN posts p ON p.id = b.post_id
           WHERE b.type = 'IMAGE' AND b.image_url IS NOT NULL AND p.status = $1 AND p.category_id = ANY($2::uuid[])
         ) x
         ORDER BY x.published_at DESC, x.created_at DESC, x.slug, x.ord
         LIMIT $3`,
        [PUBLISHED, visible, PHOTO_SCAN],
      );
      const seen = new Set<string>();
      const perPost = new Map<string, number>();
      const photos: PhotoItem[] = [];
      for (const row of rows) {
        if (seen.has(row.url)) continue;
        seen.add(row.url);
        const count = (perPost.get(row.slug) ?? 0) + 1;
        perPost.set(row.slug, count);
        if (count > PHOTOS_PER_POST) continue;
        photos.push({ url: row.url, title: row.title, slug: row.slug });
        if (photos.length === size) break;
      }
      return photos;
    });
  }

  /** Public view counter (single atomic UPDATE). Deliberately leaves the cache alone: counts may lag one TTL. */
  async registerView(id: string): Promise<boolean> {
    const result = await pool.query(`UPDATE posts SET views = COALESCE(views, 0) + 1 WHERE id = $1 AND status = $2`, [id, PUBLISHED]);
    return (result.rowCount ?? 0) > 0;
  }

  async create(body: unknown, actor: AuthUser | null): Promise<PostDetail> {
    const input = readRequest(body);
    const id = await transaction(async (db) => {
      const title = requireText(input.title, 'Tiêu đề bài viết');
      const category = await this.categories.requirePostTarget(input.categoryId, db);
      const authorId = await this.resolveAuthor(actor, db);
      const slug = await this.uniqueSlug(input.slug, title, null, null, db);
      checkAttachmentUrls(input.attachments);

      const blocks = input.blocks ?? [];
      const summary = blankToNull(input.summary) ?? summaryFrom(blocks);
      const documentNumber = blankToNull(input.documentNumber);
      const issuer = blankToNull(input.issuer);
      const now = localNow();
      const row = await queryOne<{ id: string }>(
        `INSERT INTO posts (title, slug, category_id, author_id, summary, cover_url, status, pinned, views, published_at,
           document_number, issuer, issued_date, recipient, action_required, search_text, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, $10, $11, $12, $13, $14, $15, $16, $16) RETURNING id`,
        [
          title, slug, category.id, authorId, summary, blankToNull(input.coverUrl), normalizeStatus(input.status),
          input.pinned === true, input.publishedAt ?? now, documentNumber, issuer, input.issuedDate,
          blankToNull(input.recipient), blankToNull(input.actionRequired),
          searchable(title, summary, documentNumber, issuer), now,
        ],
        db,
      );
      await this.replaceChildren(row!.id, blocks, input.attachments ?? [], db);
      return row!.id;
    });
    this.cache.clear();
    return (await this.findAny(id))!;
  }

  /** Partial update: null fields are left unchanged; views, author and timestamps are never client-writable. */
  async update(id: string, body: unknown): Promise<PostDetail | null> {
    const input = readRequest(body);
    const found = await transaction(async (db) => {
      const current = await this.findAny(id, db);
      if (!current) return false;

      const title = input.title != null ? requireText(input.title, 'Tiêu đề bài viết') : current.title;
      const categoryId =
        input.categoryId != null ? (await this.categories.requirePostTarget(input.categoryId, db)).id : current.category.id;
      const slug =
        input.slug != null && !isBlank(input.slug) ? await this.uniqueSlug(input.slug, title, id, current.slug, db) : current.slug;
      checkAttachmentUrls(input.attachments);

      const summary = changed(input.summary, current.summary) ?? summaryFrom(input.blocks ?? current.blocks);
      const documentNumber = changed(input.documentNumber, current.documentNumber);
      const issuer = changed(input.issuer, current.issuer);
      await db.query(
        `UPDATE posts SET title = $2, slug = $3, category_id = $4, summary = $5, cover_url = $6, status = $7, pinned = $8,
           published_at = $9, document_number = $10, issuer = $11, issued_date = $12, recipient = $13, action_required = $14,
           search_text = $15, updated_at = $16
         WHERE id = $1`,
        [
          id, title, slug, categoryId, summary, changed(input.coverUrl, current.coverUrl),
          input.status != null ? normalizeStatus(input.status) : current.status,
          input.pinned ?? current.pinned,
          input.publishedAt ?? current.publishedAt,
          documentNumber, issuer, input.issuedDate ?? current.issuedDate,
          changed(input.recipient, current.recipient), changed(input.actionRequired, current.actionRequired),
          searchable(title, summary, documentNumber, issuer), localNow(),
        ],
      );
      await this.replaceChildren(id, input.blocks, input.attachments, db, true);
      return true;
    });
    if (!found) return null;
    this.cache.clear();
    return this.findAny(id);
  }

  async delete(id: string): Promise<boolean> {
    // Blocks and attachments go with it (ON DELETE CASCADE).
    const result = await pool.query(`DELETE FROM posts WHERE id = $1`, [id]);
    if (!result.rowCount) return false;
    this.cache.clear();
    return true;
  }

  private async search(q: PostQuery, admin: boolean): Promise<PageResponse<PostSummary>> {
    const size = Math.min(Math.max(q.size, 1), MAX_PAGE_SIZE);
    const page = Math.max(q.page, 0);

    const categoryIds = await this.resolveCategoryIds(q, admin);
    if (categoryIds != null && categoryIds.size === 0) return pageOf([], page, size, 0);

    const status = admin ? (q.status == null || isBlank(q.status) ? null : normalizeStatus(q.status)) : PUBLISHED;
    const terms = q.q == null ? [] : searchable(q.q).split(' ').filter((t) => t !== '').slice(0, 8);

    const params: unknown[] = [];
    const param = (value: unknown) => `$${params.push(value)}`;
    const where: string[] = [];
    if (categoryIds != null) where.push(`x.category_id = ANY(${param([...categoryIds])}::uuid[])`);
    if (status != null) where.push(`x.status = ${param(status)}`);
    if (q.pinned != null) where.push(`x.pinned = ${param(q.pinned)}`);
    for (const term of terms) where.push(`x.search_text LIKE ${param(`%${term}%`)}`);
    const filter = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const filterParams = params.length;

    // The id makes the order total, so paging never repeats or skips posts that share a date.
    const order = admin ? ['published_at DESC', 'created_at DESC', 'id'] : ['pinned DESC', 'published_at DESC', 'created_at DESC', 'id'];
    const orderBy = (alias: string) => order.map((o) => `${alias}.${o}`).join(', ');

    // One round trip: the page and the size of the whole match (window count), then the joins for that page only.
    const rows = await query<PostSummary & { total: number }>(
      `SELECT ${SUMMARY_COLUMNS}, p.total
       FROM (SELECT x.*, count(*) OVER () AS total FROM posts x ${filter}
             ORDER BY ${orderBy('x')} LIMIT ${param(size)} OFFSET ${param(page * size)}) p
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN users u ON u.id = p.author_id
       ORDER BY ${orderBy('p')}`,
      params,
    );

    let total = rows[0]?.total ?? 0;
    if (rows.length === 0 && page > 0) {
      // Past the last page the window count has no row to ride on.
      const counted = await queryOne<{ total: number }>(`SELECT count(*) AS total FROM posts x ${filter}`, params.slice(0, filterParams));
      total = counted?.total ?? 0;
    }
    return pageOf(
      rows.map(({ total: _total, ...item }) => item),
      page,
      size,
      total,
    );
  }

  /** null = no category restriction; an empty set = nothing can match. */
  private async resolveCategoryIds(q: PostQuery, admin: boolean): Promise<Set<string> | null> {
    const candidates = admin ? await this.categories.listAll() : await this.categories.listPublic();
    let ids: Set<string> | null = null;

    if (q.category != null && !isBlank(q.category)) {
      const wanted = trim(q.category).toLowerCase();
      const found = candidates.find((c) => c.slug.toLowerCase() === wanted);
      if (!found) return new Set();
      ids = q.descendants || found.pageType === 'GROUP' ? this.categories.withChildren(found, candidates) : new Set([found.id]);
    }
    if (q.types.length > 0) {
      const ofType = new Set(candidates.filter((c) => q.types.includes(c.pageType)).map((c) => c.id));
      ids = ids == null ? ofType : new Set([...ids].filter((id) => ofType.has(id)));
    }
    if (!admin) {
      // Visitors never see posts filed under hidden entries.
      const visible = new Set(candidates.map((c) => c.id));
      ids = ids == null ? visible : new Set([...ids].filter((id) => visible.has(id)));
    }
    return ids;
  }

  private async resolveAuthor(actor: AuthUser | null, db: Db): Promise<string> {
    if (actor) return actor.id;
    const admin = await queryOne<{ id: string }>(`SELECT id FROM users WHERE role = 'ADMIN' ORDER BY created_at LIMIT 1`, [], db);
    if (!admin) throw new HttpError(409, 'Chưa có tài khoản quản trị.');
    return admin.id;
  }

  private async uniqueSlug(requested: string | null, title: string, selfId: string | null, currentSlug: string | null, db: Db) {
    const base = slugOf(requested == null || isBlank(requested) ? title : requested);
    if (base === currentSlug) return base;
    let candidate = base;
    for (let attempt = 0; await this.isSlugTaken(candidate, selfId, db); attempt++) {
      if (attempt >= 5) throw new HttpError(409, 'Không tạo được đường dẫn duy nhất cho bài viết.');
      candidate = `${base}-${(0x1000 + Math.floor(Math.random() * (0xfffff - 0x1000))).toString(16)}`;
    }
    return candidate;
  }

  private async isSlugTaken(slug: string, selfId: string | null, db: Db) {
    return !!(await queryOne(`SELECT 1 FROM posts WHERE slug = $1 AND ($2::uuid IS NULL OR id <> $2) LIMIT 1`, [slug, selfId], db));
  }

  /** Writes the blocks and/or attachments of a post; a null list is left as it is (on update, the others are replaced). */
  private async replaceChildren(postId: string, blocks: Block[] | null, attachments: Attachment[] | null, db: Db, replace = false) {
    if (blocks != null) {
      if (replace) await db.query(`DELETE FROM post_blocks WHERE post_id = $1`, [postId]);
      if (blocks.length) {
        await db.query(
          `INSERT INTO post_blocks (post_id, type, content, image_url, order_index)
           SELECT $1, t.type, t.content, t.image_url, t.ord - 1
           FROM unnest($2::text[], $3::text[], $4::text[]) WITH ORDINALITY AS t(type, content, image_url, ord)`,
          [postId, blocks.map((b) => b.type), blocks.map((b) => b.content), blocks.map((b) => b.imageUrl)],
        );
      }
    }
    if (attachments != null) {
      if (replace) await db.query(`DELETE FROM post_attachments WHERE post_id = $1`, [postId]);
      if (attachments.length) {
        await db.query(
          `INSERT INTO post_attachments (post_id, name, url, size_bytes, mime_type, sort_order)
           SELECT $1, t.name, t.url, t.size_bytes, t.mime_type, t.ord - 1
           FROM unnest($2::text[], $3::text[], $4::bigint[], $5::text[]) WITH ORDINALITY AS t(name, url, size_bytes, mime_type, ord)`,
          [
            postId, attachments.map((a) => a.name), attachments.map((a) => a.url), attachments.map((a) => a.sizeBytes),
            attachments.map((a) => a.mimeType),
          ],
        );
      }
    }
  }
}
