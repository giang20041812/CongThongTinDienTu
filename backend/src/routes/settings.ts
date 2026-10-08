import { Router } from 'express';
import type { ContentCache } from '../cache.js';
import { query } from '../db.js';
import { badRequest, jsonObject, str } from '../http.js';
import { trim } from '../text.js';

const CACHE_KEY = 'settings';
const KEY = /^[a-z][a-z0-9_]{0,49}$/;
const MAX_VALUE_LENGTH = 4000;

/** All settings as {key: value}, sorted by key; a NULL value reads as "". */
async function loadSettings(): Promise<Record<string, string>> {
  const rows = await query<{ key: string; value: string | null }>(
    `SELECT setting_key AS key, setting_value AS value FROM site_settings`,
  );
  rows.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']));
}

/** Site information shown in the header, footer and contact pages (public read, admin write). */
export function settingsRoutes(cache: ContentCache): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.json(await cache.get(CACHE_KEY, loadSettings));
  });

  /** Upserts the given keys; other keys are left untouched. */
  router.put('/', async (req, res) => {
    const body = jsonObject(req.body);
    const keys: string[] = [];
    const values: string[] = [];
    for (const [key, value] of Object.entries(body)) {
      if (!KEY.test(key)) throw badRequest(`Khoá cài đặt không hợp lệ: ${key}`);
      const text = value == null ? '' : trim(str(value)!);
      if (text.length > MAX_VALUE_LENGTH) throw badRequest(`Giá trị của "${key}" quá dài.`);
      keys.push(key);
      values.push(text);
    }
    if (keys.length) {
      await query(
        `INSERT INTO site_settings (setting_key, setting_value)
         SELECT * FROM unnest($1::text[], $2::text[])
         ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`,
        [keys, values],
      );
    }
    cache.clear();
    res.json(await loadSettings());
  });

  return router;
}
