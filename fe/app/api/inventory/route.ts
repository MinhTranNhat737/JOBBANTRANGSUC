import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/products'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const queryStr = searchParams.toString()
    const backendUrl = `${API_BASE_URL}/inventory${queryStr ? `?${queryStr}` : ''}`

    const beRes = await fetch(backendUrl, { cache: 'no-store', headers: { Authorization: req.headers.get('authorization') || '' } })
    if (beRes.ok) {
      const data = await beRes.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Backend error' }, { status: beRes.status })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
