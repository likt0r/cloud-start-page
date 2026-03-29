import { db } from '../../../db/index'
import { companionApps, serviceAccessGroups, services } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { categoryId, name, url, description, imagePath, sortOrder, accessGroups, companionApps: apps } = body

  if (!categoryId || !name || !url) {
    throw createError({ statusCode: 400, message: 'categoryId, name and url are required' })
  }

  return db.transaction((tx) => {
    const created = tx
      .insert(services)
      .values({ categoryId, name, url, description, imagePath, sortOrder: sortOrder ?? 0 })
      .returning()
      .all()[0]

    if (!created) throw createError({ statusCode: 500, message: 'Failed to create service' })

    if (accessGroups?.length) {
      tx.insert(serviceAccessGroups)
        .values(accessGroups.map((g: string) => ({ serviceId: created.id, keycloakGroup: g })))
        .run()
    }

    if (apps?.length) {
      tx.insert(companionApps)
        .values(apps.map((a: typeof companionApps.$inferInsert) => ({ ...a, serviceId: created.id })))
        .run()
    }

    return tx.query.services.findFirst({
      where: (s, { eq }) => eq(s.id, created.id),
      with: { accessGroups: true, companionApps: true }
    })
  })
})
