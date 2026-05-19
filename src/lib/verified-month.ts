import { Prisma } from '@prisma/client'
import type { PrismaClient } from '@prisma/client'

/**
 * Leads verified in a calendar month.
 * - Prefer verifiedAt when set.
 * - Legacy rows: verifiedSale + no verifiedAt (null or field missing) → use updatedAt in range.
 */
export function verifiedInMonthFilter(monthStart: Date, monthEnd: Date): Prisma.LeadWhereInput {
  return {
    verifiedSale: true,
    OR: [
      { verifiedAt: { gte: monthStart, lte: monthEnd } },
      {
        updatedAt: { gte: monthStart, lte: monthEnd },
        OR: [{ verifiedAt: null }, { verifiedAt: { isSet: false } }],
      },
    ],
  }
}

/** When Prisma client lacks verifiedAt (stale generate). */
function legacyMonthFilter(monthStart: Date, monthEnd: Date): Prisma.LeadWhereInput {
  return {
    verifiedSale: true,
    updatedAt: { gte: monthStart, lte: monthEnd },
  }
}

export type EmployeeVerifiedRow = {
  id: string
  name: string
  profileImageUrl: string | null
  verifiedCount: number
}

export async function countVerifiedForEmployee(
  db: PrismaClient,
  employeeId: string,
  monthStart: Date,
  monthEnd: Date
): Promise<number> {
  const monthFilter = verifiedInMonthFilter(monthStart, monthEnd)
  try {
    return await db.lead.count({
      where: { assignedToId: employeeId, ...monthFilter },
    })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientValidationError &&
      String(err.message).includes('verifiedAt')
    ) {
      return db.lead.count({
        where: { assignedToId: employeeId, ...legacyMonthFilter(monthStart, monthEnd) },
      })
    }
    throw err
  }
}
