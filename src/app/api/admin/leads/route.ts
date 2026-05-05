import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'
import { parseLeadPhoneForStorage } from '@/lib/phone'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

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

    const phoneNumbers = validLeads.map((l) => parseLeadPhoneForStorage(l.phone)).filter((p): p is string => !!p)

    const existingLeads = await db.lead.findMany({
      where: { phone: { in: phoneNumbers } },
      select: { phone: true },
    })
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
        newLeadsToInsert.push({
            title: lead.title ? String(lead.title) : null,
            firstName: lead.firstName ? String(lead.firstName) : '',
            lastName: lead.lastName ? String(lead.lastName) : null,
            address: lead.address ? String(lead.address) : null,
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

    if (!leadIds) {
       return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const updateData: {
      assignedToId?: string | null
      assignedDate?: Date
    } = {}
    if (assignedToId !== undefined) {
      updateData.assignedToId = assignedToId === '' ? null : assignedToId
      updateData.assignedDate = new Date()
    }

    await db.lead.updateMany({
      where: { id: { in: leadIds } },
      data: updateData,
    })

    return NextResponse.json({ success: true })
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
    if (!leadIds || !leadIds.length) {
      return NextResponse.json({ error: 'No leads selected' }, { status: 400 })
    }

    await db.lead.deleteMany({
      where: { id: { in: leadIds } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
