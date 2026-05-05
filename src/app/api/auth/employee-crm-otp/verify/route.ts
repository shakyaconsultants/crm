import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { db } from '@/lib/db'
import { authenticateEmployeeJwt } from '@/lib/enforce-employee-auth'
import { EMPLOYEE_SESSION_COOKIE_MAX_AGE, EMPLOYEE_SESSION_JWT_EXP } from '@/lib/employee-session'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)
const CRM_PENDING = 'pending_employee_crm'

export async function POST(req: NextRequest) {
  const auth = await authenticateEmployeeJwt(req)
  if (!auth.ok) return auth.response

  const sessionId = req.cookies.get(CRM_PENDING)?.value
  if (!sessionId) {
    return NextResponse.json(
      { error: 'CRM verification session expired. Request a new code.' },
      { status: 401 }
    )
  }

  const { otp } = await req.json().catch(() => ({}))
  if (!otp || typeof otp !== 'string') {
    return NextResponse.json({ error: 'Enter the verification code' }, { status: 400 })
  }
  const normalized = otp.replace(/\s/g, '').slice(0, 8)
  if (!/^\d{6}$/.test(normalized)) {
    return NextResponse.json({ error: 'Code must be 6 digits' }, { status: 400 })
  }

  const session = await db.loginOtpSession.findUnique({
    where: { id: sessionId },
  })

  if (!session) {
    const res = NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    res.cookies.delete(CRM_PENDING)
    return res
  }

  const purpose = session.purpose ?? 'LOGIN'
  if (
    purpose !== 'EMPLOYEE_CRM' ||
    session.userId !== auth.userId
  ) {
    return NextResponse.json({ error: 'Invalid CRM verification session.' }, { status: 401 })
  }

  if (session.expiresAt < new Date()) {
    await db.loginOtpSession.delete({ where: { id: sessionId } }).catch(() => {})
    const res = NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 401 })
    res.cookies.delete(CRM_PENDING)
    return res
  }

  const ok = await bcrypt.compare(normalized, session.codeHash)
  if (!ok) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  }

  await db.loginOtpSession.delete({ where: { id: sessionId } })

  const token = await new SignJWT({
    id: auth.userId,
    email: auth.payload.email,
    role: 'EMPLOYEE',
    crm: true,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(EMPLOYEE_SESSION_JWT_EXP)
    .sign(secret)

  const response = NextResponse.json({ success: true, redirect: '/employee/crm' })
  response.cookies.delete(CRM_PENDING)
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: EMPLOYEE_SESSION_COOKIE_MAX_AGE,
  })
  return response
}
