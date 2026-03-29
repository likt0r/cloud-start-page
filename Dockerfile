# Stage 1: Build
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Stage 2: Production
FROM oven/bun:1-alpine AS production
WORKDIR /app

# Install production dependencies (drizzle-orm needed by migration runner at runtime)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Nuxt server output (standalone, no source needed)
COPY --from=builder /app/.output ./.output

# Migration runner and migration files
COPY --from=builder /app/server/db/migrate.ts ./server/db/migrate.ts
COPY --from=builder /app/server/db/migrations ./server/db/migrations

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
# Override in compose/deployment: path inside the mounted volume
ENV DATABASE_PATH=/data/db.sqlite
ENV PORT=3000

EXPOSE 3000

VOLUME ["/data"]

ENTRYPOINT ["./docker-entrypoint.sh"]
