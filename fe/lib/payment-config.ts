// Configuration for SePay, MoMo, Telegram Bot, and Email Invoicing

export const PAYMENT_CONFIG = {
  // ── SEPAY (VietQR Ngân hàng tự động) ──────────────────────────────
  sepay: {
    bankCode: process.env.NEXT_PUBLIC_SEPAY_BANK_CODE || process.env.SEPAY_BANK_CODE || 'MBBank',
    accountNumber: process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NUMBER || process.env.SEPAY_ACCOUNT_NUMBER || '0363132364',
    accountName: process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NAME || process.env.SEPAY_ACCOUNT_NAME || 'TRAN NHAT MINH',
    apiToken: process.env.SEPAY_API_TOKEN || '',
    webhookSecret: process.env.SEPAY_WEBHOOK_SECRET || '',
    template: 'compact2', // compact2, compact, qr_only, print
  },

  // ── MOMO PAYMENT GATEWAY (Ví điện tử MoMo) ────────────────────────
  momo: {
    partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
    accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
    secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1wa8ngfBWR183ei0TYHa0xzC',
    endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
    ipnEndpoint: process.env.MOMO_IPN_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/query',
  },

  // ── TELEGRAM BOT NOTIFICATIONS ────────────────────────────────────
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },

  // ── EMAIL INVOICING (Resend / SMTP) ───────────────────────────────
  email: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    fromAddress: process.env.EMAIL_FROM || 'THUC LUXURY <orders@thucluxury.vn>',
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@thucluxury.vn',
  },


  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
}
