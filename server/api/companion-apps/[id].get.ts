import { eq } from 'drizzle-orm'
import { db } from '../../db/index'
import { companionApps } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await assertAuthenticated(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid id' })

  const app = await db.query.companionApps.findFirst({
    where: eq(companionApps.id, id)
  })

  if (!app) throw createError({ statusCode: 404, message: 'Not found' })
  return app
})
