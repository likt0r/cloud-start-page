import { deleteCookie, defineEventHandler, getRequestURL, sendRedirect, useSession } from "h3";
import { withQuery } from "ufo";

const SESSION_NAME = "nuxt-oidc-auth";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const keycloak = runtimeConfig.oidc.providers.keycloak as {
    baseUrl: string;
    clientId: string;
    logoutRedirectUri?: string;
  };

  const logoutRedirectUri = keycloak.logoutRedirectUri || getRequestURL(event).origin;

  let idToken: string | undefined;

  try {
    const session = await useSession(event, {
      name: SESSION_NAME,
      password: process.env.NUXT_OIDC_SESSION_SECRET!
    });

    const sessionId = session.id;
    const tokenKey = process.env.NUXT_OIDC_TOKEN_KEY!;

    const persistentSession = await useStorage("oidc").getItem<{
      idToken?: { encryptedToken: string; iv: string };
    }>(sessionId);

    if (persistentSession?.idToken) {
      const { subtle } = await import("uncrypto");
      const { base64ToUint8Array } = await import("undio");

      const secretKey = await subtle.importKey(
        "raw",
        base64ToUint8Array(tokenKey),
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      const { encryptedToken, iv } = persistentSession.idToken;
      const encryptedBytes = base64ToUint8Array(encryptedToken);
      const ivBytes = base64ToUint8Array(iv);

      const decrypted = await subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, secretKey, encryptedBytes);

      idToken = new TextDecoder().decode(decrypted);
    }

    await useStorage("oidc").removeItem(sessionId);
    await session.clear();
  } catch {
    // session already gone — proceed with logout anyway
  }

  deleteCookie(event, SESSION_NAME);

  const logoutUrl = `${keycloak.baseUrl}/protocol/openid-connect/logout`;

  const location = withQuery(logoutUrl, {
    post_logout_redirect_uri: logoutRedirectUri,
    ...(idToken ? { id_token_hint: idToken } : { client_id: keycloak.clientId })
  });

  return sendRedirect(event, location, 302);
});
