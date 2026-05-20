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

async function verifyCookieJwt(
  value: string | undefined
): Promise<AppJwtClaims | null> {
  if (!value) return null
  try {
    const { payload } = await jwtVerify(value, secret)
    return payload as AppJwtClaims
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const crmSession = request.cookies.get(CRM_SESSION_COOKIE)?.value

  const adminOtpConfigured = !!(process.env.ADMIN_EMAIL ?? '').trim()
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isPublicPage =
    isAuthPage ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/crm-access')

  const isCrmPath =
    request.nextUrl.pathname === '/employee/crm' ||
    request.nextUrl.pathname.startsWith('/employee/crm/')

  const crmPayload = await verifyCookieJwt(crmSession)
  const hubPayload = await verifyCookieJwt(token)
  const hasCrmSession = crmPayload !== null && isCrmSessionPayload(crmPayload)

  if (isCrmPath) {
    if (hasCrmSession) return NextResponse.next()
    if (
      hubPayload?.role === 'EMPLOYEE' &&
      (!adminOtpConfigured || employeeHasCrmAccess(hubPayload))
    ) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/crm-access', request.url))
  }

  if (!token && !crmSession) {
    if (!isPublicPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  const payload = hubPayload ?? (hasCrmSession ? crmPayload : null)
  if (!payload) {
    if (!isPublicPage) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      response.cookies.delete(CRM_SESSION_COOKIE)
      return response
    }
    return NextResponse.next()
  }

  const role = payload.role as string

  if (isPublicPage) {
    if (
      request.nextUrl.pathname === '/' ||
      request.nextUrl.pathname.startsWith('/crm-access')
    ) {
      return NextResponse.next()
    }
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url))
    if (role === 'ADVISOR') return NextResponse.redirect(new URL('/advisor', request.url))
    if (role === 'CASE_ASSESSOR') {
      return NextResponse.redirect(new URL('/case-assessor', request.url))
    }
    if (hasCrmSession) {
      return NextResponse.redirect(new URL('/employee/crm', request.url))
    }
    return NextResponse.redirect(new URL('/employee', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/admin') && role !== 'ADMIN') {
    if (hasCrmSession) {
      return NextResponse.redirect(new URL('/employee/crm', request.url))
    }
    return NextResponse.redirect(new URL('/employee', request.url))
  }

  const isEmployeeZone =
    request.nextUrl.pathname.startsWith('/employee') ||
    request.nextUrl.pathname === '/employee'

  if (isEmployeeZone && role !== 'EMPLOYEE') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (isEmployeeZone && role === 'EMPLOYEE' && !hubPayload && hasCrmSession) {
    return NextResponse.redirect(new URL('/employee/crm', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
