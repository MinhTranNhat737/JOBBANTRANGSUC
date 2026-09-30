import { PAYMENT_CONFIG } from './payment-config'
import { getDynamicSettings } from './payment-settings-store'
import type { Order } from './admin-data'

export type TelegramLogItem = {
  id: string
  orderId: string
  message: string
  status: 'sent' | 'simulated' | 'failed'
  createdAt: string
  error?: string
}

// Global in-memory storage for notification logs
const globalTelegramLogs: TelegramLogItem[] = []

export function getTelegramLogs(): TelegramLogItem[] {
  return [...globalTelegramLogs].slice(0, 50)
}

export function formatPriceVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫'
}

export function formatDateTimeVi(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Builds high-converting, beautifully structured Telegram notification message
 */
export function buildOrderTelegramMessage(order: Order, paymentNote?: string): string {
  const isPaid = order.status === 'confirmed' || order.paymentMethod?.includes('SePay') || order.paymentMethod?.includes('MoMo')
  const statusIcon = isPaid ? '✅ ĐÃ THANH TOÁN THÀNH CÔNG' : '⏳ CHỜ THANH TOÁN / XÁC NHẬN'

  const itemsList = order.items
    .map(
      (item, idx) =>
        `  ${idx + 1}. <b>${item.name}</b> ${item.size ? `(Size: ${item.size})` : ''} × ${item.quantity}\n     ↳ <i>${formatPriceVnd(item.price * item.quantity)}</i>`,
    )
    .join('\n')

  return `
👑 <b>ĐƠN HÀNG MỚI TẠI THUC LUXURY</b> 👑
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 <b>Mã đơn hàng:</b> <code>${order.id}</code>
⚡ <b>Trạng thái:</b> ${statusIcon}
${paymentNote ? `💳 <b>Cổng thanh toán:</b> ${paymentNote}\n` : `💳 <b>Phương thức:</b> ${order.paymentMethod || 'COD'}\n`}
👤 <b>Khách hàng:</b> ${order.customerName}
📞 <b>Số điện thoại:</b> <code>${order.customerPhone}</code>
📧 <b>Email:</b> ${order.customerEmail}
📍 <b>Địa chỉ giao:</b> ${order.customerAddress}
${order.notes ? `📝 <b>Ghi chú:</b> <i>${order.notes}</i>\n` : ''}
🛍️ <b>Chi tiết sản phẩm:</b>
${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 <b>Tổng tiền:</b> <b>${formatPriceVnd(order.total)}</b>
🚚 <b>Phí vận chuyển:</b> ${order.shippingFee === 0 ? 'Miễn phí' : formatPriceVnd(order.shippingFee)}
⏰ <b>Thời gian:</b> ${formatDateTimeVi(order.createdAt)}

👉 <a href="${PAYMENT_CONFIG.siteUrl}/admin/orders/${order.id.replace('#', '')}">Xem đơn hàng trên Admin Dashboard</a>
`.trim()
}

/**
 * Sends notification directly to Telegram Bot API
 */
export async function sendTelegramMessage(htmlContent: string): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const dynamic = getDynamicSettings()
  const botToken = dynamic.telegramBotToken || PAYMENT_CONFIG.telegram.botToken
  const chatId = dynamic.telegramChatId || PAYMENT_CONFIG.telegram.chatId

  // If credentials are not set, return simulated with clear note
  if (!botToken || !chatId || botToken === 'demo_token') {
    return {
      success: true,
      simulated: true,
      error: 'Chưa điền TELEGRAM_BOT_TOKEN và TELEGRAM_CHAT_ID tại Cài đặt Admin hoặc .env.local',
    }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlContent,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    })

    const data = await res.json()
    if (!res.ok || !data.ok) {
      return { success: false, error: data.description || 'Telegram API error' }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to call Telegram API' }
  }
}

export function recordTelegramLog(
  orderId: string,
  message: string,
  status: 'sent' | 'simulated' | 'failed',
  error?: string,
): TelegramLogItem {
  const logItem: TelegramLogItem = {
    id: `tg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    orderId,
    message,
    status,
    createdAt: new Date().toISOString(),
    error,
  }
  globalTelegramLogs.unshift(logItem)
  if (globalTelegramLogs.length > 100) globalTelegramLogs.pop()
  return logItem
}

/**
 * Sends order notification to Telegram and logs the event
 */
export async function sendOrderNotificationToTelegram(
  order: Order,
  paymentNote?: string,
): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const message = buildOrderTelegramMessage(order, paymentNote)
  const result = await sendTelegramMessage(message)

  recordTelegramLog(
    order.id,
    message,
    result.simulated ? 'simulated' : result.success ? 'sent' : 'failed',
    result.error,
  )

  return result
}
