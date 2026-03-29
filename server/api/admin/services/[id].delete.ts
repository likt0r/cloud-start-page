import { eq } from 'drizzle-orm'
import { db } from '../../../db/index'
import { services } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid id' })

  const [deleted] = await db
    .delete(services)
    .where(eq(services.id, id))
    .returning()

  if (!deleted) throw createError({ statusCode: 404, message: 'Not found' })
  setResponseStatus(event, 204)
})
