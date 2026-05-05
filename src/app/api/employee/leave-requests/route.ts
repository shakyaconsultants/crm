import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { enforceEmployeeHub } from '@/lib/enforce-employee-auth'

export async function GET(req: NextRequest) {
  const gated = await enforceEmployeeHub(req)
  if (gated instanceof NextResponse) return gated

  try {
    const list = await db.leaveRequest.findMany({
      where: { userId: gated.userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json({ leaveRequests: list })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const gated = await enforceEmployeeHub(req)
  if (gated instanceof NextResponse) return gated

  try {
    const body = await req.json()
    const start = new Date(body.startDate)
    const end = new Date(body.endDate)
    const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 2000) : ''
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return NextResponse.json({ error: 'Valid start and end dates required.' }, { status: 400 })
    }
    const row = await db.leaveRequest.create({
      data: {
        userId: gated.userId,
        startDate: start,
        endDate: end,
        reason: reason || undefined,
        status: 'PENDING',
      },
    })
    return NextResponse.json({ success: true, leaveRequest: row })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
