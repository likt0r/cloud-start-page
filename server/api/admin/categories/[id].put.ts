import { eq } from 'drizzle-orm'
import { db } from '../../../db/index'
import { categories } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid id' })

  const { title, icon, sortOrder } = await readBody(event)
  const patch = Object.fromEntries(
    Object.entries({ title, icon, sortOrder }).filter(([, v]) => v !== undefined)
  )

  if (Object.keys(patch).length === 0) {
    throw createError({ statusCode: 400, message: 'No fields to update' })
  }

  const [updated] = await db
    .update(categories)
    .set(patch)
    .where(eq(categories.id, id))
    .returning()

  if (!updated) throw createError({ statusCode: 404, message: 'Not found' })
  return updated
})
