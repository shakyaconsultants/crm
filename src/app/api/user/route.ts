import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'
import { employeeHasCrmAccess, type AppJwtClaims } from '@/lib/employee-jwt'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    const p = payload as AppJwtClaims
    const user = await db.user.findUnique({
      where: { id: payload.id as string },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        profileImageUrl: true,
      },
    })
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
        crmAccess: user.role === 'EMPLOYEE' ? employeeHasCrmAccess(p) : true,
      },
    })
  } catch {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
