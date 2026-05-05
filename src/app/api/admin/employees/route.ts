import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const employees = await db.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        profileImageUrl: true,
        baseSalaryMonthly: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ employees })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { name, email, password, baseSalaryMonthly, profileImageUrl } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const normalizedName = String(name).trim()
    if (!normalizedName || !normalizedEmail) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    let parsedBaseSalary: number | null = null
    if (baseSalaryMonthly !== undefined && baseSalaryMonthly !== null && baseSalaryMonthly !== '') {
      const n = Number(baseSalaryMonthly)
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json({ error: 'Invalid in-hand salary' }, { status: 400 })
      }
      parsedBaseSalary = n
    }

    const existingUser = await db.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newEmployeeId = `EMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const emp = await db.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        employeeId: newEmployeeId,
        baseSalaryMonthly: parsedBaseSalary,
        profileImageUrl: typeof profileImageUrl === 'string' && profileImageUrl.trim() ? profileImageUrl.trim() : null,
        role: 'EMPLOYEE'
      }
    })

    return NextResponse.json({
      success: true,
      employee: {
        id: emp.id,
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        baseSalaryMonthly: emp.baseSalaryMonthly,
        profileImageUrl: emp.profileImageUrl,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing employee ID' }, { status: 400 })

    // When deleting an employee, we should unassign their leads first or delete them?
    // User said "remove CSV entries / leads" and "remove employees... should also clean that record from database".
    // I'll unassign leads to prevent errors, but the employee record itself will be deleted.
    await db.lead.updateMany({
      where: { assignedToId: id },
      data: { assignedToId: null }
    })

    await db.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
