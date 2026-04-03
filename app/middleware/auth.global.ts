export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, login } = useOidcAuth();
  if (!loggedIn.value) {
    return login();
  }
});
