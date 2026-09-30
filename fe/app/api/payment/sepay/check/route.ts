import { NextResponse } from 'next/server'
import {
  isOrderPaidOnServer,
  getPaidTransaction,
  registerPaidOrder,
  findOrderForServerProcessing,
} from '@/lib/payment-registry'
import { sendOrderNotificationToTelegram } from '@/lib/telegram'
import { sendOrderInvoicesToCustomerAndAdmin } from '@/lib/email'

// GET: Check payment status for an order
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId') || searchParams.get('id')

  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId parameter' }, { status: 400 })
  }

  const isPaid = isOrderPaidOnServer(orderId)
  const tx = getPaidTransaction(orderId)

  return NextResponse.json({
    orderId,
    isPaid,
    transaction: tx || null,
  })
}

// POST: Simulate instant bank transfer for local dev testing
export async function POST(req: Request) {
  try {
    const { orderId, amount } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const tx = registerPaidOrder({
      orderId,
      gateway: 'sepay',
      amount: amount || 5000000,
      reference: `SEP-SIM-${Date.now()}`,
    })

    const order = findOrderForServerProcessing(orderId, amount)
    order.paymentMethod = 'Chuyển khoản SePay (VietQR)'
    order.status = 'confirmed'

    // Fire notifications
    await sendOrderNotificationToTelegram(order, 'Chuyển khoản VietQR SePay - ĐÃ THANH TOÁN')
    await sendOrderInvoicesToCustomerAndAdmin(order)

    return NextResponse.json({
      success: true,
      message: 'Mô phỏng thanh toán SePay thành công! Đã gửi Telegram & Email.',
      transaction: tx,
      order,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
