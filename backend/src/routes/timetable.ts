import { Router } from 'express';
import { notFound, requireBody } from '../http.js';
import type { TimetableService } from '../services/timetable.js';

/** Class timetable: public read of everything at once (small, cached); writes are admin-only. */
export function timetableRoutes(timetable: TimetableService): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.json(await timetable.get());
  });

  /** Replaces the week of the class ({entries: [{dayOfWeek, period, subject, teacher}]}); created if new. */
  router.put('/classes/:className', async (req, res) => {
    await timetable.replaceClass(req.params.className, requireBody(req.body));
    res.status(204).end();
  });

  router.delete('/classes/:className', async (req, res) => {
    if (!(await timetable.deleteClass(req.params.className))) throw notFound();
    res.status(200).end();
  });

  router.put('/periods', async (req, res) => {
    await timetable.replacePeriods(requireBody(req.body));
    res.status(204).end();
  });

  return router;
}
