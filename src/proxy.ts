import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { getJwtSecret } from '@/lib/jwt-secret'

const secret = getJwtSecret()

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  const adminOtpConfigured = !!(process.env.ADMIN_EMAIL ?? '').trim()
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isPublicPage =
    isAuthPage ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/crm-access')

  if (!token) {
    if (!isPublicPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    const role = payload.role as string
    const crmClaim =
      typeof (payload as { crm?: unknown }).crm === 'boolean'
        ? (payload as { crm: boolean }).crm
        : false

    if (isPublicPage) {
      if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url))
      if (role === 'ADVISOR') return NextResponse.redirect(new URL('/advisor', request.url))
      if (role === 'CASE_ASSESSOR') return NextResponse.redirect(new URL('/case-assessor', request.url))
      return NextResponse.redirect(new URL('/employee', request.url))
    }

    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/employee', request.url))
    }

    const isEmployeeZone =
      request.nextUrl.pathname.startsWith('/employee') || request.nextUrl.pathname === '/employee'
    if (isEmployeeZone && role !== 'EMPLOYEE') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    const isCrmPath =
      request.nextUrl.pathname === '/employee/crm' ||
      request.nextUrl.pathname.startsWith('/employee/crm/')
    if (isCrmPath && role === 'EMPLOYEE' && adminOtpConfigured && crmClaim !== true) {
      const u = request.nextUrl.clone()
      u.pathname = '/employee'
      u.searchParams.set('crm_locked', '1')
      return NextResponse.redirect(u)
    }

    return NextResponse.next()
  } catch {
    if (!isAuthPage) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      return response
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
