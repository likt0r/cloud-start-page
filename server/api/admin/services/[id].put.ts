import { eq } from "drizzle-orm";
import { db } from "../../../db/index";
import { serviceAccessGroups, services } from "../../../db/schema";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (isNaN(id)) throw createError({ statusCode: 400, message: "Invalid id" });

  const { categoryId, name, url, description, imagePath, sortOrder, accessGroups } = await readBody(event);

  await db.transaction((tx) => {
    const patch = Object.fromEntries(
      Object.entries({ categoryId, name, url, description, imagePath, sortOrder }).filter(
        ([, v]) => v !== undefined
      )
    );

    if (Object.keys(patch).length > 0) {
      const [updated] = tx.update(services).set(patch).where(eq(services.id, id)).returning().all();
      if (!updated) throw createError({ statusCode: 404, message: "Not found" });
    }

    if (Array.isArray(accessGroups)) {
      tx.delete(serviceAccessGroups).where(eq(serviceAccessGroups.serviceId, id)).run();
      if (accessGroups.length > 0) {
        tx.insert(serviceAccessGroups)
          .values(accessGroups.map((g: string) => ({ serviceId: id, keycloakGroup: g })))
          .run();
      }
    }
  });

  const updated = await db.query.services.findFirst({
    where: (s, { eq: e }) => e(s.id, id),
    with: { accessGroups: true, companionApps: true }
  });

  if (!updated) throw createError({ statusCode: 404, message: "Not found" });
  return updated;
});
