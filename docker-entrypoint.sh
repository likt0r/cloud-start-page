#!/bin/sh
set -e

echo "Running database migrations..."
bun server/db/migrate.ts

echo "Starting server..."
exec bun .output/server/index.mjs
