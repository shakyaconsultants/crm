import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'
import cloudinary, { isCloudinaryConfigured } from '@/lib/cloudinary'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export const runtime = 'nodejs'
export const maxDuration = 60

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'CASE_ASSESSOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const assessorId = payload.id as string
    const { id: leadId, docId } = await params

    const lead = await db.lead.findFirst({
      where: {
        id: leadId,
        assignedCaseAssessorId: assessorId,
      },
    })
    if (!lead) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const doc = await db.leadDocument.findFirst({
      where: { id: docId, leadId },
    })
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error:
            'File storage is not configured. Add CLOUDINARY_* environment variables on Vercel and redeploy.',
        },
        { status: 503 }
      )
    }

    const cloudinaryResourceType =
      doc.resourceType === 'image' || doc.resourceType === 'video'
        ? doc.resourceType
        : 'raw'

    try {
      await new Promise<void>((resolve, reject) => {
        cloudinary.uploader.destroy(
          doc.publicId,
          { resource_type: cloudinaryResourceType },
          (err) => (err ? reject(err) : resolve())
        )
      })
    } catch (e) {
      console.error('Cloudinary delete:', e)
    }

    await db.leadDocument.delete({ where: { id: docId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
