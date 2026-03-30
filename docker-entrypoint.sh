#!/bin/sh
set -e

echo "Running database migrations..."
npx tsx server/db/migrate.ts

echo "Starting server..."
exec node .output/server/index.mjs
