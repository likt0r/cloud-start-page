import { db } from "../../../db/index";
import { categories } from "../../../db/schema";

export default defineEventHandler(async (event) => {
  const { title, icon, sortOrder } = await readBody(event);

  if (!title || !icon) {
    throw createError({ statusCode: 400, message: "title and icon are required" });
  }

  const [created] = await db
    .insert(categories)
    .values({ title, icon, sortOrder: sortOrder ?? 0 })
    .returning();

  setResponseStatus(event, 201);
  return created;
});
