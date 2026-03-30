import { asc } from 'drizzle-orm'
import { db } from '../../db/index'
import { categories } from '../../db/schema'

export default defineEventHandler(async () => {
  return db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder)],
    with: {
      services: {
        orderBy: (s, { asc: a }) => [a(s.sortOrder)],
        with: { accessGroups: true, companionApps: true }
      }
    }
  })
})
