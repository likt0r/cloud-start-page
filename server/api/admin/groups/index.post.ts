import { db } from '../../../db/index'
import { groups } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const { name } = await readBody(event)
  if (!name?.trim()) throw createError({ statusCode: 400, message: 'name is required' })

  const [created] = await db.insert(groups).values({ name: name.trim() }).returning()
  setResponseStatus(event, 201)
  return created
})
