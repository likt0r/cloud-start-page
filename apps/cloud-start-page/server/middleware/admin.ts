export default defineEventHandler(async (event) => {
  if (!getRequestURL(event).pathname.startsWith("/api/admin/")) return;
  await assertAdmin(event);
});
