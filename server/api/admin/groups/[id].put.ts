import { eq } from 'drizzle-orm'
import { db } from '../../../db/index'
import { groups, serviceAccessGroups } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid id' })

  const { name } = await readBody(event)
  if (!name?.trim()) throw createError({ statusCode: 400, message: 'name is required' })

  const existing = await db.select().from(groups).where(eq(groups.id, id)).get()
  if (!existing) throw createError({ statusCode: 404, message: 'Not found' })

  const newName = name.trim()
  const [updated] = await db.update(groups).set({ name: newName }).where(eq(groups.id, id)).returning()

  // Cascade: update all service access group assignments that used the old name
  if (existing.name !== newName) {
    await db
      .update(serviceAccessGroups)
      .set({ keycloakGroup: newName })
      .where(eq(serviceAccessGroups.keycloakGroup, existing.name))
  }

  return updated
})
