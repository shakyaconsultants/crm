import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import cloudinary, { isCloudinaryConfigured } from '@/lib/cloudinary'
import { db } from '@/lib/db'
import { enforceEmployeeHub } from '@/lib/enforce-employee-auth'

const ALLOWED_TYPES = /^image\/(jpeg|jpg|png|gif|webp)$/i

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const gated = await enforceEmployeeHub(req)
  if (gated instanceof NextResponse) return gated
  const userId = gated.userId

  try {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: 'File storage is not configured. Set CLOUDINARY_* in your environment.' },
        { status: 503 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file')
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const mime = file.type || 'application/octet-stream'
    if (!ALLOWED_TYPES.test(mime)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, GIF or WebP images are allowed.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const maxBytes = 4 * 1024 * 1024
    if (buffer.length > maxBytes) {
      return NextResponse.json({ error: 'Image must be at most 4MB.' }, { status: 400 })
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'crm_employee_profiles',
          transformation: [{ width: 512, height: 512, crop: 'fill', gravity: 'auto' }],
        },
        (error, res) => {
          if (error) reject(error)
          else if (res?.secure_url) resolve({ secure_url: res.secure_url })
          else reject(new Error('Upload failed'))
        }
      )
      uploadStream.end(buffer)
    })

    await db.user.update({
      where: { id: userId },
      data: { profileImageUrl: result.secure_url },
    })

    return NextResponse.json({ success: true, profileImageUrl: result.secure_url })
  } catch (error) {
    console.error('Profile image upload:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message || 'Upload failed' }, { status: 500 })
  }
}
