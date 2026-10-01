import { NextResponse } from 'next/server'
import { sendOrderNotificationToTelegram } from '@/lib/telegram'
import { sendOrderInvoicesToCustomerAndAdmin } from '@/lib/email'
import type { Order } from '@/lib/admin-data'

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001/api'

// Map backend PostgreSQL order format sang frontend Order format
function mapBackendOrder(bo: any): Order {
  return {
    id: bo.code || `#${bo.id}`,
    customerName: bo.shipping_name || bo.customer_name || '',
    customerEmail: bo.customer_email || '',
    customerPhone: bo.shipping_phone || bo.customer_phone || '',
    customerAddress: bo.shipping_addr || '',
    items: Array.isArray(bo.items)
      ? bo.items.map((it: any) => ({
          slug: it.product_slug || '',
          name: it.name || '',
          image: '',
          size: '',
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
        status: 'Đặt hàng thành công',
        note: 'Đơn hàng đã được tạo',
      },
    ],
    notes: bo.note || '',
    paymentMethod: bo.payment_method || 'cod',
    customerId: bo.customer_id ? String(bo.customer_id) : undefined,
    paymentStatus: bo.status === 'confirmed' || bo.status === 'delivered' || bo.status === 'shipping' ? 'paid' : 'pending',
    paymentGateway: bo.payment_method as any || 'cod',
  }
}

export async function GET(req: Request) {
  try {
    // Đọc orders từ Backend PostgreSQL Database (Heroku)
    const url = new URL(req.url)
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

    if (!order || !order.id || !order.customerName) {
      return NextResponse.json({ error: 'Thông tin đơn hàng không hợp lệ' }, { status: 400 })
    }

    // 1. Lưu vào Backend PostgreSQL Database (Heroku) - AWAIT để đảm bảo lưu thành công
    let backendOrder = null
    try {
      const beRes = await fetch(`${BACKEND_API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: order.id,
          customer_id: order.customerId ? parseInt(order.customerId) : null,
          payment_method: order.paymentGateway || order.paymentMethod || 'cod',
          shipping_name: order.customerName,
          shipping_phone: order.customerPhone,
          shipping_addr: order.customerAddress,
          note: order.notes,
          items: order.items.map((it: any) => ({
            product_id: it.productId || it.id || null,
            name: it.name,
            unit_price: it.price,
            quantity: it.quantity,
          })),
        }),
      })

      if (beRes.ok) {
        backendOrder = await beRes.json()
        console.log('✅ Order saved to PostgreSQL:', order.id)
      } else {
        const errText = await beRes.text()
        console.error('❌ Backend order save failed:', beRes.status, errText)
      }
    } catch (dbErr: any) {
      console.error('❌ Backend order sync error:', dbErr.message)
    }

    // 2. Bắn thông báo Telegram tức thì cho Admin
    const telegramRes = await sendOrderNotificationToTelegram(order, paymentNote || order.paymentMethod)

    // 3. Gửi Hóa đơn điện tử qua Email cho khách hàng & Admin
    const emailRes = await sendOrderInvoicesToCustomerAndAdmin(order)

    return NextResponse.json({
      success: true,
      message: 'Đơn hàng đã được lưu trên hệ thống và chuyển tiếp tới admin',
      order: backendOrder || order,
      telegram: telegramRes,
      email: emailRes,
    })
  } catch (err: any) {
    console.error('Error in /api/orders POST:', err)
    return NextResponse.json({ error: err?.message || 'Lỗi lưu đơn hàng' }, { status: 500 })
  }
}
