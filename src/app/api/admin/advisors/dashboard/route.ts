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
        const transferredFromEmployee = await db.lead.count({
          where: { assignedAdvisorId: a.id, moveToAdvisor: true, ...u },
        })
        const forwardedToCaseAssessor = await db.lead.count({
          where: { assignedAdvisorId: a.id, assignedCaseAssessorId: { not: null }, ...u },
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
          transferredFromEmployee,
          forwardedToCaseAssessor,
          verified,
          dropped,
          clawback,
        }
      })
    )

    const totalTransferredFromEmployee = perAdvisor.reduce((s, p) => s + p.transferredFromEmployee, 0)
    const totalForwardedToCaseAssessor = perAdvisor.reduce((s, p) => s + p.forwardedToCaseAssessor, 0)
    const totalDropped = perAdvisor.reduce((s, p) => s + p.dropped, 0)
    const totalVerified = perAdvisor.reduce((s, p) => s + p.verified, 0)
    const totalClawback = perAdvisor.reduce((s, p) => s + p.clawback, 0)

    const perAdvisorSorted = [...perAdvisor].sort(
      (a, b) =>
        b.verified - a.verified ||
        b.dropped - a.dropped ||
        b.clawback - a.clawback ||
        b.forwardedToCaseAssessor - a.forwardedToCaseAssessor
    )

    return NextResponse.json({
      advisorCount: advisors.length,
      totalTransferredFromEmployee,
      totalForwardedToCaseAssessor,
      totalDropped,
      totalVerified,
      totalClawback,
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
