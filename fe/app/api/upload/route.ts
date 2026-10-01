import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      const file = formData.get('file') as File | null
      if (file) files.push(file)
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy file tải lên' }, { status: 400 })
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const savedUrls: string[] = []

    for (const file of files) {
      if (!file.name) continue
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const ext = path.extname(file.name) || '.jpg'
      const cleanBase = path
        .basename(file.name, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .slice(0, 30) || 'upload'
      const fileName = `${cleanBase}-${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`
      const filePath = path.join(uploadsDir, fileName)

      fs.writeFileSync(filePath, buffer)
      savedUrls.push(`/uploads/${fileName}`)
    }

    return NextResponse.json({ urls: savedUrls, url: savedUrls[0], success: true })
  } catch (err: any) {
    console.error('Upload API error:', err)
    return NextResponse.json({ error: err.message || 'Lỗi tải ảnh' }, { status: 500 })
  }
}
