import { PAYMENT_CONFIG } from './payment-config'
import type { Order } from './admin-data'

export type EmailInvoiceLogItem = {
  id: string
  orderId: string
  toEmail: string
  recipientType: 'customer' | 'admin'
  subject: string
  html: string
  status: 'sent' | 'simulated' | 'failed'
  createdAt: string
  error?: string
}

const globalInvoiceLogs: EmailInvoiceLogItem[] = []

export function getInvoiceLogs(): EmailInvoiceLogItem[] {
  return [...globalInvoiceLogs].slice(0, 50)
}

export function formatPriceVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫'
}

/**
 * Builds responsive luxury HTML invoice template matching LEGEND fine jewelry
 */
export function generateOrderInvoiceHtml(order: Order, isAdmin = false): string {
  const isPaid = order.status === 'confirmed' || order.paymentMethod?.includes('SePay') || order.paymentMethod?.includes('MoMo')
  const paymentBadge = isPaid
    ? `<span style="background:#22c55e20;color:#22c55e;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;border:1px solid #22c55e40;">ĐÃ THANH TOÁN</span>`
    : `<span style="background:#ffffff15;color:#e4e4e7;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;border:1px solid #ffffff25;">CHỜ XỬ LÝ / THANH TOÁN</span>`

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:14px 12px;border-bottom:1px solid #27272a;vertical-align:middle;">
        <div style="font-weight:600;color:#ffffff;font-size:14px;">${item.name}</div>
        ${item.size ? `<div style="font-size:12px;color:#a1a1aa;margin-top:2px;">Kích thước / Size: ${item.size}</div>` : ''}
      </td>
      <td style="padding:14px 12px;border-bottom:1px solid #27272a;text-align:center;color:#e4e4e7;font-size:13px;vertical-align:middle;">
        ×${item.quantity}
      </td>
      <td style="padding:14px 12px;border-bottom:1px solid #27272a;text-align:right;color:#ffffff;font-size:13px;font-weight:600;vertical-align:middle;">
        ${formatPriceVnd(item.price * item.quantity)}
      </td>
    </tr>
  `,
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hóa Đơn LEGEND #${order.id}</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#09090b;padding:30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width:620px;background-color:#121215;border:1px solid #27272a;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.6);" cellspacing="0" cellpadding="0">
          
          <!-- Header Logo -->
          <tr>
            <td style="padding:36px 32px 24px;text-align:center;background:linear-gradient(180deg,#1c1c22 0%,#121215 100%);border-bottom:1px solid #27272a;">
              <div style="font-size:26px;font-weight:800;letter-spacing:0.25em;color:#ffffff;text-transform:uppercase;">LEGEND</div>
              <div style="font-size:9px;font-weight:600;letter-spacing:0.35em;color:#a1a1aa;margin-top:4px;text-transform:uppercase;">HANDCRAFTED FINE JEWELRY</div>
              <div style="margin-top:16px;">${paymentBadge}</div>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding:28px 32px 16px;">
              <h1 style="font-size:18px;font-weight:700;color:#ffffff;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">
                ${isAdmin ? `[BẢN SAO QUẢN TRỊ] HÓA ĐƠN ĐƠN HÀNG ${order.id}` : `XÁC NHẬN ĐƠN HÀNG ${order.id}`}
              </h1>
              <p style="font-size:13px;color:#a1a1aa;line-height:1.6;margin:0;">
                ${
                  isAdmin
                    ? `Đơn hàng mới vừa được đặt và thanh toán trên hệ thống. Dưới đây là thông tin chi tiết để đóng gói và xử lý giao nhận.`
                    : `Kính chào quý khách <strong>${order.customerName}</strong>, cảm ơn quý khách đã mua sắm tại LEGEND. Đơn hàng của quý khách đã được tiếp nhận và đóng gói trong hộp nhung bảo hành chính hãng.`
                }
              </p>
            </td>
          </tr>

          <!-- Customer & Shipping Box -->
          <tr>
            <td style="padding:0 32px 20px;">
              <table role="presentation" width="100%" style="background-color:#18181c;border:1px solid #27272a;border-radius:12px;padding:16px;" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size:11px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;">THÔNG TIN NGƯỜI NHẬN</div>
                    <div style="font-size:14px;font-weight:600;color:#ffffff;">${order.customerName}</div>
                    <div style="font-size:13px;color:#d4d4d8;margin-top:4px;">📞 ${order.customerPhone} | 📧 ${order.customerEmail}</div>
                    <div style="font-size:13px;color:#a1a1aa;margin-top:4px;">📍 ${order.customerAddress}</div>
                    ${order.notes ? `<div style="font-size:12px;color:#71717a;margin-top:6px;font-style:italic;">Ghi chú: "${order.notes}"</div>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" style="border-collapse:collapse;width:100%;" cellspacing="0" cellpadding="0">
                <thead>
                  <tr style="border-bottom:1px solid #3f3f46;">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;">Sản phẩm</th>
                    <th style="padding:10px 12px;text-align:center;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;width:60px;">SL</th>
                    <th style="padding:10px 12px;text-align:right;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;width:110px;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Totals -->
              <table role="presentation" width="100%" style="margin-top:16px;" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:4px 12px;font-size:13px;color:#a1a1aa;">Tạm tính:</td>
                  <td style="padding:4px 12px;font-size:13px;color:#ffffff;text-align:right;font-weight:500;">${formatPriceVnd(order.total - order.shippingFee)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 12px;font-size:13px;color:#a1a1aa;">Phí vận chuyển:</td>
                  <td style="padding:4px 12px;font-size:13px;color:#ffffff;text-align:right;font-weight:500;">${order.shippingFee === 0 ? 'Miễn phí' : formatPriceVnd(order.shippingFee)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 12px;font-size:13px;color:#a1a1aa;">Phương thức thanh toán:</td>
                  <td style="padding:4px 12px;font-size:13px;color:#ffffff;text-align:right;font-weight:600;">${order.paymentMethod || 'COD'}</td>
                </tr>
                <tr>
                  <td colspan="2" style="border-top:1px solid #3f3f46;padding-top:10px;"></td>
                </tr>
                <tr>
                  <td style="padding:4px 12px;font-size:15px;color:#ffffff;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">TỔNG THANH TOÁN:</td>
                  <td style="padding:4px 12px;font-size:18px;color:#ffffff;text-align:right;font-weight:800;">${formatPriceVnd(order.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer & Tracking CTA -->
          <tr>
            <td style="padding:24px 32px;background-color:#18181c;border-top:1px solid #27272a;text-align:center;">
              <a href="${PAYMENT_CONFIG.siteUrl}/tracking?id=${encodeURIComponent(order.id)}" style="display:inline-block;background-color:#ffffff;color:#000000;padding:12px 28px;border-radius:30px;font-size:12px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.15em;">
                Theo dõi tiến trình đơn hàng →
              </a>
              <div style="font-size:11px;color:#71717a;margin-top:16px;line-height:1.5;">
                Mọi thắc mắc về đơn hàng, vui lòng liên hệ hotline: <strong>1900 1234</strong> (8:00 - 21:00)<br>
                Bảo hành làm sáng & đánh bóng trang sức bạc 925 trọn đời tại tất cả showroom LEGEND.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()
}

/**
 * Sends order invoice via Resend API or logs simulated email
 */
export async function sendInvoiceEmail({
  order,
  toEmail,
  recipientType,
}: {
  order: Order
  toEmail: string
  recipientType: 'customer' | 'admin'
}): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const isAdmin = recipientType === 'admin'
  const subject = isAdmin
    ? `[ĐƠN HÀNG MỚI] #${order.id} - ${order.customerName} - ${formatPriceVnd(order.total)}`
    : `Hóa đơn xác nhận đơn hàng #${order.id} từ LEGEND Jewelry`

  const html = generateOrderInvoiceHtml(order, isAdmin)
  const { resendApiKey, fromAddress } = PAYMENT_CONFIG.email

  // If no Resend API key, record simulated success
  if (!resendApiKey) {
    const logItem: EmailInvoiceLogItem = {
      id: `mail-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      orderId: order.id,
      toEmail,
      recipientType,
      subject,
      html,
      status: 'simulated',
      createdAt: new Date().toISOString(),
    }
    globalInvoiceLogs.unshift(logItem)
    if (globalInvoiceLogs.length > 100) globalInvoiceLogs.pop()

    return { success: true, simulated: true }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toEmail],
        subject,
        html,
      }),
    })

    const data = await res.json()
    const isOk = res.ok && data?.id

    const logItem: EmailInvoiceLogItem = {
      id: `mail-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      orderId: order.id,
      toEmail,
      recipientType,
      subject,
      html,
      status: isOk ? 'sent' : 'failed',
      createdAt: new Date().toISOString(),
      error: !isOk ? data?.message || 'Failed to send via Resend' : undefined,
    }
    globalInvoiceLogs.unshift(logItem)

    return { success: isOk, error: !isOk ? data?.message : undefined }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Email network failure' }
  }
}

/**
 * Triggers invoice emails to both Customer and Store Admin simultaneously
 */
export async function sendOrderInvoicesToCustomerAndAdmin(order: Order): Promise<{
  customer: { success: boolean; simulated?: boolean }
  admin: { success: boolean; simulated?: boolean }
}> {
  const customerResult = await sendInvoiceEmail({
    order,
    toEmail: order.customerEmail,
    recipientType: 'customer',
  })

  const adminEmail = PAYMENT_CONFIG.email.adminEmail || 'admin@legend.vn'
  const adminResult = await sendInvoiceEmail({
    order,
    toEmail: adminEmail,
    recipientType: 'admin',
  })

  return { customer: customerResult, admin: adminResult }
}
