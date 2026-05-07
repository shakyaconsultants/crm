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

    const cases = await db.lead.findMany({
      where: { assignedCaseAssessorId: { not: null } },
      include: {
        assignedTo: { select: { name: true } },
        assignedAdvisor: { select: { name: true } },
        assignedCaseAssessor: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ cases })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

