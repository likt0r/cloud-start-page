import type { H3Event } from "h3";
import { getUserSession } from "./oidc-session";

function isDevBypass(event: H3Event): boolean {
  return !!useRuntimeConfig(event).devAuthBypass;
}

export async function assertAuthenticated(event: H3Event): Promise<void> {
  if (isDevBypass(event)) return;

  const session = await getUserSession(event);
  if (!session?.userName && !session?.userInfo) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
}

export async function assertAdmin(event: H3Event): Promise<void> {
  if (isDevBypass(event)) return;

  const session = await getUserSession(event);
  if (!session?.userName && !session?.userInfo) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const adminGroup = useRuntimeConfig(event).adminGroup;
  if (!adminGroup) {
    throw createError({ statusCode: 500, message: "ADMIN_GROUP is not configured" });
  }

  // Groups come from Keycloak userInfo endpoint or as a token claim via optionalClaims: ['groups']
  const groups = ((session.userInfo?.groups ?? session.claims?.groups) as string[] | undefined) ?? [];

  if (!groups.includes(adminGroup)) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
}
