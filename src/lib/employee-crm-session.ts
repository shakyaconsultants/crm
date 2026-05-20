import { SignJWT } from 'jose'
import type { NextResponse } from 'next/server'
import { getJwtSecret } from '@/lib/jwt-secret'
import {
  EMPLOYEE_SESSION_COOKIE_MAX_AGE,
  EMPLOYEE_SESSION_JWT_EXP,
} from '@/lib/employee-session'

/** Dedicated cookie for CRM email+OTP login — not overwritten by team /login. */
export const CRM_SESSION_COOKIE = 'crm_session'

export const CRM_SESSION_JWT_PURPOSE = 'CRM_SESSION' as const

const secret = getJwtSecret()

export function crmSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: EMPLOYEE_SESSION_COOKIE_MAX_AGE,
  } as const
}

export async function signCrmSessionJwt(user: {
  id: string
  email: string
}): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    role: 'EMPLOYEE',
    crm: true,
    purpose: CRM_SESSION_JWT_PURPOSE,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(EMPLOYEE_SESSION_JWT_EXP)
    .sign(secret)
}

export function setCrmSessionCookie(
  response: NextResponse,
  jwt: string
): void {
  response.cookies.set(CRM_SESSION_COOKIE, jwt, crmSessionCookieOptions())
}

export function clearCrmSessionCookie(response: NextResponse): void {
  response.cookies.delete(CRM_SESSION_COOKIE)
}

export function isCrmSessionPayload(payload: {
  role?: unknown
  purpose?: unknown
  crm?: unknown
}): boolean {
  return (
    payload.role === 'EMPLOYEE' &&
    payload.purpose === CRM_SESSION_JWT_PURPOSE &&
    payload.crm === true
  )
}
