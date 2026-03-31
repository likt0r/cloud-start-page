import { asc } from "drizzle-orm";
import { db } from "../../../db/index";
import { groups } from "../../../db/schema";

export default defineEventHandler(async () => {
  return db.select().from(groups).orderBy(asc(groups.name));
});
