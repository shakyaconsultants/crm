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
    const userId = payload.id as string

    if (payload.role !== 'CASE_ASSESSOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const range = getLeadUpdatedAtRangeFromRequest(req)
    const updatedFilter = range ? { updatedAt: { gte: range.gte, lte: range.lte } } : {}

    const leads = await db.lead.findMany({
      where: { assignedCaseAssessorId: userId, ...updatedFilter },
      include: {
        assignedTo: { select: { name: true } },
        assignedAdvisor: { select: { name: true } },
        _count: { select: { documents: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({
      leads,
      range: range
        ? { from: range.gte.toISOString().slice(0, 10), to: range.lte.toISOString().slice(0, 10) }
        : null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
