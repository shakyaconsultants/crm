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

    const totalLeads = await db.lead.count({ where: u })
    const moveCount = await db.lead.count({ where: { moveToAdvisor: true, ...u } })
    const droppedCount = await db.lead.count({ where: { closedSale: true, ...u } })
    const verifiedCount = await db.lead.count({ where: { verifiedSale: true, ...u } })
    const clawbackCount = await db.lead.count({ where: { caseStatus: 'CLAWBACK', ...u } })
    const paymentCount = await db.lead.count({ where: { paymentReceived: true, ...u } })

    const totalCalls = await db.lead.count({
      where: { disposition: { not: 'New' }, ...u },
    })

    const recentActivity = await db.lead.findMany({
      where: { disposition: { not: 'New' }, ...u },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: { assignedTo: { select: { name: true } } },
    })

    const employeesData = await db.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: {
        name: true,
        leadsAsEmployee: {
          where: range ? { updatedAt: { gte: range.gte, lte: range.lte } } : undefined,
          select: { closedSale: true, verifiedSale: true, caseStatus: true },
        },
      },
    })

    const leaderboard = employeesData
      .map((emp) => ({
        name: emp.name,
        droppedCount: emp.leadsAsEmployee.filter((l) => l.closedSale).length,
        verifiedCount: emp.leadsAsEmployee.filter((l) => l.verifiedSale).length,
        clawbackCount: emp.leadsAsEmployee.filter((l) => l.caseStatus === 'CLAWBACK').length,
      }))
      .sort(
        (a, b) =>
          b.verifiedCount - a.verifiedCount ||
          b.droppedCount - a.droppedCount ||
          b.clawbackCount - a.clawbackCount
      )

    return NextResponse.json({
      totalLeads,
      moveCount,
      droppedCount,
      verifiedCount,
      clawbackCount,
      paymentCount,
      totalCalls,
      recentActivity,
      leaderboard,
      range: range
        ? { from: range.gte.toISOString().slice(0, 10), to: range.lte.toISOString().slice(0, 10) }
        : null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
