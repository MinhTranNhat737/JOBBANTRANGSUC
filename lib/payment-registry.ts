import type { Order } from './admin-data'
import { MOCK_ORDERS } from './admin-data'

export type PaidTransaction = {
  orderId: string
  gateway: 'sepay' | 'momo' | 'cod'
  amount: number
  reference: string
  paidAt: string
}

// Global server in-memory storage for paid transactions across webhooks and polling
const paidOrders = new Map<string, PaidTransaction>()

function normalizeId(id: string): string {
  const num = id.replace(/\D/g, '')
  return num ? `#${num}` : id
}

export function registerPaidOrder({
  orderId,
  gateway,
  amount,
  reference,
}: {
  orderId: string
  gateway: 'sepay' | 'momo' | 'cod'
  amount: number
  reference: string
}): PaidTransaction {
  const normId = normalizeId(orderId)
  const tx: PaidTransaction = {
    orderId: normId,
    gateway,
    amount,
    reference,
    paidAt: new Date().toISOString(),
  }
  paidOrders.set(normId, tx)
  return tx
}

export function getPaidTransaction(orderId: string): PaidTransaction | undefined {
  const normId = normalizeId(orderId)
  return paidOrders.get(normId)
}

export function isOrderPaidOnServer(orderId: string): boolean {
  const normId = normalizeId(orderId)
  return paidOrders.has(normId)
}

/**
 * Finds order from mock orders or builds a fallback order object for notification
 */
export function findOrderForServerProcessing(orderId: string, fallbackAmount?: number): Order {
  const normId = normalizeId(orderId)
  const existing = MOCK_ORDERS.find((o) => o.id === normId)
  if (existing) return existing

  return {
    id: normId,
    customerName: 'Khách hàng VIP',
    customerEmail: 'khachhang@legend.vn',
    customerPhone: '0901 234 567',
    customerAddress: 'Toàn quốc',
    items: [
      {
        slug: 'fine-jewelry-order',
        name: 'Trang Sức Cao Cấp LEGEND',
        image: '/images/p-ring-sapphire.png',
        quantity: 1,
        price: fallbackAmount || 5000000,
      },
    ],
    total: fallbackAmount || 5000000,
    shippingFee: 0,
    status: 'confirmed',
    paymentMethod: 'Đã thanh toán',
    createdAt: new Date().toISOString(),
    timeline: [],
  }
}
