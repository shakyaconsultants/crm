import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { randomInt } from 'crypto'
import { sendLoginOtpToAdmin } from '@/lib/mail'
import { EMPLOYEE_SESSION_COOKIE_MAX_AGE, EMPLOYEE_SESSION_JWT_EXP } from '@/lib/employee-session'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)
const PENDING_COOKIE = 'pending_login'

function buildAuthResponse(user: { id: string; email: string; role: string }) {
  const redirect =
    user.role === 'ADMIN'
      ? '/admin'
      : user.role === 'ADVISOR'
        ? '/advisor'
        : user.role === 'CASE_ASSESSOR'
          ? '/case-assessor'
          : '/employee'

  return { redirect }
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

    if (!normalizedEmail || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim()
    const otpEnabled = !!adminEmail

    if (!otpEnabled) {
      const claims: Record<string, unknown> = {
        id: user.id,
        email: user.email,
        role: user.role,
      }
      const isEmp = user.role === 'EMPLOYEE'
      if (isEmp) claims.crm = true

      const token = await new SignJWT(claims)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(isEmp ? EMPLOYEE_SESSION_JWT_EXP : '24h')
        .sign(secret)

      const { redirect } = buildAuthResponse(user)
      const response = NextResponse.json({ success: true, redirect, requireOtp: false })
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: isEmp ? EMPLOYEE_SESSION_COOKIE_MAX_AGE : 60 * 60 * 24,
      })
      return response
    }

    if (user.role === 'EMPLOYEE') {
      const token = await new SignJWT({
        id: user.id,
        email: user.email,
        role: user.role,
        crm: false,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(EMPLOYEE_SESSION_JWT_EXP)
        .sign(secret)

      const response = NextResponse.json({
        success: true,
        redirect: '/employee',
        requireOtp: false,
        employeeHubOnly: true,
      })
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: EMPLOYEE_SESSION_COOKIE_MAX_AGE,
      })
      return response
    }

    const loginOtpSession = Reflect.get(db, 'loginOtpSession') as
      | (typeof db)['loginOtpSession']
      | undefined
    if (!loginOtpSession) {
      console.error(
        'Prisma client is missing `loginOtpSession`. Run `npx prisma generate` and restart the dev server (or run `npm run dev` so `predev` runs).'
      )
      return NextResponse.json(
        {
          error:
            'Server configuration error. Run `npx prisma generate`, then stop and start your dev server again.',
        },
        { status: 503 }
      )
    }

    const code = String(randomInt(100000, 1000000))
    const codeHash = await bcrypt.hash(code, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    const session = await loginOtpSession.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
        purpose: 'LOGIN',
      },
    })

    try {
      await sendLoginOtpToAdmin({
        otp: code,
        loginEmail: user.email,
        userName: user.name,
      })
    } catch (e) {
      console.error(e)
      await loginOtpSession.delete({ where: { id: session.id } }).catch(() => {})
      return NextResponse.json(
        {
          error:
            'Could not send login code. Set ADMIN_EMAIL and SMTP settings in the server environment, or use development mode to print the code in the server log.',
        },
        { status: 503 }
      )
    }

    const response = NextResponse.json({
      success: true,
      requireOtp: true,
      message: 'A verification code was sent to the administrator email address.',
    })
    response.cookies.set(PENDING_COOKIE, session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10,
    })
    return response
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
