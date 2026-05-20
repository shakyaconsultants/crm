import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { CRM_SESSION_COOKIE } from '@/lib/employee-crm-session'

type LogoutScope = 'hub' | 'crm'

function parseScope(req: NextRequest): LogoutScope {
  const urlScope = req.nextUrl.searchParams.get('scope')
  if (urlScope === 'crm' || urlScope === 'hub') return urlScope
  return 'hub'
}

export async function POST(req: NextRequest) {
  let scope: LogoutScope = parseScope(req)
  try {
    const body = await req.json()
    if (body?.scope === 'crm' || body?.scope === 'hub') scope = body.scope
  } catch {
    /* empty body — use query/default hub */
  }

  const response = NextResponse.json({ success: true, scope })

  if (scope === 'hub') {
    response.cookies.delete('token')
    response.cookies.delete('pending_login')
    response.cookies.delete('pending_employee_crm')
  }

  if (scope === 'crm') {
    response.cookies.delete(CRM_SESSION_COOKIE)
    response.cookies.delete('pending_crm_direct')
  }

  return response
}
