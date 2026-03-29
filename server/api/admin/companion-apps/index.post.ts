import { eq } from 'drizzle-orm'
import { db } from '../../../db/index'
import { companionApps, services } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const { serviceId, name, platform, storeUrl, icon } = await readBody(event)

  if (!serviceId || !name) {
    throw createError({ statusCode: 400, message: 'serviceId and name are required' })
  }

  const parent = await db.query.services.findFirst({ where: eq(services.id, serviceId) })
  if (!parent) throw createError({ statusCode: 404, message: 'Service not found' })

  const [created] = await db
    .insert(companionApps)
    .values({ serviceId, name, platform, storeUrl, icon })
    .returning()

  setResponseStatus(event, 201)
  return created
})
