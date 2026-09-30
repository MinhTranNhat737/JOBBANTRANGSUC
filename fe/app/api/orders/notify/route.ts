import { NextResponse } from 'next/server'
import { sendOrderNotificationToTelegram } from '@/lib/telegram'
import { sendOrderInvoicesToCustomerAndAdmin } from '@/lib/email'
import type { Order } from '@/lib/admin-data'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { order, paymentNote } = body as { order: Order; paymentNote?: string }

    if (!order || !order.id || !order.customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin đơn hàng hợp lệ' },
        { status: 400 },
      )
    }

    // 1. Send Telegram Notification to Admin
    const telegramResult = await sendOrderNotificationToTelegram(order, paymentNote)

    // 2. Dispatch luxury invoices to both Customer & Store Admin
    const emailResult = await sendOrderInvoicesToCustomerAndAdmin(order)

    return NextResponse.json({
      success: true,
      message: 'Đã gửi thông báo đơn hàng thành công',
      telegram: telegramResult,
      email: emailResult,
    })
  } catch (error: any) {
    console.error('Error in /api/orders/notify:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi khi gửi thông báo' },
      { status: 500 },
    )
  }
}
