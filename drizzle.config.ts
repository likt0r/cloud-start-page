import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.NUXT_DB_PATH?.trim() ?? process.env.DATABASE_PATH?.trim() ?? ".data/db.sqlite"
  }
});
