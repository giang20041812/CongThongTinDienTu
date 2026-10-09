# One image for the whole site: the Node server answers /api and serves the built React app.
# Only needed on hosts that deploy a Dockerfile; Vibe Host-style platforms build from package.json directly.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/package.json ./backend/
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/db ./backend/db
COPY --from=build /app/frontend/dist ./frontend/dist
USER node
EXPOSE 8080
CMD ["node", "--enable-source-maps", "backend/dist/server.js"]
