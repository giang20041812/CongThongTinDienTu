// Vercel Function: mọi request /api/* được vercel.json chuyển về đây. Backend build sẵn ở backend/dist (npm run build).
export { default } from '../backend/dist/vercel.js';
