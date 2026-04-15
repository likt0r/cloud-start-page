# Build context must be the repo root (needs packages/ for workspace deps)
# docker build -f apps/cloud-start-page/Dockerfile .

# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# better-sqlite3 is a native addon — needs python3 + make + g++ to compile
RUN apk add --no-cache python3 make g++

# Copy workspace manifests first for layer caching
COPY package.json package-lock.json ./
COPY apps/cloud-start-page/package.json ./apps/cloud-start-page/
COPY packages/matrix-rain/package.json ./packages/matrix-rain/
COPY packages/theme/package.json ./packages/theme/
RUN npm ci

# Copy source
COPY apps/cloud-start-page ./apps/cloud-start-page
COPY packages/matrix-rain ./packages/matrix-rain
COPY packages/theme ./packages/theme

WORKDIR /app/apps/cloud-start-page
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production

# better-sqlite3 native addon requires python3 + make + g++ at install time
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install production dependencies only (includes better-sqlite3 + tsx for migrate)
COPY package.json package-lock.json ./
COPY apps/cloud-start-page/package.json ./apps/cloud-start-page/
COPY packages/matrix-rain/package.json ./packages/matrix-rain/
COPY packages/theme/package.json ./packages/theme/
RUN npm ci --omit=dev && npm install tsx

WORKDIR /app/apps/cloud-start-page

# Nuxt server output (standalone, no source needed)
COPY --from=builder /app/apps/cloud-start-page/.output ./.output

# Migration runner and migration files
COPY --from=builder /app/apps/cloud-start-page/server/db/migrate.ts ./server/db/migrate.ts
COPY --from=builder /app/apps/cloud-start-page/server/db/client.ts ./server/db/client.ts
COPY --from=builder /app/apps/cloud-start-page/server/db/migrations ./server/db/migrations

COPY apps/cloud-start-page/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
# Override in compose/deployment: path inside the mounted volume
ENV DATABASE_PATH=/data/db.sqlite
ENV PORT=3000

EXPOSE 3000

VOLUME ["/data"]

ENTRYPOINT ["./docker-entrypoint.sh"]
