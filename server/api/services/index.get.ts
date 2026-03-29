import { asc, eq } from 'drizzle-orm'
import { db } from '../../db/index'
import { services } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await assertAuthenticated(event)

  const categoryId = getQuery(event).categoryId
  const where = categoryId ? eq(services.categoryId, Number(categoryId)) : undefined

  return db.query.services.findMany({
    where,
    with: { accessGroups: true, companionApps: true },
    orderBy: [asc(services.sortOrder)]
  })
})
