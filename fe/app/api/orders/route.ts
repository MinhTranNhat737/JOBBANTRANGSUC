import { NextResponse } from 'next/server'
import { sendOrderNotificationToTelegram } from '@/lib/telegram'
import { sendOrderInvoicesToCustomerAndAdmin } from '@/lib/email'
import type { Order } from '@/lib/admin-data'

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001/api'

// Chuẩn hóa và tự động bổ sung ảnh sản phẩm nếu thiếu hoặc là đường dẫn tương đối
function formatItemImageUrl(rawUrl?: string, slug?: string, name?: string): string {
  if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim() !== '') {
    let clean = rawUrl.trim()
    if (clean.startsWith('images/')) clean = `/${clean}`
    else if (!clean.startsWith('/') && !clean.startsWith('http')) clean = `/${clean}`

    // Chuẩn hóa nếu ảnh truyền dạng /images/products/sp0014.jpg sang /images/SP0014-1.jpg
    const matchSku = clean.match(/sp\d+/i)
    if (matchSku && (clean.includes('products/') || clean.includes('/sp'))) {
      return `/images/${matchSku[0].toUpperCase()}-1.jpg`
    }

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

// Map backend PostgreSQL order format sang frontend Order format
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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const codeParam = url.searchParams.get('id') || url.searchParams.get('code')

    // Nếu query cụ thể mã đơn hàng
    if (codeParam) {
      const cleanCode = codeParam.startsWith('#') ? codeParam : `#${codeParam}`
      try {
        const singleRes = await fetch(`${BACKEND_API}/orders/${encodeURIComponent(cleanCode)}`, {
          cache: 'no-store',
        })
        if (singleRes.ok) {
          const singleData = await singleRes.json()
          const mapped = mapBackendOrder(singleData)
          return NextResponse.json({ order: mapped, orders: [mapped], pagination: { total: 1 } })
        }
      } catch (singleErr) {
        console.warn('Single order fetch warning:', singleErr)
      }
    }

    // Đọc orders danh sách từ Backend PostgreSQL Database (Heroku)
    const search = url.searchParams.get('search') || ''
    const status = url.searchParams.get('status') || ''
    const page = url.searchParams.get('page') || '1'
    const limit = url.searchParams.get('limit') || '50'

    const params = new URLSearchParams({ page, limit })
    if (search) params.set('search', search)
    if (status) params.set('status', status)

    const beRes = await fetch(`${BACKEND_API}/orders?${params.toString()}`, {
      cache: 'no-store',
    })

    if (!beRes.ok) {
      console.error('Backend orders fetch failed:', beRes.status)
      return NextResponse.json({ orders: [], pagination: { total: 0 } })
    }

    const data = await beRes.json()
    
    // Map backend format sang frontend format
    const mappedOrders = Array.isArray(data.orders)
      ? data.orders.map(mapBackendOrder)
      : []

    return NextResponse.json({ 
      orders: mappedOrders,
      pagination: data.pagination,
    })
  } catch (err: any) {
    console.error('GET /api/orders error:', err)
    return NextResponse.json({ orders: [], pagination: { total: 0 } })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { order, paymentNote } = body as { order: Order; paymentNote?: string }

    if (!order || !order.customerName) {
      return NextResponse.json({ error: 'Thông tin đơn hàng không hợp lệ' }, { status: 400 })
    }

    // 1. Lưu vào Backend PostgreSQL Database (Heroku) - AWAIT để đảm bảo lưu thành công
    let savedOrder: Order = order
    try {
      const beRes = await fetch(`${BACKEND_API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: order.id,
          customer_id: order.customerId ? parseInt(order.customerId) : null,
          customer_email: order.customerEmail || null,
          payment_method: order.paymentGateway || order.paymentMethod || 'cod',
          shipping_name: order.customerName,
          shipping_phone: order.customerPhone,
          shipping_addr: order.customerAddress,
          note: order.notes,
          items: order.items.map((it: any) => ({
            product_id: it.productId || it.id || null,
            slug: it.slug || '',
            name: it.name,
            image: it.image || '',
            size: it.size || '',
            unit_price: it.price,
            quantity: it.quantity,
          })),
        }),
      })

      if (beRes.ok) {
        const beData = await beRes.json()
        savedOrder = mapBackendOrder(beData)
        console.log('✅ Order saved to PostgreSQL:', savedOrder.id)
      } else {
        const errText = await beRes.text()
        console.error('❌ Backend order save failed:', beRes.status, errText)
      }
    } catch (dbErr: any) {
      console.error('❌ Backend order sync error:', dbErr.message)
    }

    // 2. Bắn thông báo Telegram tức thì cho Admin
    const telegramRes = await sendOrderNotificationToTelegram(savedOrder, paymentNote || savedOrder.paymentMethod)

    // 3. Gửi Hóa đơn điện tử qua Email cho khách hàng & Admin
    const emailRes = await sendOrderInvoicesToCustomerAndAdmin(savedOrder)

    return NextResponse.json({
      success: true,
      message: 'Đơn hàng đã được lưu trên hệ thống và chuyển tiếp tới admin',
      order: savedOrder,
      telegram: telegramRes,
      email: emailRes,
    })
  } catch (err: any) {
    console.error('Error in /api/orders POST:', err)
    return NextResponse.json({ error: err?.message || 'Lỗi lưu đơn hàng' }, { status: 500 })
  }
}
