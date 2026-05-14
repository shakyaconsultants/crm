import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { db } from '@/lib/db'
import { authenticateEmployeeJwt } from '@/lib/enforce-employee-auth'
import { EMPLOYEE_SESSION_COOKIE_MAX_AGE, EMPLOYEE_SESSION_JWT_EXP } from '@/lib/employee-session'
import { getJwtSecret } from '@/lib/jwt-secret'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const secret = getJwtSecret()
const CRM_PENDING = 'pending_employee_crm'
const OTP_MAX_ATTEMPTS = 5
const crmOtpFailures = new Map<string, number>()

export async function POST(req: NextRequest) {
  const auth = await authenticateEmployeeJwt(req)
  if (!auth.ok) return auth.response
  const ip = getClientIp(req)

  const rl = checkRateLimit({
    key: `otp:employee-verify:ip:${ip}`,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many verification attempts. Please wait and retry.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    )
  }

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
    const failCount = (crmOtpFailures.get(sessionId) ?? 0) + 1
    crmOtpFailures.set(sessionId, failCount)
    if (failCount >= OTP_MAX_ATTEMPTS) {
      await db.loginOtpSession.delete({ where: { id: sessionId } }).catch(() => {})
      crmOtpFailures.delete(sessionId)
      const res = NextResponse.json(
        { error: 'Too many invalid attempts. Request a new code.' },
        { status: 429 }
      )
      res.cookies.delete(CRM_PENDING)
      return res
    }
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  }

  crmOtpFailures.delete(sessionId)
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
