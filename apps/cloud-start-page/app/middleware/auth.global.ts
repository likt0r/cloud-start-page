export default defineNuxtRouteMiddleware(async (to) => {
  if (useRuntimeConfig().public.devAuthBypass) return;

  // OIDC login/callback/logout — never chain another login() here (avoids redirect loops on errors)
  if (to.path.startsWith("/auth/")) {
    return;
  }

  const { loggedIn, login, fetch } = useOidcAuth();
  await fetch();

  if (!loggedIn.value) {
    return login(undefined, { callbackRedirectUrl: to.fullPath });
  }
});
