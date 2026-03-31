import { eq } from "drizzle-orm";
import { db } from "../../../db/index";
import { groups, serviceAccessGroups } from "../../../db/schema";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (isNaN(id)) throw createError({ statusCode: 400, message: "Invalid id" });

  const existing = await db.select().from(groups).where(eq(groups.id, id)).get();
  if (!existing) throw createError({ statusCode: 404, message: "Not found" });

  // Cascade: remove all service access group assignments using this group name
  await db.delete(serviceAccessGroups).where(eq(serviceAccessGroups.keycloakGroup, existing.name));

  await db.delete(groups).where(eq(groups.id, id));
  setResponseStatus(event, 204);
});
