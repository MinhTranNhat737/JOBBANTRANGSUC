import { NextResponse } from 'next/server'
import { getTelegramLogs, sendTelegramMessage, recordTelegramLog } from '@/lib/telegram'
import { getInvoiceLogs, sendInvoiceEmail } from '@/lib/email'
import { getDynamicSettings, saveDynamicSettings } from '@/lib/payment-settings-store'
import { PAYMENT_CONFIG } from '@/lib/payment-config'
import { MOCK_ORDERS } from '@/lib/admin-data'

export async function GET() {
  const telegramLogs = getTelegramLogs()
  const invoiceLogs = getInvoiceLogs()
  const dynamic = getDynamicSettings()

  const safeConfig = {
    sepay: {
      bankCode: dynamic.sepayBankCode,
      accountNumber: dynamic.sepayAccountNumber,
      accountName: dynamic.sepayAccountName,
      hasApiKey: !!PAYMENT_CONFIG.sepay.apiToken,
    },
    momo: {
      partnerCode: dynamic.momoPartnerCode,
      endpoint: PAYMENT_CONFIG.momo.endpoint,
      hasAccessKey: !!PAYMENT_CONFIG.momo.accessKey,
      hasSecretKey: !!PAYMENT_CONFIG.momo.secretKey,
    },
    telegram: {
      hasBotToken: !!dynamic.telegramBotToken && dynamic.telegramBotToken !== 'demo_token',
      botToken: dynamic.telegramBotToken,
      chatId: dynamic.telegramChatId,
    },
    email: {
      hasResendApiKey: !!dynamic.resendApiKey,
      resendApiKey: dynamic.resendApiKey,
      fromAddress: PAYMENT_CONFIG.email.fromAddress,
      adminEmail: dynamic.adminEmail,
    },
  }

  return NextResponse.json({
    telegramLogs,
    invoiceLogs,
    config: safeConfig,
    settings: dynamic,
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, targetEmail, updates } = body

    // 1. Lưu cài đặt mới (Telegram, Email, Ngân hàng)
    if (action === 'save_settings' && updates) {
      const saved = saveDynamicSettings(updates)
      return NextResponse.json({ success: true, message: 'Đã lưu cấu hình thành công', settings: saved })
    }

    // 2. Thử nghiệm gửi Telegram
    if (action === 'test_telegram') {
      const dynamic = getDynamicSettings()
      if (!dynamic.telegramBotToken || !dynamic.telegramChatId) {
        return NextResponse.json({
          success: false,
          simulated: true,
          error: 'Chưa điền Telegram Bot Token hoặc Chat ID. Vui lòng nhập thông tin bên dưới và bấm "Lưu cấu hình" trước khi test.',
        })
      }

      const testMsg = `
🔔 <b>[TEST] THỬ NGHIỆM KẾT NỐI TELEGRAM BOT THÀNH CÔNG</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hệ thống thanh toán & thông báo của <b>LEGEND Fine Jewelry</b> đã được kết nối với Telegram Bot.
Thời gian: ${new Date().toLocaleString('vi-VN')}
Trạng thái: Hoạt động bình thường.
`.trim()
      const res = await sendTelegramMessage(testMsg)
      recordTelegramLog(
        '#TEST-BOT',
        testMsg,
        res.simulated ? 'simulated' : res.success ? 'sent' : 'failed',
        res.error,
      )
      return NextResponse.json({ success: res.success, simulated: res.simulated, error: res.error })
    }

    // 3. Thử nghiệm gửi Email
    if (action === 'test_email') {
      const sampleOrder = MOCK_ORDERS[0]
      const dynamic = getDynamicSettings()
      const toEmail = targetEmail || dynamic.adminEmail || 'admin@legend.vn'
      const res = await sendInvoiceEmail({
        order: sampleOrder,
        toEmail,
        recipientType: 'admin',
      })
      return NextResponse.json({ success: res.success, simulated: res.simulated, error: res.error })
    }

    return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Lỗi server' }, { status: 500 })
  }
}
