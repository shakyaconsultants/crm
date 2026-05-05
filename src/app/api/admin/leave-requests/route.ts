import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const leaveRequests = await db.leaveRequest.findMany({
      where: status ? { status } : undefined,
      include: { user: { select: { name: true, email: true, employeeId: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    return NextResponse.json({ leaveRequests })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
