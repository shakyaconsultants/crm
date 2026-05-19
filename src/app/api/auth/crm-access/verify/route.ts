import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { db } from '@/lib/db'
import { getJwtSecret } from '@/lib/jwt-secret'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { EMPLOYEE_SESSION_COOKIE_MAX_AGE, EMPLOYEE_SESSION_JWT_EXP } from '@/lib/employee-session'

const secret = getJwtSecret()
const CRM_DIRECT_PENDING = 'pending_crm_direct'
const OTP_MAX_ATTEMPTS = 5
const failures = new Map<string, number>()

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  const rl = checkRateLimit({
    key: `otp:crm-direct-verify:ip:${ip}`,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    )
  }

  const sessionId = req.cookies.get(CRM_DIRECT_PENDING)?.value
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session expired. Please request a new code.' },
      { status: 401 }
    )
  }

  const body = await req.json().catch(() => ({}))
  const otp = typeof body.otp === 'string' ? body.otp.replace(/\D/g, '').slice(0, 8) : ''
  if (!/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: 'Code must be 6 digits.' }, { status: 400 })
  }

  const session = await db.loginOtpSession.findUnique({ where: { id: sessionId } })
  if (!session || (session.purpose ?? 'LOGIN') !== 'CRM_DIRECT') {
    const res = NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 })
    res.cookies.delete(CRM_DIRECT_PENDING)
    return res
  }

  if (session.expiresAt < new Date()) {
    await db.loginOtpSession.delete({ where: { id: sessionId } }).catch(() => {})
    const res = NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 401 })
    res.cookies.delete(CRM_DIRECT_PENDING)
    return res
  }

  const ok = await bcrypt.compare(otp, session.codeHash)
  if (!ok) {
    const count = (failures.get(sessionId) ?? 0) + 1
    failures.set(sessionId, count)
    if (count >= OTP_MAX_ATTEMPTS) {
      await db.loginOtpSession.delete({ where: { id: sessionId } }).catch(() => {})
      failures.delete(sessionId)
      const res = NextResponse.json(
        { error: 'Too many invalid attempts. Request a new code.' },
        { status: 429 }
      )
      res.cookies.delete(CRM_DIRECT_PENDING)
      return res
    }
    return NextResponse.json({ error: 'Invalid code.' }, { status: 401 })
  }

  failures.delete(sessionId)
  await db.loginOtpSession.delete({ where: { id: sessionId } })

  const user = await db.user.findUnique({ where: { id: session.userId } })
  if (!user || user.role !== 'EMPLOYEE') {
    return NextResponse.json({ error: 'Account not found.' }, { status: 401 })
  }

  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    role: 'EMPLOYEE',
    crm: true,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(EMPLOYEE_SESSION_JWT_EXP)
    .sign(secret)

  const response = NextResponse.json({ success: true, redirect: '/employee/crm' })
  response.cookies.delete(CRM_DIRECT_PENDING)
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: EMPLOYEE_SESSION_COOKIE_MAX_AGE,
  })
  return response
}
