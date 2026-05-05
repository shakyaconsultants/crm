/** Monthly incentive from verified sales count (tier, not additive). */
export function incentiveForVerifiedSalesInMonth(count: number): number {
  if (count <= 0) return 0
  if (count >= 5) return 25000
  const tiers = [3000, 7000, 11000, 16000]
  return tiers[count - 1] ?? 0
}
