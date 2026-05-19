import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { enforceEmployeeHub } from '@/lib/enforce-employee-auth'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { countVerifiedForEmployee } from '@/lib/verified-month'

export async function GET(req: NextRequest) {
  const gated = await enforceEmployeeHub(req)
  if (gated instanceof NextResponse) return gated

  try {
    const now = new Date()
    const awardMonthStart = startOfMonth(subMonths(now, 1))
    const awardMonthEnd = endOfMonth(subMonths(now, 1))
    const risingStarTenureStart = subMonths(awardMonthEnd, 3)

    const employees = await db.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: { id: true, name: true, profileImageUrl: true, createdAt: true },
    })

    const withCounts = await Promise.all(
      employees.map(async (e) => ({
        id: e.id,
        name: e.name,
        profileImageUrl: e.profileImageUrl,
        joinedAt: e.createdAt,
        verifiedCount: await countVerifiedForEmployee(db, e.id, awardMonthStart, awardMonthEnd),
      }))
    )

    withCounts.sort((a, b) => b.verifiedCount - a.verifiedCount)

    const pick = (row: (typeof withCounts)[0] | undefined) =>
      row && row.verifiedCount > 0
        ? {
            id: row.id,
            name: row.name,
            profileImageUrl: row.profileImageUrl,
            verifiedCount: row.verifiedCount,
          }
        : null

    const employeeOfMonth = pick(withCounts.find((e) => e.verifiedCount > 0))

    const risingStar = pick(
      withCounts
        .filter(
          (e) =>
            e.verifiedCount > 0 &&
            e.joinedAt >= risingStarTenureStart &&
            e.joinedAt <= awardMonthEnd
        )
        .sort((a, b) => b.verifiedCount - a.verifiedCount)[0]
    )

    return NextResponse.json({
      employeeOfMonth,
      risingStar,
      month: awardMonthStart.toISOString(),
    })
  } catch (err) {
    console.error('[monthly-stars]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
