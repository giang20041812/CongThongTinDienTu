import { Router } from 'express';
import { notFound, queryParam, uuidParam } from '../http.js';
import { isAdmin } from '../security.js';
import type { CategoryService } from '../services/categories.js';

/**
 * The menu tree, as a flat list in menu order (clients group children by parentId).
 * Visitors get only visible entries; admins get everything.
 */
export function categoryRoutes(categories: CategoryService): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    res.json(isAdmin(req) ? await categories.listAll() : await categories.listPublic());
  });

  router.get('/by-slug/:slug', async (req, res) => {
    const category = await categories.findBySlug(req.params.slug, isAdmin(req));
    if (!category) throw notFound();
    res.json(category);
  });

  router.post('/', async (req, res) => {
    res.json(await categories.create(req.body));
  });

  /** Moves/reorders many entries at once: [{id, parentId, sortOrder}, ...]. */
  router.put('/order', async (req, res) => {
    res.json(await categories.reorder(req.body));
  });

  router.put('/:id', async (req, res) => {
    const category = await categories.update(uuidParam(req.params.id), req.body);
    if (!category) throw notFound();
    res.json(category);
  });


  return router;
}
