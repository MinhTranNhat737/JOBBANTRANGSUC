import { NextResponse } from 'next/server'
import { getAllServerOrders, saveServerOrder } from '@/lib/server-order-repo'
import { sendOrderNotificationToTelegram } from '@/lib/telegram'
import { sendOrderInvoicesToCustomerAndAdmin } from '@/lib/email'
import type { Order } from '@/lib/admin-data'

export async function GET() {
  const orders = getAllServerOrders()
  return NextResponse.json({ orders })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { order, paymentNote } = body as { order: Order; paymentNote?: string }

    if (!order || !order.id || !order.customerName) {
      return NextResponse.json({ error: 'Thông tin đơn hàng không hợp lệ' }, { status: 400 })
    }

    // 1. Lưu đơn hàng vào file dữ liệu server vĩnh viễn (data/orders.json)
    const saved = saveServerOrder(order)

    // 2. Bắn thông báo Telegram tức thì cho Admin
    const telegramRes = await sendOrderNotificationToTelegram(saved, paymentNote || saved.paymentMethod)

    // 3. Gửi Hóa đơn điện tử qua Email cho khách hàng & Admin
    const emailRes = await sendOrderInvoicesToCustomerAndAdmin(saved)

    return NextResponse.json({
      success: true,
      message: 'Đơn hàng đã được lưu trên hệ thống và chuyển tiếp tới admin',
      order: saved,
      telegram: telegramRes,
      email: emailRes,
    })
  } catch (err: any) {
    console.error('Error in /api/orders POST:', err)
    return NextResponse.json({ error: err?.message || 'Lỗi lưu đơn hàng' }, { status: 500 })
  }
}
