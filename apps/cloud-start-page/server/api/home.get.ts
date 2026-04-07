import { asc } from "drizzle-orm";
import { db } from "../db/index";
import { categories } from "../db/schema";
import { getUserSession } from "../utils/oidc-session";

export default defineEventHandler(async (event) => {
  await assertAuthenticated(event);

  const session = await getUserSession(event);
  const userGroups = ((session.userInfo?.groups ?? session.claims?.groups) as string[] | undefined) ?? [];

  const allCategories = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder)],
    with: {
      services: {
        orderBy: (s, { asc: a }) => [a(s.sortOrder)],
        with: { accessGroups: true, companionApps: true }
      }
    }
  });

  return allCategories
    .map((cat) => ({
      ...cat,
      services: cat.services
        .filter((svc) => {
          if (svc.accessGroups.length === 0) return true;
          return svc.accessGroups.some((ag) => userGroups.includes(ag.keycloakGroup));
        })
        .map(({ accessGroups: _, ...svc }) => svc)
    }))
    .filter((cat) => cat.services.length > 0);
});
