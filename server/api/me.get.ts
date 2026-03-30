import { getUserSession } from '../utils/oidc-session'

export default defineEventHandler(async (event) => {
  await assertAuthenticated(event)
  const session = await getUserSession(event)

  const groups = (
    (session.claims?.groups ?? session.userInfo?.groups) as string[] | undefined
  ) ?? []

  const scopeString = session.claims?.scope as string | undefined
  const scopes = scopeString ? scopeString.split(' ').filter(Boolean) : []

  return {
    userName: session.userName ?? (session.userInfo?.preferred_username as string | undefined),
    groups,
    scopes,
    expireAt: session.expireAt,
  }
})
