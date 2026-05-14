export const MAX_CSV_IMPORT_BYTES = 8 * 1024 * 1024
export const MAX_LEAD_DOCUMENT_BYTES = 12 * 1024 * 1024

export const ALLOWED_LEAD_IMPORT_MIME = new Set([
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/octet-stream',
])

export const ALLOWED_LEAD_DOCUMENT_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

export function hasAllowedMime(mime: string, allowed: Set<string>): boolean {
  const normalized = mime.toLowerCase().trim()
  if (!normalized) return false
  return allowed.has(normalized)
}

