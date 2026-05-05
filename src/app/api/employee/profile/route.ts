import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { enforceEmployeeHub } from '@/lib/enforce-employee-auth'

export async function PATCH(req: NextRequest) {
  const gated = await enforceEmployeeHub(req)
  if (gated instanceof NextResponse) return gated

  try {
    const body = await req.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name || name.length > 120) {
      return NextResponse.json({ error: 'Valid name required (max 120 chars).' }, { status: 400 })
    }
    await db.user.update({
      where: { id: gated.userId },
      data: { name },
    })
    return NextResponse.json({ success: true, name })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
