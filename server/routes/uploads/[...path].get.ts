import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif"
};

export default defineEventHandler((event) => {
  const { uploadDir } = useRuntimeConfig(event);
  const param = getRouterParam(event, "path") ?? "";

  const absUploadDir = resolve(uploadDir);
  const filePath = resolve(join(absUploadDir, param));

  // Prevent path traversal
  if (!filePath.startsWith(absUploadDir + "/") && filePath !== absUploadDir) {
    throw createError({ statusCode: 403 });
  }

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404 });
  }

  const ext = extname(filePath).toLowerCase();
  const stat = statSync(filePath);
  setResponseHeader(event, "Content-Type", MIME[ext] ?? "application/octet-stream");
  setResponseHeader(event, "Content-Length", stat.size);
  setResponseHeader(event, "Cache-Control", "public, max-age=31536000, immutable");

  return sendStream(event, createReadStream(filePath));
});
