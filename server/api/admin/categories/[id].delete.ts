import { eq } from 'drizzle-orm'
import { db } from '../../../db/index'
import { categories } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid id' })

  const [deleted] = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning()

  if (!deleted) throw createError({ statusCode: 404, message: 'Not found' })
  setResponseStatus(event, 204)
})
