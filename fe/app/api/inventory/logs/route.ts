import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/products'

export async function GET(req: Request) {
  try {
    const beRes = await fetch(`${API_BASE_URL}/inventory/logs`, { cache: 'no-store', headers: { Authorization: req.headers.get('authorization') || '' } })
    if (beRes.ok) {
      const data = await beRes.json()
      return NextResponse.json(data)
    }
    const error = await beRes.json().catch(() => ({ error: 'Không thể tải lịch sử kho' }))
    return NextResponse.json(error, { status: beRes.status })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Lỗi kết nối lịch sử kho' }, { status: 500 })
  }
}
