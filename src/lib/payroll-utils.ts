/** Monday–Friday count in UTC month (month is 1–12). */
export function weekdayCountInMonth(year: number, month: number): number {
  const monthIdx = month - 1
  let total = 0
  const d = new Date(Date.UTC(year, monthIdx, 1))
  while (d.getUTCMonth() === monthIdx) {
    const dow = d.getUTCDay()
    if (dow >= 1 && dow <= 5) total++
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return Math.max(total, 1)
}

export function monthBoundsUtc(year: number, month: number): { start: Date; end: Date } {
  const monthIdx = month - 1
  const start = new Date(Date.UTC(year, monthIdx, 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(year, monthIdx + 1, 0, 23, 59, 59, 999))
  return { start, end }
}

export function attendanceKindToUnits(kind: string): number {
  if (kind === 'HALF_DAY') return 0.5
  return 1
}
