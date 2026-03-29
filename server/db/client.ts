import { Database } from 'bun:sqlite'

export const DB_PATH = process.env.DATABASE_PATH ?? '.data/db.sqlite'

export function createDatabase(path: string): Database {
  const sqlite = new Database(path, { create: true })
  sqlite.exec('PRAGMA journal_mode=WAL')
  sqlite.exec('PRAGMA foreign_keys=ON')
  return sqlite
}
