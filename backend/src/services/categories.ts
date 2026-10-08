import type { ContentCache } from '../cache.js';
import { type Db, pool, query, queryOne, transaction } from '../db.js';
import { badRequest, bool, conflict, enumValue, int, jsonArray, jsonObject, str, uuid } from '../http.js';
import { blankToNull, isBlank, localNow, slugOf, trim } from '../text.js';

/** How a menu entry is rendered (frontend: types/index.ts). Declaration order matters for sorting. */
export const PAGE_TYPES = ['GROUP', 'PAGE', 'POST_LIST', 'DOCUMENT_LIST', 'SCHEDULE', 'CONTACT', 'MAP', 'FEEDBACK', 'LINK'] as const;
export type PageType = (typeof PAGE_TYPES)[number];

/** Whether posts may be filed under a category of this type (GROUP and LINK hold none). */
export const holdsPosts = (type: PageType) => type !== 'GROUP' && type !== 'LINK';

export interface Category {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  pageType: PageType;
  sortOrder: number;
  visible: boolean;
  showOnHome: boolean;
  externalUrl: string | null;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

const COLUMNS = `id, parent_id AS "parentId", name, slug, page_type AS "pageType", sort_order AS "sortOrder", visible,
  show_on_home AS "showOnHome", external_url AS "externalUrl", description, created_at AS "createdAt", updated_at AS "updatedAt"`;

/** First path segments the front-end already uses for something else. */
const RESERVED_SLUGS = new Set(['admin', 'api', 'bai-viet', 'tim-kiem', 'assets', 'uploads']);
const ALL_KEY = 'categories:all';

interface CategoryRequest {
  parentId: string | null;
  name: string | null;
  slug: string | null;
  pageType: PageType | null;
  sortOrder: number | null;
  visible: boolean | null;
  showOnHome: boolean | null;
  externalUrl: string | null;
  description: string | null;
}

function readRequest(body: unknown): CategoryRequest {
  const b = jsonObject(body);
  return {
    parentId: uuid(b.parentId),
    name: str(b.name),
    slug: str(b.slug),
    pageType: enumValue(b.pageType, PAGE_TYPES),
    sortOrder: int(b.sortOrder),
    visible: bool(b.visible),
    showOnHome: bool(b.showOnHome),
    externalUrl: str(b.externalUrl),
    description: str(b.description),
  };
}

const index = (all: Category[]) => new Map(all.map((c) => [c.id, c]));

const isPubliclyVisible = (category: Category, byId: Map<string, Category>) => {
  if (!category.visible) return false;
  if (category.parentId == null) return true;
  return byId.get(category.parentId)?.visible === true;
};

/** Java String.compareTo order (UTF-16 code units), used where the old API sorted in memory. */
const compareText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Owns the menu tree. Rules enforced on every write: at most two levels, a child is never a GROUP, slugs are
 * unique and not reserved, and a category that still holds posts cannot become a GROUP/LINK or be deleted
 * without saying where its posts go.
 */
export class CategoryService {
  constructor(private readonly cache: ContentCache) {}

  /** Every category, menu order. */
  listAll(): Promise<Category[]> {
    return this.cache.get(ALL_KEY, () => query<Category>(`SELECT ${COLUMNS} FROM categories ORDER BY sort_order, name`));
  }

  /** Categories a visitor may see: visible, and under a visible parent. */
  async listPublic(): Promise<Category[]> {
    const all = await this.listAll();
    const byId = index(all);
    return all.filter((c) => isPubliclyVisible(c, byId));
  }

  async findBySlug(slug: string, includeHidden: boolean): Promise<Category | undefined> {
    const pool = includeHidden ? await this.listAll() : await this.listPublic();
    const wanted = slug.toLowerCase();
    return pool.find((c) => c.slug.toLowerCase() === wanted);
  }

  /** The category itself plus its direct children (menus have two levels). */
  withChildren(category: Category, pool: Category[]): Set<string> {
    const ids = new Set([category.id]);
    for (const c of pool) if (c.parentId === category.id) ids.add(c.id);
    return ids;
  }

  /** Resolves a category a post may be filed under, or fails with a readable message. */
  async requirePostTarget(id: string | null, db: Db = pool): Promise<Category> {
    if (!id) throw badRequest('Vui lòng chọn đầu mục cho bài viết.');
    const category = await queryOne<Category>(`SELECT ${COLUMNS} FROM categories WHERE id = $1`, [id], db);
    if (!category) throw badRequest('Đầu mục không tồn tại.');
    if (!holdsPosts(category.pageType)) {
      throw badRequest(`Đầu mục "${category.name}" là nhóm/liên kết nên không chứa bài viết. Hãy chọn một mục con.`);
    }
    return category;
  }

  async create(body: unknown): Promise<Category> {
    const request = readRequest(body);
    const saved = await transaction(async (db) => {
      const all = await query<Category>(`SELECT ${COLUMNS} FROM categories`, [], db);
      const target = await this.apply(null, request, all, db);
      const sortOrder = request.sortOrder ?? this.nextSortOrder(all, target.parentId);
      const now = localNow();
      return queryOne<Category>(
        `INSERT INTO categories (parent_id, name, slug, page_type, sort_order, visible, show_on_home, external_url, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10) RETURNING ${COLUMNS}`,
        [target.parentId, target.name, target.slug, target.pageType, sortOrder, target.visible, target.showOnHome,
          target.externalUrl, target.description, now],
        db,
      );
    });
    this.cache.clear();
    return saved!;
  }

  /** Full replacement of the editable fields (like the Java PUT); null when the id does not exist. */
  async update(id: string, body: unknown): Promise<Category | null> {
    const request = readRequest(body);
    const saved = await transaction(async (db) => {
      const all = await query<Category>(`SELECT ${COLUMNS} FROM categories`, [], db);
      const existing = all.find((c) => c.id === id);
      if (!existing) return null;
      const target = await this.apply(existing, request, all, db);
      let sortOrder = request.sortOrder ?? existing.sortOrder;
      if (request.sortOrder == null && existing.parentId !== target.parentId) {
        // Among the new siblings, the moved entry itself counted with its old position (as in the Java backend).
        const siblings = all.map((c) => (c.id === id ? { ...c, parentId: target.parentId } : c));
        sortOrder = this.nextSortOrder(siblings, target.parentId);
      }
      return queryOne<Category>(
        `UPDATE categories SET parent_id = $2, name = $3, slug = $4, page_type = $5, sort_order = $6, visible = $7,
           show_on_home = $8, external_url = $9, description = $10, updated_at = $11
         WHERE id = $1 RETURNING ${COLUMNS}`,
        [id, target.parentId, target.name, target.slug, target.pageType, sortOrder, target.visible, target.showOnHome,
          target.externalUrl, target.description, localNow()],
        db,
      );
    });
    if (saved) this.cache.clear();
    return saved ?? null;
  }


  /** Applies a whole drag/drop or up/down re-arrangement at once ([{id, parentId, sortOrder}]), then validates the tree. */
  async reorder(body: unknown): Promise<Category[]> {
    const items = jsonArray(body).map((raw) => {
      const item = jsonObject(raw);
      return { id: uuid(item.id), parentId: uuid(item.parentId), sortOrder: int(item.sortOrder) };
    });
    if (items.length === 0) return this.listAll();

    const result = await transaction(async (db) => {
      const all = await query<Category>(`SELECT ${COLUMNS} FROM categories`, [], db);
      const byId = index(all);
      const changed = new Set<Category>();
      for (const item of items) {
        const category = item.id ? byId.get(item.id) : undefined;
        if (!category) throw badRequest(`Đầu mục không tồn tại: ${item.id}`);
        if (category.parentId !== item.parentId) {
          category.parentId = item.parentId;
          changed.add(category);
        }
        if (item.sortOrder != null && category.sortOrder !== item.sortOrder) {
          category.sortOrder = item.sortOrder;
          changed.add(category);
        }
      }
      for (const category of all) this.validatePlacement(category, byId, all);

      if (changed.size > 0) {
        const rows = [...changed];
        const now = localNow();
        const updated = await query<Category>(
          `UPDATE categories SET parent_id = v.new_parent, sort_order = v.new_order, updated_at = $4
           FROM unnest($1::uuid[], $2::uuid[], $3::int[]) AS v(target, new_parent, new_order)
           WHERE id = v.target RETURNING ${COLUMNS}`,
          [rows.map((c) => c.id), rows.map((c) => c.parentId), rows.map((c) => c.sortOrder), now],
          db,
        );
        for (const row of updated) byId.set(row.id, row);
      }
      return [...byId.values()].sort((a, b) => a.sortOrder - b.sortOrder || compareText(a.name, b.name));
    });
    this.cache.clear();
    return result;
  }

  countPosts(categoryId: string, db: Db = pool): Promise<number> {
    return queryOne<{ count: number }>(`SELECT count(*) AS count FROM posts WHERE category_id = $1`, [categoryId], db).then(
      (row) => row?.count ?? 0,
    );
  }

  /** Validates `request` and returns the category it describes (not saved yet). */
  private async apply(existing: Category | null, request: CategoryRequest, all: Category[], db: Db): Promise<Category> {
    const name = request.name == null ? '' : trim(request.name);
    if (!name) throw badRequest('Tên đầu mục không được để trống.');
    if (name.length > 100) throw badRequest('Tên đầu mục tối đa 100 ký tự.');
    const pageType = request.pageType ?? 'POST_LIST';

    if (existing && !holdsPosts(pageType)) {
      const count = await this.countPosts(existing.id, db);
      if (count > 0) {
        throw conflict(`Đầu mục đang có ${count} bài viết nên không thể đổi thành nhóm/liên kết. Hãy chuyển bài viết trước.`);
      }
    }

    const externalUrl = blankToNull(request.externalUrl);
    if (pageType === 'LINK') {
      if (externalUrl == null || !/^(https?:\/\/|\/)/.test(externalUrl)) {
        throw badRequest('Đầu mục kiểu liên kết cần đường dẫn bắt đầu bằng http://, https:// hoặc /.');
      }
    }

    const target: Category = {
      ...(existing ?? { id: null as unknown as string, createdAt: null, updatedAt: null, sortOrder: 0 }),
      name,
      slug: await this.uniqueSlug(request.slug, name, existing?.id ?? null, db),
      pageType,
      parentId: request.parentId,
      sortOrder: request.sortOrder ?? existing?.sortOrder ?? 0,
      visible: request.visible == null || request.visible,
      showOnHome: request.showOnHome === true,
      externalUrl,
      description: blankToNull(request.description),
    };

    const others = all.filter((c) => c.id !== target.id);
    this.validatePlacement(target, index([...others, target]), [...others, target]);
    return target;
  }

  private validatePlacement(category: Category, byId: Map<string, Category>, all: Category[]) {
    const parentId = category.parentId;
    if (parentId == null) return;
    if (parentId === category.id) throw badRequest('Đầu mục không thể là cha của chính nó.');
    const parent = byId.get(parentId);
    if (!parent) throw badRequest('Đầu mục cha không tồn tại.');
    if (parent.parentId != null) {
      throw badRequest(`Menu chỉ có 2 cấp: "${parent.name}" đã là mục con nên không thể chứa mục khác.`);
    }
    if (category.pageType === 'GROUP') throw badRequest(`Mục con "${category.name}" không thể là kiểu Nhóm.`);
    if (category.id != null && all.some((c) => c.parentId === category.id)) {
      throw badRequest(`"${category.name}" đang có mục con nên phải giữ ở cấp 1 (menu chỉ có 2 cấp).`);
    }
  }

  private async uniqueSlug(requested: string | null, name: string, selfId: string | null, db: Db): Promise<string> {
    const slug = slugOf(requested == null || isBlank(requested) ? name : requested);
    if (RESERVED_SLUGS.has(slug)) throw badRequest(`Đường dẫn "${slug}" đã được hệ thống sử dụng, hãy chọn tên khác.`);
    const taken = await queryOne(
      `SELECT 1 FROM categories WHERE slug = $1 AND ($2::uuid IS NULL OR id <> $2) LIMIT 1`,
      [slug, selfId],
      db,
    );
    if (taken) throw conflict(`Đường dẫn "${slug}" đã thuộc về một đầu mục khác.`);
    return slug;
  }

  private nextSortOrder(all: Category[], parentId: string | null): number {
    let max = -1;
    for (const c of all) if (c.parentId === parentId && c.sortOrder > max) max = c.sortOrder;
    return max + 1;
  }
}
