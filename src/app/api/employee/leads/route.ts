import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { enforceEmployeeWithCrm } from '@/lib/enforce-employee-auth'

export async function GET(req: NextRequest) {
  const gated = await enforceEmployeeWithCrm(req)
  if (gated instanceof NextResponse) return gated

  try {
    const leads = await db.lead.findMany({
      where: { assignedToId: gated.userId },
      orderBy: { assignedDate: 'desc' },
    })

    const response = NextResponse.json({ leads })
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
