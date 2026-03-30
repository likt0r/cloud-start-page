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
    "/": { prerender: true }
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

  // nuxt-oidc-auth's ./runtime/* export has no `types` condition in its exports map.
  // Add a path alias so both the app and server tsconfigs can resolve the import.
  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          "nuxt-oidc-auth/runtime/server/utils/session.js": [
            "../node_modules/nuxt-oidc-auth/dist/runtime/server/utils/session"
          ]
        }
      }
    }
  },

  nitro: {
    externals: {
      inline: [],
      external: ["bun:sqlite"]
    },
    typescript: {
      tsConfig: {
        compilerOptions: {
          paths: {
            "nuxt-oidc-auth/runtime/server/utils/session.js": [
              "../node_modules/nuxt-oidc-auth/dist/runtime/server/utils/session"
            ]
          }
        }
      }
    }
  },

  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs"
      }
    }
  }
});
