import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'
import { getLeadUpdatedAtRangeFromRequest } from '@/lib/adminDateRange'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const range = getLeadUpdatedAtRangeFromRequest(req)
    const u = range ? { updatedAt: { gte: range.gte, lte: range.lte } } : {}

    const advisors = await db.user.findMany({
      where: { role: 'ADVISOR' },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { name: 'asc' },
    })

    const perAdvisor = await Promise.all(
      advisors.map(async (a) => {
        const inQueue = await db.lead.count({
          where: { assignedAdvisorId: a.id, moveToAdvisor: true, ...u },
        })
        const linkedTotal = await db.lead.count({
          where: { assignedAdvisorId: a.id, ...u },
        })
        const verified = await db.lead.count({
          where: { assignedAdvisorId: a.id, verifiedSale: true, ...u },
        })
        const dropped = await db.lead.count({
          where: { assignedAdvisorId: a.id, closedSale: true, ...u },
        })
        const clawback = await db.lead.count({
          where: { assignedAdvisorId: a.id, caseStatus: 'CLAWBACK', ...u },
        })
        return {
          id: a.id,
          name: a.name,
          email: a.email,
          inQueue,
          linkedTotal,
          verified,
          dropped,
          clawback,
        }
      })
    )

    const totalInQueues = perAdvisor.reduce((s, p) => s + p.inQueue, 0)
    const totalLinkedLeads = await db.lead.count({
      where: { assignedAdvisorId: { not: null }, ...u },
    })

    const perAdvisorSorted = [...perAdvisor].sort(
      (a, b) =>
        b.verified - a.verified || b.dropped - a.dropped || b.clawback - a.clawback || b.inQueue - a.inQueue
    )

    return NextResponse.json({
      advisorCount: advisors.length,
      totalInQueues,
      totalLinkedLeads,
      perAdvisor: perAdvisorSorted,
      range: range
        ? { from: range.gte.toISOString().slice(0, 10), to: range.lte.toISOString().slice(0, 10) }
        : null,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
