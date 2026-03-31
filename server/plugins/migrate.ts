import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { createDatabase, DB_PATH } from '../db/client'

export default defineNitroPlugin(() => {
  mkdirSync(dirname(DB_PATH), { recursive: true })
  const sqlite = createDatabase(DB_PATH)
  try {
    migrate(drizzle(sqlite), {
      migrationsFolder: join(process.cwd(), 'server/db/migrations')
    })
  } catch (err) {
    console.error('[migrate] Migration failed:', err)
    throw err
  } finally {
    sqlite.close()
  }
})
