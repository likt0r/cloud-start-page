import { eq } from 'drizzle-orm'
import { db } from '../../db/index'
import { services } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await assertAuthenticated(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid id' })

  const service = await db.query.services.findFirst({
    where: eq(services.id, id),
    with: { accessGroups: true, companionApps: true }
  })

  if (!service) throw createError({ statusCode: 404, message: 'Not found' })
  return service
})
