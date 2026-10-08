/**
 * Tiny in-memory read-through cache for public listings. The database may be remote (each round trip to
 * Supabase costs ~250 ms), so unchanged lists are served from memory. Every admin write clears it.
 * Cached values are shared between requests and must never be mutated.
 */
export class ContentCache {
  private static readonly MAX_ENTRIES = 500;

  private readonly entries = new Map<string, { value: unknown; expiresAt: number }>();
  private readonly loading = new Map<string, Promise<unknown>>();
  /** Bumped by clear(): a load that started before a write must not store pre-write data afterwards. */
  private generation = 0;

  constructor(private readonly ttlMs: number) {}

  get<T>(key: string, loader: () => Promise<T>): Promise<T> {
    if (this.ttlMs <= 0) return loader();
    const hit = this.entries.get(key);
    if (hit && hit.expiresAt > Date.now()) return Promise.resolve(hit.value as T);

    // One query per key: concurrent misses wait for the first load instead of all hitting the database.
    const running = this.loading.get(key);
    if (running) return running as Promise<T>;

    const generation = this.generation;
    const promise = loader()
      .then((value) => {
        if (generation === this.generation) this.store(key, value);
        return value;
      })
      .finally(() => {
        if (this.loading.get(key) === promise) this.loading.delete(key);
      });
    this.loading.set(key, promise);
    return promise;
  }

  clear() {
    this.generation++;
    this.entries.clear();
    this.loading.clear();
  }

  private store(key: string, value: unknown) {
    const now = Date.now();
    if (this.entries.size >= ContentCache.MAX_ENTRIES) {
      for (const [k, entry] of this.entries) if (entry.expiresAt <= now) this.entries.delete(k);
      // Still full (many distinct searches within one TTL): drop the oldest half.
      if (this.entries.size >= ContentCache.MAX_ENTRIES) {
        let excess = this.entries.size - ContentCache.MAX_ENTRIES / 2;
        for (const k of this.entries.keys()) {
          if (excess-- <= 0) break;
          this.entries.delete(k);
        }
      }
    }
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt: now + this.ttlMs });
  }
}
