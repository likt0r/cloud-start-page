import { asc } from 'drizzle-orm'
import { db } from '../../db/index'
import { categories } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await assertAuthenticated(event)
  return db.select().from(categories).orderBy(asc(categories.sortOrder))
})
