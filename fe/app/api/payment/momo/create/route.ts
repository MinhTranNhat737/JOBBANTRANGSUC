import { NextResponse } from 'next/server'

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001/api'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.orderId) return NextResponse.json({ error: 'Thiếu orderId' }, { status: 400 })
    const response = await fetch(`${BACKEND_API}/payment/momo/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await response.json().catch(() => ({ error: 'Phản hồi MoMo không hợp lệ' }))
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Lỗi kết nối MoMo' }, { status: 502 })
  }
}
