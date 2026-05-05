import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import { randomInt } from 'crypto'
import { db } from '@/lib/db'
import { authenticateEmployeeJwt } from '@/lib/enforce-employee-auth'
import { employeeHasCrmAccess } from '@/lib/employee-jwt'
import { isGlobalOtpEnabled } from '@/lib/otp-config'
import { sendEmployeeCrmUnlockOtp } from '@/lib/crm-mail'
import { EMPLOYEE_SESSION_COOKIE_MAX_AGE, EMPLOYEE_SESSION_JWT_EXP } from '@/lib/employee-session'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)
const CRM_PENDING = 'pending_employee_crm'

export async function POST(req: NextRequest) {
  const auth = await authenticateEmployeeJwt(req)
  if (!auth.ok) return auth.response

  if (!isGlobalOtpEnabled()) {
    const token = await new SignJWT({
      id: auth.userId,
      email: auth.payload.email,
      role: 'EMPLOYEE',
      crm: true,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(EMPLOYEE_SESSION_JWT_EXP)
      .sign(secret)
    const response = NextResponse.json({ success: true, unlocked: true, message: 'CRM already available (OTP disabled).' })
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: EMPLOYEE_SESSION_COOKIE_MAX_AGE,
    })
    return response
  }

  if (employeeHasCrmAccess(auth.payload)) {
    return NextResponse.json({ error: 'CRM is already unlocked for this session.' }, { status: 400 })
  }

  const loginOtpSession = Reflect.get(db, 'loginOtpSession') as
    | (typeof db)['loginOtpSession']
    | undefined
  if (!loginOtpSession) {
    return NextResponse.json({ error: 'OTP model unavailable.' }, { status: 503 })
  }

  const user = await db.user.findUnique({ where: { id: auth.userId } })
  if (!user || user.role !== 'EMPLOYEE') {
    return NextResponse.json({ error: 'User not found' }, { status: 401 })
  }

  await loginOtpSession.deleteMany({
    where: { userId: auth.userId, purpose: 'EMPLOYEE_CRM' },
  })

  const code = String(randomInt(100000, 1000000))
  const codeHash = await bcrypt.hash(code, 10)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  const session = await loginOtpSession.create({
    data: {
      userId: auth.userId,
      codeHash,
      expiresAt,
      purpose: 'EMPLOYEE_CRM',
    },
  })

  try {
    await sendEmployeeCrmUnlockOtp({
      to: user.email,
      employeeName: user.name,
      otp: code,
    })
  } catch (e) {
    console.error(e)
    await loginOtpSession.delete({ where: { id: session.id } }).catch(() => {})
    return NextResponse.json(
      { error: 'Could not send CRM code. Configure SMTP_* in your environment.' },
      { status: 503 }
    )
  }

  const response = NextResponse.json({
    success: true,
    message: 'A verification code was sent to your employee email inbox.',
  })
  response.cookies.set(CRM_PENDING, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  })
  return response
}
