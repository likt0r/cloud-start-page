import { drizzle } from 'drizzle-orm/better-sqlite3'
import { createDatabase, DB_PATH } from './client'
import * as schema from './schema'

export const db = drizzle(createDatabase(DB_PATH), { schema })
