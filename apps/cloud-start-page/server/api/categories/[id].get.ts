import { eq } from "drizzle-orm";
import { db } from "../../db/index";
import { categories } from "../../db/schema";

export default defineEventHandler(async (event) => {
  await assertAuthenticated(event);

  const id = Number(getRouterParam(event, "id"));
  if (isNaN(id)) throw createError({ statusCode: 400, message: "Invalid id" });

  const category = await db.query.categories.findFirst({
    where: eq(categories.id, id),
    with: { services: { orderBy: (s, { asc }) => [asc(s.sortOrder)] } }
  });

  if (!category) throw createError({ statusCode: 404, message: "Not found" });
  return category;
});
