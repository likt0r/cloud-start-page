import { mkdirSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { randomUUID } from 'node:crypto'

const MAX_SIZE = 2 * 1024 * 1024 // 2 MB

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
}

export default defineEventHandler(async (event) => {
  const { uploadDir } = useRuntimeConfig(event)
  const parts = await readMultipartFormData(event)

  const filePart = parts?.find((p) => p.name === 'file')
  if (!filePart?.data) {
    throw createError({ statusCode: 400, message: 'No file provided' })
  }

  const mime = filePart.type ?? ''
  if (!mime.startsWith('image/') || !MIME_TO_EXT[mime]) {
    throw createError({ statusCode: 400, message: 'File must be an image (JPEG, PNG, GIF, WebP, SVG, AVIF)' })
  }

  if (filePart.data.length > MAX_SIZE) {
    throw createError({ statusCode: 400, message: 'File exceeds 2 MB limit' })
  }

  const ext = MIME_TO_EXT[mime] ?? extname(filePart.filename ?? '') ?? '.bin'
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`

  mkdirSync(uploadDir, { recursive: true })
  writeFileSync(join(uploadDir, filename), filePart.data)

  return { path: `/uploads/${filename}` }
})
