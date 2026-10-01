import { NextResponse } from 'next/server'
import type { Order } from '@/lib/admin-data'

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001/api'

// Chuẩn hóa và tự động bổ sung ảnh sản phẩm nếu thiếu hoặc là đường dẫn tương đối
function formatItemImageUrl(rawUrl?: string, slug?: string, name?: string): string {
  if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim() !== '') {
    const clean = rawUrl.trim()
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean
    if (clean.startsWith('images/')) return `/${clean}`
    if (!clean.startsWith('/')) return `/${clean}`
    return clean
  }

  // Tra cứu theo mã SKU trong slug (ví dụ sp0001 -> /images/SP0001-1.jpg)
  if (slug) {
    const match = slug.match(/sp\d+/i)
    if (match) {
      const sku = match[0].toUpperCase()
      return `/images/${sku}-1.jpg`
    }
  }

  // Tra cứu thông minh theo tên sản phẩm nếu đơn cũ chưa lưu ảnh
  if (name) {
    const lower = name.toLowerCase()
    if (lower.includes('baby fat') || lower.includes('cross')) {
      return '/images/SP0006-1.jpg'
    }
    if (lower.includes('ly') || lower.includes('de lot ly')) {
      return '/images/SP0001-1.jpg'
    }
    if (lower.includes('nhan') || lower.includes('ring')) {
      return '/images/p-ring-sapphire.png'
    }
    if (lower.includes('day chuyen') || lower.includes('mat')) {
      return '/images/p-pendant-lotus.png'
    }
  }

  return '/placeholder.svg'
}

function mapBackendOrder(bo: any): Order {
  return {
    id: bo.code || `#${bo.id}`,
    customerName: bo.customer_name || bo.shipping_name || '',
    customerEmail: bo.customer_email || '',
    customerPhone: bo.customer_phone || bo.shipping_phone || '',
    customerAddress: bo.shipping_addr || '',
    items: Array.isArray(bo.items)
      ? bo.items.map((it: any) => ({
          slug: it.product_slug || '',
          name: it.name || '',
          image: formatItemImageUrl(it.image, it.product_slug, it.name),
          size: it.size || '',
          quantity: it.quantity || 1,
          price: parseFloat(it.unit_price) || 0,
        }))
      : [],
    total: parseFloat(bo.total_amount) || 0,
    shippingFee: 0,
    status: bo.status || 'pending',
    createdAt: bo.created_at || new Date().toISOString(),
    timeline: [
      {
        date: bo.created_at || new Date().toISOString(),
        status: bo.status === 'confirmed' || bo.status === 'paid' ? 'Đã xác nhận đơn hàng' : 'Đặt hàng thành công',
        note: 'Đơn hàng đã được lưu trên hệ thống',
      },
    ],
    notes: bo.note || '',
    paymentMethod: bo.payment_method || 'cod',
    customerId: bo.customer_id ? String(bo.customer_id) : undefined,
    paymentStatus: bo.status === 'confirmed' || bo.status === 'delivered' || bo.status === 'shipping' || bo.status === 'paid' ? 'paid' : 'pending',
    paymentGateway: (bo.payment_method as any) || 'cod',
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cleanId = decodeURIComponent(id)
    const normalized = cleanId.startsWith('#') ? cleanId : `#${cleanId}`

    const beRes = await fetch(`${BACKEND_API}/orders/${encodeURIComponent(normalized)}`, {
      cache: 'no-store',
    })

    if (!beRes.ok) {
      // Try with raw id
      const beRes2 = await fetch(`${BACKEND_API}/orders/${encodeURIComponent(cleanId.replace('#', ''))}`, {
        cache: 'no-store',
      })
      if (!beRes2.ok) {
        return NextResponse.json({ error: 'Đơn hàng không tồn tại' }, { status: 404 })
      }
      const data = await beRes2.json()
      return NextResponse.json({ order: mapBackendOrder(data) })
    }

    const data = await beRes.json()
    return NextResponse.json({ order: mapBackendOrder(data) })
  } catch (err: any) {
    console.error('GET /api/orders/[id] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const cleanId = decodeURIComponent(id)
    const normalized = cleanId.startsWith('#') ? cleanId : `#${cleanId}`

    const beRes = await fetch(`${BACKEND_API}/orders/${encodeURIComponent(normalized)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!beRes.ok) {
      const err = await beRes.text()
      return NextResponse.json({ error: err }, { status: beRes.status })
    }

    const data = await beRes.json()
    return NextResponse.json({ order: mapBackendOrder(data) })
  } catch (err: any) {
    console.error('PATCH /api/orders/[id] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
