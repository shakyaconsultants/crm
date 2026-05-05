import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

const PREFIX_RE = /^(\d{4})-(\d{2})$/

function resolveMonth(search: URLSearchParams): string {
  const m = search.get('month')
  const now = new Date()
  const def = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  if (!m || !PREFIX_RE.test(m)) return def
  return m
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const prefix = resolveMonth(req.nextUrl.searchParams)
    const rows = await db.attendanceEntry.findMany({
      where: { dayKey: { startsWith: prefix } },
      include: { user: { select: { name: true, email: true, employeeId: true } } },
      orderBy: [{ dayKey: 'asc' }, { userId: 'asc' }],
      take: 800,
    })
    return NextResponse.json({ month: prefix, attendance: rows })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
