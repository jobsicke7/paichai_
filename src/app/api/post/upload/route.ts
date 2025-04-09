import { NextRequest, NextResponse } from 'next/server'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
})

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer())
  const fileExt = file.name.split('.').pop()
  const fileName = `${randomUUID()}.${fileExt}`

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: file.type,
  })

  try {
    await R2.send(command)

    const publicUrl = `${process.env.R2_PUBLIC_URL}${fileName}`
    return NextResponse.json({ url: publicUrl }, { status: 200 })
  } catch (err) {
    console.error('R2 Upload Error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    const fileKey = new URL(url).pathname.replace(/^\/+/, '')

    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
    })

    await R2.send(command)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('R2 Delete Error:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
