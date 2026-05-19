import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { enforceEmployeeHub } from '@/lib/enforce-employee-auth'
import { startOfMonth, endOfMonth } from 'date-fns'
import { countVerifiedForEmployee, type EmployeeVerifiedRow } from '@/lib/verified-month'

type LeaderboardRow = EmployeeVerifiedRow & { rank: number }

async function buildLeaderboard(
  monthStart: Date,
  monthEnd: Date
): Promise<LeaderboardRow[]> {
  const employees = await db.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: { id: true, name: true, profileImageUrl: true },
  })

  const withCounts = await Promise.all(
    employees.map(async (e) => ({
      id: e.id,
      name: e.name,
      profileImageUrl: e.profileImageUrl,
      verifiedCount: await countVerifiedForEmployee(db, e.id, monthStart, monthEnd),
    }))
  )

  withCounts.sort(
    (a, b) => b.verifiedCount - a.verifiedCount || a.name.localeCompare(b.name)
  )

  return withCounts.slice(0, 10).map((row, idx) => ({ ...row, rank: idx + 1 }))
}

export async function GET(req: NextRequest) {
  const gated = await enforceEmployeeHub(req)
  if (gated instanceof NextResponse) return gated

  try {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const leaderboard = await buildLeaderboard(monthStart, monthEnd)

    return NextResponse.json({
      leaderboard,
      month: monthStart.toISOString(),
      usingFallback: false,
    })
  } catch (err) {
    console.error('[leaderboard]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
