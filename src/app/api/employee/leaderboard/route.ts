import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { enforceEmployeeHub } from '@/lib/enforce-employee-auth'

export async function GET(req: NextRequest) {
  const gated = await enforceEmployeeHub(req)
  if (gated instanceof NextResponse) return gated

  try {
    const employees = await db.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: { id: true, name: true, profileImageUrl: true },
    })

    const withCounts = await Promise.all(
      employees.map(async (e) => ({
        id: e.id,
        name: e.name,
        profileImageUrl: e.profileImageUrl,
        verifiedCount: await db.lead.count({
          where: { assignedToId: e.id, verifiedSale: true },
        }),
      }))
    )

    withCounts.sort(
      (a, b) => b.verifiedCount - a.verifiedCount || a.name.localeCompare(b.name)
    )

    const top = withCounts.slice(0, 10).map((row, idx) => ({
      rank: idx + 1,
      id: row.id,
      name: row.name,
      profileImageUrl: row.profileImageUrl,
      verifiedCount: row.verifiedCount,
    }))

    return NextResponse.json({ leaderboard: top })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
