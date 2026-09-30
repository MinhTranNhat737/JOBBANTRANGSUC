import { PAYMENT_CONFIG } from './payment-config'
import type { Order } from './admin-data'

export type SepayWebhookPayload = {
  id: number
  gateway: string
  transactionDate: string
  accountNumber: string
  subAccount?: string
  amountIn: number
  amountOut: number
  accumulated: number
  code: string | null
  transactionContent: string
  referenceNumber: string
  body?: string
}

export type SepayPaymentInfo = {
  bankCode: string
  accountNumber: string
  accountName: string
  amount: number
  orderCode: string
  qrUrl: string
}

/**
 * Normalizes order code for bank transfer content (e.g. #1090 -> LEGEND1090)
 */
export function getSepayTransferDescription(orderId: string): string {
  const cleanNum = orderId.replace(/\D/g, '') || '1090'
  return `THUC${cleanNum}`
}


/**
 * Builds payment info and VietQR image URL for an order
 */
export function generateSepayPaymentInfo(order: Order): SepayPaymentInfo {
  const { bankCode, accountNumber, accountName, template } = PAYMENT_CONFIG.sepay
  const description = getSepayTransferDescription(order.id)
  const amount = order.total

  // SePay dynamic VietQR image API
  const qrUrl = `https://qr.sepay.vn/img?acc=${encodeURIComponent(accountNumber)}&bank=${encodeURIComponent(
    bankCode,
  )}&amount=${amount}&des=${encodeURIComponent(description)}&template=${template}`

  return {
    bankCode,
    accountNumber,
    accountName,
    amount,
    orderCode: description,
    qrUrl,
  }
}

/**
 * Extracts order ID from transfer content (e.g., "LEGEND1090" -> "#1090")
 */
export function parseOrderIdFromTransferContent(content: string): string | null {
  if (!content) return null
  const match =
    content.match(/THUC\s*(\d+)/i) ||
    content.match(/LEGEND\s*(\d+)/i) ||
    content.match(/DH\s*(\d+)/i) ||
    content.match(/#?(\d{4,})/i)
  if (match && match[1]) {
    return `#${match[1]}`
  }
  return null
}

