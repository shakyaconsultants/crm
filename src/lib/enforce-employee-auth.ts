import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { employeeHasCrmAccess, type AppJwtClaims } from '@/lib/employee-jwt'
import {
  CRM_SESSION_COOKIE,
  isCrmSessionPayload,
} from '@/lib/employee-crm-session'
import { getJwtSecret } from '@/lib/jwt-secret'

const secret = getJwtSecret()

type EmployeeAuth =
  | { ok: false; response: NextResponse }
  | { ok: true; userId: string; payload: AppJwtClaims }

async function verifyJwt(value: string | undefined): Promise<AppJwtClaims | null> {
  if (!value) return null
  try {
    const { payload } = await jwtVerify(value, secret)
    return payload as AppJwtClaims
  } catch {
    return null
  }
}

async function authenticateFromCrmSession(
  req: NextRequest
): Promise<EmployeeAuth | null> {
  const crmJwt = req.cookies.get(CRM_SESSION_COOKIE)?.value
  const payload = await verifyJwt(crmJwt)
  if (!payload || !isCrmSessionPayload(payload)) return null
  return { ok: true, userId: payload.id as string, payload }
}

export async function authenticateEmployeeJwt(req: NextRequest): Promise<EmployeeAuth> {
  const crmAuth = await authenticateFromCrmSession(req)
  if (crmAuth) return crmAuth

  const token = req.cookies.get('token')?.value
  if (!token)
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const payload = await verifyJwt(token)
  if (!payload || payload.role !== 'EMPLOYEE')
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { ok: true, userId: payload.id as string, payload }
}

/** CRM APIs: dedicated crm_session first, then legacy hub token with crm claim. */
export async function authenticateEmployeeCrmJwt(
  req: NextRequest
): Promise<EmployeeAuth> {
  const crmAuth = await authenticateFromCrmSession(req)
  if (crmAuth) return crmAuth

  const token = req.cookies.get('token')?.value
  if (!token)
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const payload = await verifyJwt(token)
  if (!payload || payload.role !== 'EMPLOYEE')
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  if (!employeeHasCrmAccess(payload)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'CRM verification required.', code: 'CRM_LOCKED', requiresCrmOtp: true },
        { status: 403 }
      ),
    }
  }
  return { ok: true, userId: payload.id as string, payload }
}

export async function enforceEmployeeHub(
  req: NextRequest
): Promise<{ userId: string } | NextResponse> {
  const token = req.cookies.get('token')?.value
  if (!token)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await verifyJwt(token)
  if (!payload || payload.role !== 'EMPLOYEE')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return { userId: payload.id as string }
}

export async function enforceEmployeeWithCrm(
  req: NextRequest
): Promise<{ userId: string } | NextResponse> {
  const a = await authenticateEmployeeCrmJwt(req)
  if (!a.ok) return a.response
  return { userId: a.userId }
}
