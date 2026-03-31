import { eq } from 'drizzle-orm'
import { db } from '../db/index'
import { siteSettings } from '../db/schema'

export default defineEventHandler(async () => {
  const row = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).get()
  return row ?? {
    loginButtonText: 'Login',
    pageTitle: 'Cloud Start Page',
    logoPath: '',
    logoSmallPath: ''
  }
})
