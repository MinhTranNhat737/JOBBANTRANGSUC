import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/products'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const queryStr = searchParams.toString()
    const backendUrl = `${API_BASE_URL}/customers${queryStr ? `?${queryStr}` : ''}`

    const beRes = await fetch(backendUrl, { cache: 'no-store' })
    if (beRes.ok) {
      const data = await beRes.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ customers: [], total: 0 })
  } catch (err: any) {
    return NextResponse.json({ customers: [], total: 0 })
  }
}
