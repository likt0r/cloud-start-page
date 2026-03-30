// https://nuxt.com/docs/api/configuration/nuxt-config
// get-port-please (Vite HMR) walks all interfaces when HOST is unset; on some machines
// one interface fails the bind check and dev exits with GetPortError. Prefer loopback.
if (process.env.NODE_ENV !== "production" && process.env.HOST == null) {
  process.env.HOST = "127.0.0.1";
}

export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "nuxt-oidc-auth"],

  devtools: {
    enabled: true
  },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { ssr: true }
  },

  // nuxt-oidc-auth dist files import from "#imports" (a Nuxt virtual module).
  // Without this, vite-node's SSR module runner cannot resolve "#imports" from
  // the pre-built node_modules files and throws:
  // "File URL path must not include encoded / characters"
  build: {
    transpile: ["nuxt-oidc-auth"]
  },

  oidc: {
    defaultProvider: "keycloak",
    providers: {
      keycloak: {
        baseUrl: process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_BASE_URL ?? "",
        clientId: process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_ID ?? "",
        clientSecret: process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_SECRET ?? "",
        redirectUri: process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_REDIRECT_URI ?? "",
        userNameClaim: "preferred_username",
        optionalClaims: ["groups"]
      }
    },
    session: {
      expirationCheck: true,
      automaticRefresh: true
    },
    middleware: {
      globalMiddlewareEnabled: false
    }
  },

  compatibilityDate: "2025-01-15"
});
