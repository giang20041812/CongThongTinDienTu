import { Router } from 'express';
import type { Request } from 'express';
import { HttpError, badRequest, boolParam, intParam, notFound, queryParam, uuid, uuidParam } from '../http.js';
import { currentUser, isAdmin, isStaff } from '../security.js';
import { PAGE_TYPES, type CategoryService, type PageType } from '../services/categories.js';
import type { PostQuery, PostService } from '../services/posts.js';
import { isBlank, trim } from '../text.js';

/** Comma-separated page types ("POST_LIST,DOCUMENT_LIST"), distinct and in declaration order. */
function parseTypes(raw: string | undefined): PageType[] {
  if (raw == null || isBlank(raw)) return [];
  const types = new Set<PageType>();
  for (const part of raw.split(',')) {
    const value = trim(part).toUpperCase();
    if (!value) continue;
    if (!(PAGE_TYPES as readonly string[]).includes(value)) throw badRequest(`Kiểu trang không hợp lệ: ${raw}`);
    types.add(value as PageType);
  }
  return [...types].sort((a, b) => PAGE_TYPES.indexOf(a) - PAGE_TYPES.indexOf(b));
}

const FORBIDDEN = 'Bạn chỉ được quản lý bài viết thuộc đầu mục được phân quyền cho tài khoản này.';

export function postRoutes(posts: PostService, categories: CategoryService): Router {
  const router = Router();

  /** null = unrestricted (admin or visitor); an editor gets the ids of their entry and its children. */
  const scopeOf = async (req: Request): Promise<Set<string> | null> => {
    const user = currentUser(req);
    if (user?.role !== 'EDITOR') return null;
    const scope = await categories.editorScope(user.id);
    if (scope.size === 0) throw new HttpError(403, 'Tài khoản chưa được gán đầu mục nào để quản lý.');
    return scope;
  };
  const requireInScope = (scope: Set<string> | null, categoryId: string | null | undefined) => {
    if (scope && (!categoryId || !scope.has(categoryId))) throw new HttpError(403, FORBIDDEN);
  };

  /**
   * Paged summaries, pinned first then newest. Visitors only get published posts in visible entries.
   * ?category= (slug; a GROUP also includes its children) &descendants= &type=POST_LIST,DOCUMENT_LIST
   * &q= (accent-insensitive) &status= (admin) &pinned= &featured= (home slider picks) &page= &size=
   */
  router.get('/', async (req, res) => {
    const query: PostQuery = {
      category: queryParam(req, 'category') ?? null,
      descendants: boolParam(queryParam(req, 'descendants')) ?? false,
      types: parseTypes(queryParam(req, 'type')),
      q: queryParam(req, 'q') ?? null,
      status: queryParam(req, 'status') ?? null,
      pinned: boolParam(queryParam(req, 'pinned')),
      featured: boolParam(queryParam(req, 'featured')),
      page: intParam(queryParam(req, 'page'), 0),
      size: intParam(queryParam(req, 'size'), 12),
    };
    res.json(await posts.list(query, isStaff(req), await scopeOf(req)));
  });

  /** Public: newest photos (covers and body images) of published posts, for the home gallery. */
  router.get('/photos', async (req, res) => {
    res.json(await posts.recentPhotos(intParam(queryParam(req, 'limit'), 9)));
  });

  router.get('/by-slug/:slug', async (req, res) => {
    const slug = req.params.slug;
    const post = isStaff(req) ? await posts.findAnyBySlug(slug) : await posts.findPublishedBySlug(slug);
    if (!post) throw notFound();
    if (isStaff(req)) requireInScope(await scopeOf(req), post.category.id);
    res.json(post);
  });

  /** Admin only (any status); visitors read posts by slug. */
  router.get('/:id', async (req, res) => {
    const post = await posts.findAny(uuidParam(req.params.id));
    if (!post) throw notFound();
    requireInScope(await scopeOf(req), post.category.id);
    res.json(post);
  });

  /** Public, unauthenticated view counter. */
  router.post('/:id/views', async (req, res) => {
    if (!(await posts.registerView(uuidParam(req.params.id)))) throw notFound();
    res.status(204).end();
  });

  /** Picking posts for the home slider is the admin's call: an editor's request never changes it. */
  const withoutFeatured = (body: unknown) => {
    if (body == null || typeof body !== 'object' || Array.isArray(body)) return body;
    const { featured: _featured, ...rest } = body as Record<string, unknown>;
    return rest;
  };

  router.post('/', async (req, res) => {
    const scope = await scopeOf(req);
    requireInScope(scope, uuid((req.body as { categoryId?: unknown } | null)?.categoryId));
    res.json(await posts.create(scope ? withoutFeatured(req.body) : req.body, currentUser(req)));
  });

  router.put('/:id', async (req, res) => {
    const id = uuidParam(req.params.id);
    const scope = await scopeOf(req);
    if (scope) {
      const existing = await posts.findAny(id);
      if (!existing) throw notFound();
      requireInScope(scope, existing.category.id);
      const target = uuid((req.body as { categoryId?: unknown } | null)?.categoryId);
      if (target) requireInScope(scope, target);
    }
    const post = await posts.update(id, scope ? withoutFeatured(req.body) : req.body);
    if (!post) throw notFound();
    res.json(post);
  });


  return router;
}
