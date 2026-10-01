import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/products'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const beRes = await fetch(`${API_BASE_URL}/inventory/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (beRes.ok) {
      const data = await beRes.json()
      return NextResponse.json(data)
    }

    const errData = await beRes.json().catch(() => ({}))
    return NextResponse.json({ error: errData.error || 'Backend adjust error' }, { status: beRes.status })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
