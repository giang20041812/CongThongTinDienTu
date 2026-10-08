import { Router } from 'express';
import { badRequest, boolParam, intParam, notFound, queryParam, uuidParam } from '../http.js';
import { currentUser, isAdmin } from '../security.js';
import { PAGE_TYPES, type PageType } from '../services/categories.js';
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

export function postRoutes(posts: PostService): Router {
  const router = Router();

  /**
   * Paged summaries, pinned first then newest. Visitors only get published posts in visible entries.
   * ?category= (slug; a GROUP also includes its children) &descendants= &type=POST_LIST,DOCUMENT_LIST
   * &q= (accent-insensitive) &status= (admin) &pinned= &page= &size=
   */
  router.get('/', async (req, res) => {
    const query: PostQuery = {
      category: queryParam(req, 'category') ?? null,
      descendants: boolParam(queryParam(req, 'descendants')) ?? false,
      types: parseTypes(queryParam(req, 'type')),
      q: queryParam(req, 'q') ?? null,
      status: queryParam(req, 'status') ?? null,
      pinned: boolParam(queryParam(req, 'pinned')),
      page: intParam(queryParam(req, 'page'), 0),
      size: intParam(queryParam(req, 'size'), 12),
    };
    res.json(await posts.list(query, isAdmin(req)));
  });

  /** Public: newest photos (covers and body images) of published posts, for the home gallery. */
  router.get('/photos', async (req, res) => {
    res.json(await posts.recentPhotos(intParam(queryParam(req, 'limit'), 9)));
  });

  router.get('/by-slug/:slug', async (req, res) => {
    const slug = req.params.slug;
    const post = isAdmin(req) ? await posts.findAnyBySlug(slug) : await posts.findPublishedBySlug(slug);
    if (!post) throw notFound();
    res.json(post);
  });

  /** Admin only (any status); visitors read posts by slug. */
  router.get('/:id', async (req, res) => {
    const post = await posts.findAny(uuidParam(req.params.id));
    if (!post) throw notFound();
    res.json(post);
  });

  /** Public, unauthenticated view counter. */
  router.post('/:id/views', async (req, res) => {
    if (!(await posts.registerView(uuidParam(req.params.id)))) throw notFound();
    res.status(204).end();
  });

  router.post('/', async (req, res) => {
    res.json(await posts.create(req.body, currentUser(req)));
  });

  router.put('/:id', async (req, res) => {
    const post = await posts.update(uuidParam(req.params.id), req.body);
    if (!post) throw notFound();
    res.json(post);
  });

  router.delete('/:id', async (req, res) => {
    if (!(await posts.delete(uuidParam(req.params.id)))) throw notFound();
    res.status(200).end();
  });

  return router;
}
