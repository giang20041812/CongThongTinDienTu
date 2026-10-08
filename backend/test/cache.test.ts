import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ContentCache } from '../src/cache.js';

test('serves cached values until cleared', async () => {
  const cache = new ContentCache(60_000);
  let loads = 0;
  const load = async () => ++loads;
  assert.equal(await cache.get('k', load), 1);
  assert.equal(await cache.get('k', load), 1);
  cache.clear();
  assert.equal(await cache.get('k', load), 2);
});

test('concurrent misses share one load', async () => {
  const cache = new ContentCache(60_000);
  let loads = 0;
  const load = () => new Promise<number>((resolve) => setTimeout(() => resolve(++loads), 10));
  const values = await Promise.all([cache.get('k', load), cache.get('k', load), cache.get('k', load)]);
  assert.deepEqual(values, [1, 1, 1]);
});

test('a load that started before a write is not cached after it', async () => {
  const cache = new ContentCache(60_000);
  let release!: (value: string) => void;
  const stale = cache.get('k', () => new Promise<string>((resolve) => (release = resolve)));
  cache.clear(); // an admin write commits while the read is in flight
  release('before write');
  assert.equal(await stale, 'before write');
  assert.equal(await cache.get('k', async () => 'after write'), 'after write');
});

test('a TTL of 0 disables caching', async () => {
  const cache = new ContentCache(0);
  let loads = 0;
  await cache.get('k', async () => ++loads);
  await cache.get('k', async () => ++loads);
  assert.equal(loads, 2);
});

test('failed loads are not cached', async () => {
  const cache = new ContentCache(60_000);
  await assert.rejects(cache.get('k', async () => Promise.reject(new Error('db down'))));
  assert.equal(await cache.get('k', async () => 'ok'), 'ok');
});
