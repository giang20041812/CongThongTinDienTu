import { existsSync } from 'node:fs';
import path from 'node:path';
import compression from 'compression';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { ContentCache } from './cache.js';
import { config } from './config.js';
import { errorHandler } from './http.js';
import { authRoutes } from './routes/auth.js';
import { categoryRoutes } from './routes/categories.js';
import { feedbackRoutes } from './routes/feedback.js';
import { postRoutes } from './routes/posts.js';
import { settingsRoutes } from './routes/settings.js';
import { timetableRoutes } from './routes/timetable.js';
import { uploadRoutes } from './routes/upload.js';
import { userRoutes } from './routes/users.js';
import { LoginAttemptLimiter, SubmissionRateLimiter, TokenService, authenticate } from './security.js';
import { CategoryService } from './services/categories.js';
import { PostService } from './services/posts.js';
import { TimetableService } from './services/timetable.js';
import { type FileStorage, createStorage } from './storage/index.js';

export interface Services {
  cache: ContentCache;
  categories: CategoryService;
  posts: PostService;
  timetable: TimetableService;
  tokens: TokenService;
  logins: LoginAttemptLimiter;
  submissions: SubmissionRateLimiter;
  storage: FileStorage;
}

export function createServices(): Services {
  const cache = new ContentCache(config.cacheTtlMs);
  const categories = new CategoryService(cache);
  return {
    cache,
    categories,
    posts: new PostService(categories, cache),
    timetable: new TimetableService(cache),
    tokens: new TokenService(config.authSecret, config.authTtlHours),
    logins: new LoginAttemptLimiter(),
    submissions: new SubmissionRateLimiter(),
    storage: createStorage(),
  };
}

/** The REST API: public reads, admin writes (see security.ts for the exact rule). */
function apiRouter(services: Services) {
  const api = express.Router();
  // Only needed when the site is served from another domain than the API; same-origin calls ignore it.
  api.use(
    cors({
      origin: config.corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      maxAge: 3600,
    }),
  );
  api.use(express.json({ limit: '5mb' }));
  api.use(authenticate(services.tokens));

  api.use('/auth', authRoutes(services.tokens, services.logins));
  api.use('/categories', categoryRoutes(services.categories));
  api.use('/posts', postRoutes(services.posts));
  api.use('/feedback', feedbackRoutes(services.submissions));
  api.use('/settings', settingsRoutes(services.cache));
  api.use('/timetable', timetableRoutes(services.timetable));
  api.use('/upload', uploadRoutes(services.storage));
  api.use('/users', userRoutes());

  // Unknown /api paths get a JSON 404 instead of the website's index.html.
  api.use((_req, res) => {
    res.status(404).json({ message: 'Không tìm thấy đường dẫn API.' });
  });
  api.use(errorHandler);
  return api;
}

/**
 * The built front-end (frontend/dist): content-hashed /assets/* cached for a year, everything else revalidated,
 * and every unknown path answered with index.html so the React router can handle it (/{slug}, /bai-viet/..., /admin).
 */
function serveFrontend(app: express.Express) {
  const dir = config.staticDir;
  const indexFile = path.join(dir, 'index.html');
  if (!existsSync(indexFile)) {
    console.warn(`[http] Không thấy ${indexFile} – chỉ chạy API. Hãy build frontend (npm run build) để có website.`);
    app.get('/', (_req, res) => {
      res.type('text/plain; charset=utf-8').send('API cổng thông tin đang chạy. Chưa có bản build frontend (npm run build).');
    });
    return;
  }
  app.use('/assets', express.static(path.join(dir, 'assets'), { index: false, immutable: true, maxAge: '1y', fallthrough: false }));
  app.use(express.static(dir, { index: false, setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache') }));
  app.get('/{*path}', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(indexFile);
  });
}

const staticErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) return next(err);
  const status = (err as { status?: number; statusCode?: number }).status ?? (err as { statusCode?: number }).statusCode;
  if (status && status >= 400 && status < 500) return void res.status(status).end();
  console.error('[http]', err);
  res.status(500).end();
};

export function createApp(services: Services) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.use(compression());
  app.use('/api', apiRouter(services));
  serveFrontend(app);
  app.use(staticErrorHandler);
  return app;
}
