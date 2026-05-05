import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'ADMIN')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = await req.json()

    const existing = await db.user.findFirst({
      where: { id, role: 'EMPLOYEE' },
    })
    if (!existing) return NextResponse.json({ error: 'Employee not found' }, { status: 404 })

    const raw = body.baseSalaryMonthly
    let baseSalaryMonthly: number | null = null
    if (raw === null || raw === '') {
      baseSalaryMonthly = null
    } else {
      const n = Number(raw)
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json({ error: 'Invalid base salary' }, { status: 400 })
      }
      baseSalaryMonthly = n
    }

    const updated = await db.user.update({
      where: { id },
      data: { baseSalaryMonthly },
      select: { id: true, name: true, email: true, baseSalaryMonthly: true, employeeId: true },
    })
    return NextResponse.json({ success: true, employee: updated })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
