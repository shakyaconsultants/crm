import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'
import { parseLeadPhoneForStorage } from '@/lib/phone'
import { getJwtSecret } from '@/lib/jwt-secret'

const secret = getJwtSecret()

function uniqStrings(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return Array.from(
    new Set(input.filter((x): x is string => typeof x === 'string' && x.trim().length > 0))
  )
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const leads = await db.lead.findMany({
      include: { 
        assignedTo: { select: { name: true } },
        assignedAdvisor: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ leads })
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

    const body = await req.json()
    const leadsData = body.leads as any[]

    if (!Array.isArray(leadsData)) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 })
    }

    if (leadsData.length === 0) {
      return NextResponse.json({ success: true, createdCount: 0, skippedCount: 0 })
    }

    let createdCount = 0
    let skippedCount = 0

    // Filter out rows missing essential data
    const validLeads = leadsData.filter((lead) => (lead.firstName || lead.lastName) && lead.phone != null && lead.phone !== '')
    skippedCount += leadsData.length - validLeads.length

    const phoneNumbers = validLeads
      .map((l) => parseLeadPhoneForStorage(l.phone))
      .filter((p): p is string => !!p)
    const uniquePhones = Array.from(new Set(phoneNumbers))
    const existingLeads = uniquePhones.length
      ? await db.lead.findMany({
          where: { phone: { in: uniquePhones } },
          select: { phone: true },
        })
      : []
    const existingPhonesSet = new Set(existingLeads.map((l) => l.phone))

    const newLeadsToInsert = []

    const seenPhonesInCsv = new Set<string>()

    for (const lead of validLeads) {
      const phoneStr = parseLeadPhoneForStorage(lead.phone)
      if (!phoneStr) {
        skippedCount++
        continue
      }
      if (existingPhonesSet.has(phoneStr) || seenPhonesInCsv.has(phoneStr)) {
        skippedCount++
      } else {
        seenPhonesInCsv.add(phoneStr)
        const addressLine1 =
          lead.addressLine1 != null ? String(lead.addressLine1) : lead.address1 != null ? String(lead.address1) : ''
        const addressLine2 =
          lead.addressLine2 != null ? String(lead.addressLine2) : lead.address2 != null ? String(lead.address2) : ''
        const addressLine3 =
          lead.addressLine3 != null ? String(lead.addressLine3) : lead.address3 != null ? String(lead.address3) : ''
        const addressLine4 =
          lead.addressLine4 != null ? String(lead.addressLine4) : lead.address4 != null ? String(lead.address4) : ''
        const legacyAddress = lead.address ? String(lead.address) : ''
        const mergedAddress =
          [addressLine1, addressLine2, addressLine3, addressLine4].filter(Boolean).join(', ') ||
          legacyAddress ||
          null
        newLeadsToInsert.push({
            title: lead.title ? String(lead.title) : null,
            firstName: lead.firstName ? String(lead.firstName) : '',
            lastName: lead.lastName ? String(lead.lastName) : null,
            email: lead.email ? String(lead.email).trim().toLowerCase() : null,
            address: mergedAddress,
            addressLine1: addressLine1 || null,
            addressLine2: addressLine2 || null,
            addressLine3: addressLine3 || null,
            addressLine4: addressLine4 || null,
            postCode: lead.postCode ? String(lead.postCode) : null,
            phone: phoneStr,
            remarks: lead.remarks ? String(lead.remarks) : null,
        })
      }
    }

    if (newLeadsToInsert.length > 0) {
      await db.lead.createMany({
        data: newLeadsToInsert,
      })
      createdCount = newLeadsToInsert.length
    }

    return NextResponse.json({ success: true, createdCount, skippedCount })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { leadIds, assignedToId } = body

    const normalizedLeadIds = uniqStrings(leadIds)
    if (normalizedLeadIds.length === 0) {
       return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    if (assignedToId) {
      const employee = await db.user.findUnique({
        where: { id: assignedToId },
        select: { id: true, role: true },
      })
      if (!employee || employee.role !== 'EMPLOYEE') {
        return NextResponse.json({ error: 'Invalid employee selection' }, { status: 400 })
      }
    }

    const updateData: {
      assignedToId?: string | null
      assignedDate?: Date
    } = {}
    if (assignedToId !== undefined) {
      updateData.assignedToId = assignedToId === '' ? null : assignedToId
      updateData.assignedDate = new Date()
    }

    const updated = await db.lead.updateMany({
      where: { id: { in: normalizedLeadIds } },
      data: updateData,
    })

    return NextResponse.json({ success: true, updatedCount: updated.count })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { leadIds } = await req.json()
    const normalizedLeadIds = uniqStrings(leadIds)
    if (normalizedLeadIds.length === 0) {
      return NextResponse.json({ error: 'No leads selected' }, { status: 400 })
    }

    const deleted = await db.lead.deleteMany({
      where: { id: { in: normalizedLeadIds } }
    })

    return NextResponse.json({ success: true, deletedCount: deleted.count })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
