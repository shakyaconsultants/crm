/**
 * Parsed phone digit string for Lead.phone (national format).
 * Supports 10–11 digits after normalizing; Excel often drops a leading 0 —
 * UK mobiles as 10 digits starting with `7` are stored as `07…` (11 digits).
 */

export function normalizeLeadPhone(raw: unknown): string {
  if (raw === null || raw === undefined || raw === '') return ''
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return String(Math.trunc(Math.abs(raw)))
  }
  return String(raw).replace(/\D/g, '')
}

/** Returns stored phone or null if not acceptable. */
export function parseLeadPhoneForStorage(raw: unknown): string | null {
  const d = normalizeLeadPhone(raw)
  if (!d) return null
  let out = d
  if (out.length === 10 && out.startsWith('7')) {
    out = `0${out}`
  }
  if (out.length === 10 || out.length === 11) return out
  return null
}

export const LEAD_PHONE_HELP_TEXT =
  '10–11 digits (spaces/symbols stripped). UK mobiles missing the leading 0 are fixed automatically (7… → 07…).'
