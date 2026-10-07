import { useEffect, useReducer } from 'react';
import type { AttachmentDto, Category, FeedbackDto, PageResponse, PageType, PhotoDto, PostDetailDto, PostSummaryDto, Timetable, TimetablePeriod } from './types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'portal-admin-token';
const CACHE_TTL_MS = 60_000;
const ERROR_RETRY_MS = 5_000;

// ---------------------------------------------------------------------------
// Admin session token
// ---------------------------------------------------------------------------

export const getAdminToken = (): string | null => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const setAdminToken = (token: string | null) => {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable (private mode) – the session simply won't persist */
  }
};

export const AUTH_EXPIRED_EVENT = 'portal:auth-expired';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * The public site never sends the admin token, so an admin browsing the site in the
 * same tab sees exactly what visitors see (no drafts, no hidden menu entries).
 */
async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  const headers = new Headers(init.headers);
  const token = auth ? getAdminToken() : null;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (res.status === 401 && token) {
    setAdminToken(null);
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
  if (!res.ok) {
    let message = `Yêu cầu thất bại (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
      else if (body?.error) message = body.error;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const loginAdmin = async (username: string, password: string) => {
  const result = await request<{ token: string; username: string; role: string; expiresAt: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setAdminToken(result.token);
  return result;
};

export const logoutAdmin = () => setAdminToken(null);

export const checkAdminSession = async (): Promise<boolean> => {
  if (!getAdminToken()) return false;
  try {
    await request('/auth/me');
    return true;
  } catch {
    return false;
  }
};

// ---------------------------------------------------------------------------
// Shared public read cache: one network request per URL, shared by every
// component that needs it, refreshed after TTL or after any admin write.
// ---------------------------------------------------------------------------

interface CacheEntry {
  data?: unknown;
  error: boolean;
  fetchedAt: number;
  promise?: Promise<void>;
  listeners: Set<() => void>;
}

const cache = new Map<string, CacheEntry>();

const entryFor = (path: string): CacheEntry => {
  let entry = cache.get(path);
  if (!entry) {
    entry = { error: false, fetchedAt: 0, listeners: new Set() };
    cache.set(path, entry);
  }
  return entry;
};

const load = (path: string, force = false): Promise<void> => {
  const entry = entryFor(path);
  if (entry.promise) return entry.promise;
  // Failures are retried after a few seconds instead of being cached for the full TTL.
  const ttl = entry.error ? ERROR_RETRY_MS : CACHE_TTL_MS;
  const fresh = (entry.data !== undefined || entry.error) && Date.now() - entry.fetchedAt < ttl;
  if (fresh && !force) return Promise.resolve();

  entry.promise = request<unknown>(path, {}, false)
    .then((data) => {
      entry.data = data ?? null;
      entry.error = false;
    })
    .catch((err) => {
      if (!(err instanceof ApiError && err.status === 404)) console.error(`Không tải được ${path}:`, err);
      entry.error = true;
      entry.data = undefined;
    })
    .finally(() => {
      entry.fetchedAt = Date.now();
      entry.promise = undefined;
      entry.listeners.forEach((notify) => notify());
    });
  return entry.promise;
};

/** Marks every cached resource stale and reloads the ones currently on screen. */
export const invalidateCache = () => {
  cache.forEach((entry, path) => {
    entry.fetchedAt = 0;
    if (entry.listeners.size > 0) void load(path, true);
  });
};

// A tab left open keeps what it first loaded. When the visitor comes back to it, the resources on screen
// that are older than the TTL are reloaded (load() skips fresh ones), so edits made meanwhile show up.
const revalidateOnReturn = () => {
  if (document.visibilityState !== 'visible') return;
  cache.forEach((entry, path) => {
    if (entry.listeners.size > 0) void load(path);
  });
};
window.addEventListener('focus', revalidateOnReturn);
document.addEventListener('visibilitychange', revalidateOnReturn);

export interface Resource<T> {
  data: T;
  loading: boolean;
  error: boolean;
  refetch: () => Promise<void>;
}

/** Public, cached GET. Pass {@code null} as path to skip the request (e.g. while a dependency loads). */
export function useResource<T>(path: string | null, fallback: T): Resource<T> {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const entry = path ? entryFor(path) : undefined;

  useEffect(() => {
    if (!path) return;
    const current = entryFor(path);
    current.listeners.add(rerender);
    void load(path);
    return () => {
      current.listeners.delete(rerender);
    };
  }, [path]);

  return {
    data: (entry?.data as T | undefined) ?? fallback,
    loading: !!entry && entry.data === undefined && !entry.error,
    error: !!entry?.error,
    refetch: () => (path ? load(path, true) : Promise.resolve()),
  };
}

/** Warms the cache before the first component asks for it. */
export const prefetch = (...paths: string[]) => paths.forEach((p) => void load(p));

// ---------------------------------------------------------------------------
// Public resources
// ---------------------------------------------------------------------------

export const CATEGORIES_PATH = '/categories';
export const SETTINGS_PATH = '/settings';
export const TIMETABLE_PATH = '/timetable';

export interface PostListParams {
  category?: string;
  type?: PageType[];
  q?: string;
  page?: number;
  size?: number;
  status?: string;
  /** Only pinned (featured) posts. */
  pinned?: boolean;
}

export const postsPath = ({ category, type, q, page = 0, size = 12, status, pinned }: PostListParams) => {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (type && type.length) params.set('type', type.join(','));
  if (q && q.trim()) params.set('q', q.trim());
  if (status) params.set('status', status);
  if (pinned) params.set('pinned', 'true');
  params.set('page', String(page));
  params.set('size', String(size));
  return `/posts?${params.toString()}`;
};

export const EMPTY_PAGE: PageResponse<never> = { items: [], page: 0, size: 0, total: 0, totalPages: 0 };

export const usePostPage = (params: PostListParams | null) =>
  useResource<PageResponse<PostSummaryDto>>(params ? postsPath(params) : null, EMPTY_PAGE);

export const usePost = (slug: string | null) =>
  useResource<PostDetailDto | null>(slug ? `/posts/by-slug/${encodeURIComponent(slug)}` : null, null);

const NO_PHOTOS: PhotoDto[] = [];
/** Newest photos of published posts (at most two per post), for the home gallery. */
export const usePhotos = (limit: number) => useResource<PhotoDto[]>(`/posts/photos?limit=${limit}`, NO_PHOTOS);

export const useSettingsResource = () => useResource<Record<string, string>>(SETTINGS_PATH, {});

export const EMPTY_TIMETABLE: Timetable = { periods: [], entries: [] };
export const useTimetable = () => useResource<Timetable>(TIMETABLE_PATH, EMPTY_TIMETABLE);

/** Counts a view once per browser session per post. */
export const registerPostView = (id: string) => {
  const key = `viewed:${id}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    /* ignore */
  }
  fetch(`${API_BASE}/posts/${id}/views`, { method: 'POST', keepalive: true }).catch(() => undefined);
};

export const submitFeedback = (body: { fullName: string; email?: string; phone?: string; subject?: string; content: string; website?: string }) =>
  request<{ message: string }>('/feedback', { method: 'POST', body: JSON.stringify(body) }, false);

// ---------------------------------------------------------------------------
// Admin reads & writes (send the bearer token; writes invalidate public caches)
// ---------------------------------------------------------------------------

const mutate = async <T>(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<T> => {
  const result = await request<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
  invalidateCache();
  return result;
};

export const adminApi = {
  categories: () => request<Category[]>(CATEGORIES_PATH),
  createCategory: (body: Partial<Category>) => mutate<Category>(CATEGORIES_PATH, 'POST', body),
  updateCategory: (id: string, body: Partial<Category>) => mutate<Category>(`${CATEGORIES_PATH}/${id}`, 'PUT', body),
  reorderCategories: (items: { id: string; parentId: string | null; sortOrder: number }[]) =>
    mutate<Category[]>(`${CATEGORIES_PATH}/order`, 'PUT', items),
  deleteCategory: (id: string, moveTo?: string) =>
    mutate<void>(`${CATEGORIES_PATH}/${id}${moveTo ? `?moveTo=${moveTo}` : ''}`, 'DELETE'),

  posts: (params: PostListParams) => request<PageResponse<PostSummaryDto>>(postsPath(params)),
  post: (id: string) => request<PostDetailDto>(`/posts/${id}`),
  createPost: (body: unknown) => mutate<PostDetailDto>('/posts', 'POST', body),
  updatePost: (id: string, body: unknown) => mutate<PostDetailDto>(`/posts/${id}`, 'PUT', body),
  deletePost: (id: string) => mutate<void>(`/posts/${id}`, 'DELETE'),

  feedback: () => request<FeedbackDto[]>('/feedback'),
  updateFeedback: (id: string, body: { status?: string; note?: string }) => mutate<FeedbackDto>(`/feedback/${id}`, 'PUT', body),
  deleteFeedback: (id: string) => mutate<void>(`/feedback/${id}`, 'DELETE'),

  timetable: () => request<Timetable>(TIMETABLE_PATH),
  saveTimetableClass: (className: string, entries: { dayOfWeek: number; period: number; subject: string; teacher?: string }[]) =>
    mutate<void>(`${TIMETABLE_PATH}/classes/${encodeURIComponent(className)}`, 'PUT', { entries }),
  deleteTimetableClass: (className: string) => mutate<void>(`${TIMETABLE_PATH}/classes/${encodeURIComponent(className)}`, 'DELETE'),
  saveTimetablePeriods: (periods: TimetablePeriod[]) => mutate<void>(`${TIMETABLE_PATH}/periods`, 'PUT', periods),

  settings: () => request<Record<string, string>>(SETTINGS_PATH),
  updateSettings: (body: Record<string, string>) => mutate<Record<string, string>>(SETTINGS_PATH, 'PUT', body),

  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<{ url: string }>('/upload', { method: 'POST', body: form });
  },
  uploadFile: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<AttachmentDto>('/upload/file', { method: 'POST', body: form });
  },
};
