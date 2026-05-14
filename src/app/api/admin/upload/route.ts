import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import cloudinary, { isCloudinaryConfigured } from '@/lib/cloudinary'
import { getJwtSecret } from '@/lib/jwt-secret'
import {
  ALLOWED_LEAD_IMPORT_MIME,
  MAX_CSV_IMPORT_BYTES,
  hasAllowedMime,
} from '@/lib/upload-security'

const secret = getJwtSecret()

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
        {
          error:
            'File storage is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to Vercel and redeploy.',
        },
        { status: 503 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!hasAllowedMime(file.type || '', ALLOWED_LEAD_IMPORT_MIME)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Use CSV or XLSX.' },
        { status: 400 }
      )
    }
    if (file.size > MAX_CSV_IMPORT_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Max size is 8MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'crm_leads' },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message || 'Upload failed' }, { status: 500 })
  }
}
