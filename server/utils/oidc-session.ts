// nuxt-oidc-auth's ./runtime/* subpath export has no `types` condition in its
// package.json exports map. A path alias in nuxt.config.ts resolves the types.
export { getUserSession } from 'nuxt-oidc-auth/runtime/server/utils/session.js'
