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
    const userId = payload.id as string

    if (payload.role !== 'ADVISOR') {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const leads = await db.lead.findMany({
      where: { 
         assignedAdvisorId: userId,
         moveToAdvisor: true // Only see leads that the employee has explicitly forwarded
      },
      include: {
        assignedTo: { select: { name: true } },
        _count: { select: { documents: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ leads })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
