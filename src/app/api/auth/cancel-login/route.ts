import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { NextRequest } from 'next/server'

const PENDING_COOKIE = 'pending_login'
const CRM_PENDING = 'pending_employee_crm'

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get(PENDING_COOKIE)?.value
  if (sessionId) {
    await db.loginOtpSession.delete({ where: { id: sessionId } }).catch(() => {})
  }
  const res = NextResponse.json({ success: true })
  res.cookies.delete(PENDING_COOKIE)
  res.cookies.delete(CRM_PENDING)
  return res
}
