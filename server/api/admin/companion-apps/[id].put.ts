import { eq } from "drizzle-orm";
import { db } from "../../../db/index";
import { companionApps } from "../../../db/schema";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (isNaN(id)) throw createError({ statusCode: 400, message: "Invalid id" });

  const { name, platform, storeUrl, icon } = await readBody(event);
  const patch = Object.fromEntries(
    Object.entries({ name, platform, storeUrl, icon }).filter(([, v]) => v !== undefined)
  );

  if (Object.keys(patch).length === 0) {
    throw createError({ statusCode: 400, message: "No fields to update" });
  }

  const [updated] = await db.update(companionApps).set(patch).where(eq(companionApps.id, id)).returning();

  if (!updated) throw createError({ statusCode: 404, message: "Not found" });
  return updated;
});
