import { eq } from 'drizzle-orm'
import { db } from '../../db/index'
import { siteSettings } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const patch: Partial<typeof siteSettings.$inferInsert> = {}
  if (typeof body.loginButtonText === 'string' && body.loginButtonText.trim()) {
    patch.loginButtonText = body.loginButtonText.trim()
  }
  if (typeof body.pageTitle === 'string' && body.pageTitle.trim()) {
    patch.pageTitle = body.pageTitle.trim()
  }
  if (typeof body.logoPath === 'string') patch.logoPath = body.logoPath
  if (typeof body.logoSmallPath === 'string') patch.logoSmallPath = body.logoSmallPath

  if (Object.keys(patch).length === 0) {
    throw createError({ statusCode: 400, message: 'No fields to update' })
  }

  const [updated] = await db
    .update(siteSettings)
    .set(patch)
    .where(eq(siteSettings.id, 1))
    .returning()

  return updated
})
