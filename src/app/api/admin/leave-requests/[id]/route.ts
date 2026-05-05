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
    const status = body.status === 'APPROVED' || body.status === 'REJECTED' ? body.status : null
    if (!status) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
    }

    const updated = await db.leaveRequest.update({
      where: { id },
      data: {
        status,
        reviewerId: payload.id as string,
        reviewedAt: new Date(),
      },
    })
    return NextResponse.json({ success: true, leaveRequest: updated })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
