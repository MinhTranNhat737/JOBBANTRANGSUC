import { NextResponse } from 'next/server'
import { API_BASE_URL, mapDbProductToProduct, getProducts, type Product } from '@/lib/products'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = (searchParams.get('q') || searchParams.get('search') || '').trim()

  if (!query) {
    const all = await getProducts()
    return NextResponse.json({ products: all.slice(0, 8) })
  }

  const queryLower = query.toLowerCase()

  // 1. Thử tìm từ Backend Database
  try {
    const res = await fetch(`${API_BASE_URL}/products?search=${encodeURIComponent(query)}&limit=24`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      const list = data.products || (Array.isArray(data) ? data : [])
      if (list.length > 0) {
        return NextResponse.json({ products: list.map(mapDbProductToProduct) })
      }
    }
  } catch (err) {
    console.warn('Search backend API error:', err)
  }

  // 2. Fallback tìm kiếm trong getProducts()
  const all = await getProducts()
  const matched = all.filter((p: Product) => {
    return (
      p.name.toLowerCase().includes(queryLower) ||
      p.slug.toLowerCase().includes(queryLower) ||
      p.category.toLowerCase().includes(queryLower) ||
      (p.material && p.material.toLowerCase().includes(queryLower)) ||
      (p.description && p.description.toLowerCase().includes(queryLower))
    )
  })

  return NextResponse.json({ products: matched })
}
