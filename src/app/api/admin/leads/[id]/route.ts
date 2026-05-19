import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = await req.json()

    const existing = await db.lead.findUnique({ where: { id }, select: { verifiedSale: true, verifiedAt: true } })

    const updateData: Record<string, unknown> = {}
    if (body.closedSale !== undefined) updateData.closedSale = body.closedSale
    if (body.paymentReceived !== undefined) updateData.paymentReceived = body.paymentReceived
    if (body.verifiedSale !== undefined) {
      updateData.verifiedSale = body.verifiedSale
      if (body.verifiedSale === true && !existing?.verifiedSale) updateData.verifiedAt = new Date()
      if (body.verifiedSale === false) updateData.verifiedAt = null
    }

    const updated = await db.lead.update({ where: { id }, data: updateData })

    return NextResponse.json({ success: true, lead: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
