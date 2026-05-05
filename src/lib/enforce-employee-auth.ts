import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { employeeHasCrmAccess, type AppJwtClaims } from '@/lib/employee-jwt'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

type EmployeeAuth =
  | { ok: false; response: NextResponse }
  | { ok: true; userId: string; payload: AppJwtClaims }

export async function authenticateEmployeeJwt(req: NextRequest): Promise<EmployeeAuth> {
  const token = req.cookies.get('token')?.value
  if (!token)
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  try {
    const { payload } = await jwtVerify(token, secret)
    const p = payload as AppJwtClaims
    if (p.role !== 'EMPLOYEE')
      return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    return { ok: true, userId: p.id as string, payload: p }
  } catch {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
}

export async function enforceEmployeeHub(
  req: NextRequest
): Promise<{ userId: string } | NextResponse> {
  const a = await authenticateEmployeeJwt(req)
  if (!a.ok) return a.response
  return { userId: a.userId }
}

export async function enforceEmployeeWithCrm(
  req: NextRequest
): Promise<{ userId: string } | NextResponse> {
  const a = await authenticateEmployeeJwt(req)
  if (!a.ok) return a.response
  if (!employeeHasCrmAccess(a.payload)) {
    return NextResponse.json(
      { error: 'CRM verification required.', code: 'CRM_LOCKED', requiresCrmOtp: true },
      { status: 403 }
    )
  }
  return { userId: a.userId }
}
