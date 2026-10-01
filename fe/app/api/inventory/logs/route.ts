import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/products'

export async function GET() {
  try {
    const beRes = await fetch(`${API_BASE_URL}/inventory/logs`, { cache: 'no-store' })
    if (beRes.ok) {
      const data = await beRes.json()
      return NextResponse.json(data)
    }
    return NextResponse.json({ logs: [] })
  } catch (err: any) {
    return NextResponse.json({ logs: [] })
  }
}
