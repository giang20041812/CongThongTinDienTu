import { createApp, createServices } from './app.js';

/**
 * Entry for Vercel Functions (api/index.mjs): the same Express app without app.listen(), migrations or shutdown hooks.
 * Run `npm run db:migrate` against the database once before deploying.
 */
export default createApp(createServices());
