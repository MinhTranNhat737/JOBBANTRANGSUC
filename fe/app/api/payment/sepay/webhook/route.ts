import { NextResponse } from 'next/server'

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001/api'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const signature = req.headers.get('x-sepay-signature') || req.headers.get('x-webhook-signature') || ''
    const response = await fetch(`${BACKEND_API}/payment/sepay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(signature ? { 'x-sepay-signature': signature } : {}),
      },
      body: JSON.stringify(body),
    })
    const data = await response.json().catch(() => ({ error: 'Phản hồi SePay webhook không hợp lệ' }))
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Lỗi chuyển tiếp SePay webhook' }, { status: 502 })
  }
}
