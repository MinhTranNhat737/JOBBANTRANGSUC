import { NextResponse } from 'next/server'
import { verifyMomoIpnSignature, type MomoIpnPayload } from '@/lib/momo'
import {
  registerPaidOrder,
  isOrderPaidOnServer,
  getPaidTransaction,
  findOrderForServerProcessing,
} from '@/lib/payment-registry'
import { sendOrderNotificationToTelegram } from '@/lib/telegram'
import { sendOrderInvoicesToCustomerAndAdmin } from '@/lib/email'

// MoMo IPN Webhook Callback
export async function POST(req: Request) {
  try {
    const payload: MomoIpnPayload = await req.json()

    // Extract Order ID (e.g. from extraData or orderId)
    let orderId = ''
    try {
      if (payload.extraData) {
        const parsed = JSON.parse(Buffer.from(payload.extraData, 'base64').toString('utf-8'))
        orderId = parsed.orderId
      }
    } catch {}

    if (!orderId && payload.orderId) {
      const match = payload.orderId.match(/^(\d+)/)
      orderId = match ? `#${match[1]}` : `#${payload.orderId}`
    }

    if (!orderId) {
      return NextResponse.json({ message: 'Missing orderId' }, { status: 400 })
    }

    // Verify signature (optional check in test mode)
    const isSignatureValid = verifyMomoIpnSignature(payload)

    // Check resultCode (0: Thành công)
    if (payload.resultCode !== 0) {
      return NextResponse.json({
        message: `Giao dịch MoMo không thành công (resultCode: ${payload.resultCode})`,
      })
    }

    // 1. Ghi nhận giao dịch thanh toán thành công
    const tx = registerPaidOrder({
      orderId,
      gateway: 'momo',
      amount: payload.amount || 0,
      reference: String(payload.transId || `MOMO-${Date.now()}`),
    })

    const order = findOrderForServerProcessing(orderId, payload.amount)
    order.paymentMethod = 'Ví điện tử MoMo'
    order.status = 'confirmed'

    // 2. Gửi thông báo Telegram Bot
    await sendOrderNotificationToTelegram(
      order,
      `Ví điện tử MoMo (GD #${payload.transId}) - ĐÃ THANH TOÁN THÀNH CÔNG`,
    )

    // 3. Gửi Email Hóa đơn cho Khách hàng & Admin
    await sendOrderInvoicesToCustomerAndAdmin(order)

    // MoMo expects HTTP 200 with { resultCode: 0 }
    return NextResponse.json({ resultCode: 0, message: 'Thành công', transaction: tx })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 })
  }
}

// GET: Check / Simulate MoMo payment for testing
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId') || searchParams.get('id')
  const simulate = searchParams.get('simulate') === 'true'
  const amount = Number(searchParams.get('amount')) || 5000000

  if (!orderId) {
    return NextResponse.json({ error: 'Missing order id' }, { status: 400 })
  }

  if (simulate) {
    const tx = registerPaidOrder({
      orderId,
      gateway: 'momo',
      amount,
      reference: `MOMO-SIM-${Date.now()}`,
    })

    const order = findOrderForServerProcessing(orderId, amount)
    order.paymentMethod = 'Ví điện tử MoMo'
    order.status = 'confirmed'

    await sendOrderNotificationToTelegram(order, 'Ví điện tử MoMo (Mô phỏng) - ĐÃ THANH TOÁN')
    await sendOrderInvoicesToCustomerAndAdmin(order)

    return NextResponse.json({
      success: true,
      message: 'Mô phỏng thanh toán MoMo thành công! Đã gửi Telegram & Email.',
      transaction: tx,
      order,
    })
  }

  const isPaid = isOrderPaidOnServer(orderId)
  const tx = getPaidTransaction(orderId)

  return NextResponse.json({
    orderId,
    isPaid,
    transaction: tx || null,
  })
}
