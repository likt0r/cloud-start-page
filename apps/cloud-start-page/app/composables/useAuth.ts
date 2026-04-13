/**
 * Wraps `useOidcAuth` with an optional dev-mode bypass.
 * When `NUXT_PUBLIC_DEV_AUTH_BYPASS=true` (dev only), returns a fake
 * authenticated state so the app is usable without a running Keycloak.
 */
export function useAuth() {
  const { devAuthBypass } = useRuntimeConfig().public;

  if (devAuthBypass) {
    return {
      loggedIn: computed(() => true),
      user: ref({ userName: "dev-user" }),
      login: () => Promise.resolve(),
      logout: () => navigateTo("/"),
      fetch: () => Promise.resolve()
    };
  }

  return useOidcAuth();
}
