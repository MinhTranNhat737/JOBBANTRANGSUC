import { NextRequest, NextResponse } from 'next/server'
import { generateOrderInvoiceHtml } from '@/lib/email'
import { getAllServerOrders } from '@/lib/server-order-repo'
import type { Order } from '@/lib/admin-data'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const orderId = searchParams.get('orderId') || ''
  const isAdmin = searchParams.get('admin') === 'true'

  // Look for order from server orders
  const serverOrders = getAllServerOrders()
  let order: Order | undefined = serverOrders.find(
    (o) => o.id === orderId || o.id.replace('#', '') === orderId.replace('#', ''),
  )

  if (!order) {
    // Generate sample display order for preview
    order = {
      id: orderId || '#1092',
      customerName: 'Trần Nhật Minh',
      customerEmail: 'minh.tran@example.com',
      customerPhone: '0988 776 655',
      customerAddress: 'Tầng 18, Tòa Bitexco, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      items: [
        {
          slug: 'vermilion-bird-ring',
          name: 'Vermilion Bird Sapphire Ring',
          image: '/images/p-ring-sapphire.png',
          size: '10',
          quantity: 1,
          price: 3890000,
        },
        {
          slug: 'libra-lotus-pendant',
          name: 'Libra Lotus Diamond Pendant',
          image: '/images/p-pendant-lotus.png',
          quantity: 1,
          price: 2450000,
        },
      ],
      total: 6340000,
      shippingFee: 0,
      status: 'confirmed',
      paymentMethod: 'Chuyển khoản SePay (VietQR)',
      createdAt: new Date().toISOString(),
      timeline: [],
    }
  }

  const html = generateOrderInvoiceHtml(order, isAdmin)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
