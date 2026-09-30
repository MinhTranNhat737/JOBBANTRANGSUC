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

  let isPaid = isOrderPaidOnServer(orderId)
  let tx = getPaidTransaction(orderId)

  // Nếu chưa paid trong memory registry, kiểm tra từ Backend Express / PostgreSQL & SePay API
  if (!isPaid) {
    try {
      const backendUrl = process.env.API_URL || 'http://localhost:3001/api'
      const cleanId = orderId.replace(/^#/, '')
      const beRes = await fetch(`${backendUrl}/payment/check/${encodeURIComponent(cleanId)}`, {
        cache: 'no-store',
      })
      if (beRes.ok) {
        const beData = await beRes.json()
        if (beData.isPaid) {
          isPaid = true
          tx = registerPaidOrder({
            orderId,
            gateway: 'sepay',
            amount: parseFloat(beData.totalAmount || 0),
            reference: `SEP-VERIFIED-${Date.now()}`,
          })
        }
      }
    } catch {
      // Ignore background network check error
    }
  }

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
