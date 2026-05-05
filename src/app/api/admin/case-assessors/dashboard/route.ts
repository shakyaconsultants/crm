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

    const assessors = await db.user.findMany({
      where: { role: 'CASE_ASSESSOR' },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { name: 'asc' },
    })

    const perAssessor = await Promise.all(
      assessors.map(async (a) => {
        const assignedTotal = await db.lead.count({
          where: { assignedCaseAssessorId: a.id, ...u },
        })
        const verified = await db.lead.count({
          where: { assignedCaseAssessorId: a.id, verifiedSale: true, ...u },
        })
        const dropped = await db.lead.count({
          where: { assignedCaseAssessorId: a.id, closedSale: true, ...u },
        })
        const clawback = await db.lead.count({
          where: { assignedCaseAssessorId: a.id, caseStatus: 'CLAWBACK', ...u },
        })
        const payments = await db.lead.count({
          where: { assignedCaseAssessorId: a.id, paymentReceived: true, ...u },
        })
        return {
          id: a.id,
          name: a.name,
          email: a.email,
          assignedTotal,
          verified,
          dropped,
          clawback,
          payments,
        }
      })
    )

    const sorted = [...perAssessor].sort(
      (a, b) => b.verified - a.verified || b.dropped - a.dropped || b.clawback - a.clawback
    )

    const totalAssignedLeads = await db.lead.count({
      where: { assignedCaseAssessorId: { not: null }, ...u },
    })

    return NextResponse.json({
      assessorCount: assessors.length,
      totalAssignedLeads,
      perAssessor: sorted,
      range: range
        ? { from: range.gte.toISOString().slice(0, 10), to: range.lte.toISOString().slice(0, 10) }
        : null,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
