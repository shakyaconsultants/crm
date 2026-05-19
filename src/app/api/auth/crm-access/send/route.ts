import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomInt } from 'crypto'
import { db } from '@/lib/db'
import { sendEmployeeCrmUnlockOtp } from '@/lib/crm-mail'
import { getJwtSecret } from '@/lib/jwt-secret'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

// referenced only to ensure secret is configured at startup
void getJwtSecret()

const CRM_DIRECT_PENDING = 'pending_crm_direct'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  const ipLimit = checkRateLimit({
    key: `otp:crm-direct-send:ip:${ip}`,
    limit: 10,
    windowMs: 10 * 60 * 1000,
  })
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSec) } }
    )
  }

  const body = await req.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email } })
  if (!user || user.role !== 'EMPLOYEE') {
    // Return same message to avoid email enumeration
    return NextResponse.json({
      success: true,
      message: 'If that email belongs to an employee, a code has been sent to the admin inbox.',
    })
  }

  const loginOtpSession = Reflect.get(db, 'loginOtpSession') as
    | (typeof db)['loginOtpSession']
    | undefined
  if (!loginOtpSession) {
    return NextResponse.json({ error: 'OTP service unavailable.' }, { status: 503 })
  }

  await loginOtpSession.deleteMany({
    where: { userId: user.id, purpose: 'CRM_DIRECT' },
  })

  const code = String(randomInt(100000, 1000000))
  const codeHash = await bcrypt.hash(code, 10)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  const session = await loginOtpSession.create({
    data: { userId: user.id, codeHash, expiresAt, purpose: 'CRM_DIRECT' },
  })

  try {
    await sendEmployeeCrmUnlockOtp({ employeeName: user.name, otp: code })
  } catch (e) {
    console.error(e)
    await loginOtpSession.delete({ where: { id: session.id } }).catch(() => {})
    return NextResponse.json(
      { error: 'Could not send code. Check SMTP configuration.' },
      { status: 503 }
    )
  }

  const response = NextResponse.json({
    success: true,
    message: 'A verification code has been sent to the admin inbox.',
  })
  response.cookies.set(CRM_DIRECT_PENDING, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  })
  return response
}
