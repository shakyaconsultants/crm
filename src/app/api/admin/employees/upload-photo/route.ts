import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import cloudinary, { isCloudinaryConfigured } from '@/lib/cloudinary'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)
const ALLOWED_TYPES = /^image\/(jpeg|jpg|png|gif|webp)$/i

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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
    if (buffer.length > 4 * 1024 * 1024) {
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

    return NextResponse.json({ success: true, profileImageUrl: result.secure_url })
  } catch (error) {
    console.error('Admin employee photo upload:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message || 'Upload failed' }, { status: 500 })
  }
}
