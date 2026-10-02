import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/products'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const queryStr = searchParams.toString()
    const backendUrl = `${API_BASE_URL}/customers${queryStr ? `?${queryStr}` : ''}`

    const beRes = await fetch(backendUrl, {
      cache: 'no-store',
      headers: { Authorization: req.headers.get('authorization') || '' },
    })
    if (beRes.ok) {
      const data = await beRes.json()
      return NextResponse.json(data)
    }

    const error = await beRes.json().catch(() => ({ error: 'Không thể tải danh sách khách hàng' }))
    return NextResponse.json(error, { status: beRes.status })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Lỗi kết nối API khách hàng' }, { status: 500 })
  }
}
