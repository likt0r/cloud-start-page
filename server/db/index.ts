import { drizzle } from 'drizzle-orm/bun-sqlite'
import { createDatabase, DB_PATH } from './client'
import * as schema from './schema'

export const db = drizzle(createDatabase(DB_PATH), { schema })
