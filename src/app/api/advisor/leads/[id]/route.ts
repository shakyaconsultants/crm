import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'
import { parseEmployeeIntakeForm, addressHistoryMeetsFiveYears } from '@/lib/employee-intake-form'
import type { Prisma } from '@prisma/client'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.id as string

    if (payload.role !== 'ADVISOR') {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    // Ensure it's assigned to this advisor
    const existing = await db.lead.findUnique({ where: { id } })
    if (existing?.assignedAdvisorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data: {
      remarks?: string | null
      closedSale?: boolean
      verifiedSale?: boolean
      verifiedAt?: Date | null
      assignedCaseAssessorId?: string | null
      preSipAt?: Date | null
      employeeIntakeForm?: Prisma.InputJsonValue
      caseStatus?: string
    } = {}

    if (body.remarks !== undefined) data.remarks = body.remarks
    if (body.closedSale !== undefined) data.closedSale = body.closedSale
    if (body.verifiedSale !== undefined) {
      data.verifiedSale = body.verifiedSale
      if (body.verifiedSale === true && !existing.verifiedSale) data.verifiedAt = new Date()
      if (body.verifiedSale === false) data.verifiedAt = null
    }
    if (body.preSipAt !== undefined) {
      data.preSipAt = body.preSipAt ? new Date(body.preSipAt) : null
    }

    if (body.employeeIntakeForm !== undefined) {
      const parsed = parseEmployeeIntakeForm(body.employeeIntakeForm)
      if (!addressHistoryMeetsFiveYears(parsed)) {
        return NextResponse.json(
          { error: 'Address history should cover at least 5 years (60 months).' },
          { status: 400 }
        )
      }
      data.employeeIntakeForm = parsed as unknown as Prisma.InputJsonValue
    }

    if (body.assignedCaseAssessorId !== undefined) {
      const cid = body.assignedCaseAssessorId
      if (cid === null || cid === '') {
        data.assignedCaseAssessorId = null
      } else {
        const assessor = await db.user.findFirst({
          where: { id: cid, role: 'CASE_ASSESSOR' },
        })
        if (!assessor) {
          return NextResponse.json({ error: 'Invalid case assessor' }, { status: 400 })
        }
        data.assignedCaseAssessorId = cid
        if (!existing.assignedCaseAssessorId) {
          data.caseStatus = 'PENDING'
        }
      }
    }

    if (Object.keys(data).length === 0) {
      const lead = await db.lead.findUnique({ where: { id } })
      return NextResponse.json({ success: true, lead })
    }

    const updated = await db.lead.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, lead: updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
