import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { createDatabase, DB_PATH } from './client'

mkdirSync(dirname(DB_PATH), { recursive: true })

const sqlite = createDatabase(DB_PATH)
migrate(drizzle(sqlite), { migrationsFolder: import.meta.dirname + '/migrations' })
console.log('Database migrations applied successfully')
sqlite.close()
