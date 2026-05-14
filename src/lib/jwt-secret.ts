export function getJwtSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET?.trim()
  if (!raw) {
    throw new Error('JWT_SECRET is not configured')
  }
  return new TextEncoder().encode(raw)
}

