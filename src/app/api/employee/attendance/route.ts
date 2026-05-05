import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { enforceEmployeeHub } from '@/lib/enforce-employee-auth'

const PREFIX_RE = /^(\d{4})-(\d{2})$/
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/

function monthPrefixFromReq(req: NextRequest): string {
  const m = req.nextUrl.searchParams.get('month')
  const now = new Date()
  const def = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  if (!m || !PREFIX_RE.test(m)) return def
  return m
}

export async function GET(req: NextRequest) {
  const gated = await enforceEmployeeHub(req)
  if (gated instanceof NextResponse) return gated
  try {
    const prefix = monthPrefixFromReq(req)
    const rows = await db.attendanceEntry.findMany({
      where: {
        userId: gated.userId,
        dayKey: { startsWith: prefix },
      },
      orderBy: { dayKey: 'asc' },
    })
    return NextResponse.json({ month: prefix, attendance: rows })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const gated = await enforceEmployeeHub(req)
  if (gated instanceof NextResponse) return gated
  try {
    const body = await req.json()
    const dayKey = typeof body.dayKey === 'string' ? body.dayKey.trim() : ''
    const kind = body.kind === 'HALF_DAY' ? 'HALF_DAY' : body.kind === 'FULL_DAY' ? 'FULL_DAY' : ''
    if (!DAY_RE.test(dayKey) || !kind) {
      return NextResponse.json({ error: 'dayKey YYYY-MM-DD and kind FULL_DAY|HALF_DAY required.' }, { status: 400 })
    }

    const row = await db.attendanceEntry.upsert({
      where: {
        userId_dayKey: { userId: gated.userId, dayKey },
      },
      update: {
        kind,
        status: 'PENDING',
        reviewerId: null,
        reviewedAt: null,
      },
      create: {
        userId: gated.userId,
        dayKey,
        kind,
        status: 'PENDING',
      },
    })
    return NextResponse.json({ success: true, attendance: row })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
