# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# better-sqlite3 is a native addon — needs python3 + make + g++ to compile
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production
WORKDIR /app

# better-sqlite3 native addon requires python3 + make + g++ at install time
RUN apk add --no-cache python3 make g++

# Install production dependencies only (includes better-sqlite3 + tsx for migrate)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install tsx

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
