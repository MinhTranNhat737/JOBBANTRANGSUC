import { NextResponse } from 'next/server'
import { parseOrderIdFromTransferContent, type SepayWebhookPayload } from '@/lib/sepay'
import { registerPaidOrder, findOrderForServerProcessing } from '@/lib/payment-registry'
import { sendOrderNotificationToTelegram } from '@/lib/telegram'
import { sendOrderInvoicesToCustomerAndAdmin } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body: SepayWebhookPayload = await req.json()

    // Example body from SePay:
    // {
    //   "id": 12345,
    //   "gateway": "VietinBank",
    //   "transactionDate": "2026-09-30 12:30:00",
    //   "accountNumber": "102873892837",
    //   "amountIn": 6340000,
    //   "transactionContent": "LEGEND1090 chuyen tien",
    //   "referenceNumber": "FT26274..."
    // }

    const content = body.transactionContent || body.body || ''
    const orderId = parseOrderIdFromTransferContent(content)

    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: 'Không tìm thấy mã đơn hàng trong nội dung chuyển khoản',
      })
    }

    // 1. Ghi nhận giao dịch thanh toán thành công vào server registry
    const tx = registerPaidOrder({
      orderId,
      gateway: 'sepay',
      amount: body.amountIn || 0,
      reference: body.referenceNumber || `SEP-${body.id}`,
    })

    const order = findOrderForServerProcessing(orderId, body.amountIn)
    order.paymentMethod = `Chuyển khoản SePay (${body.gateway || 'VietinBank'})`
    order.status = 'confirmed'

    // 2. Gửi thông báo ngay lập tức về Telegram Bot cho Admin
    await sendOrderNotificationToTelegram(
      order,
      `Chuyển khoản VietQR SePay (${body.gateway || 'VietinBank'}) - ĐÃ THANH TOÁN (Mã GD: ${tx.reference})`,
    )

    // 3. Gửi Hóa đơn điện tử qua Email cho khách hàng và admin
    await sendOrderInvoicesToCustomerAndAdmin(order)

    return NextResponse.json({
      success: true,
      message: `Đã xác nhận thanh toán đơn hàng ${orderId} và gửi thông báo Telegram, Email thành công`,
      orderId,
      amountIn: body.amountIn,
      transaction: tx,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}
