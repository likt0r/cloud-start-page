import Database from "better-sqlite3";

export const DB_PATH =
  process.env.NUXT_DB_PATH?.trim() ?? process.env.DATABASE_PATH?.trim() ?? ".data/db.sqlite";

export function createDatabase(path: string): Database.Database {
  const sqlite = new Database(path);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return sqlite;
}
