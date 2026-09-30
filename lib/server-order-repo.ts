import fs from 'fs'
import path from 'path'
import { MOCK_ORDERS, type Order, type OrderStatus } from './admin-data'

const DATA_DIR = path.join(process.cwd(), 'data')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(MOCK_ORDERS, null, 2), 'utf-8')
  }
}

export function getAllServerOrders(): Order[] {
  try {
    ensureDataFile()
    const content = fs.readFileSync(ORDERS_FILE, 'utf-8')
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) {
      return parsed
    }
    return MOCK_ORDERS
  } catch (err) {
    console.error('Error reading server orders:', err)
    return MOCK_ORDERS
  }
}

export function saveServerOrder(newOrder: Order): Order {
  try {
    ensureDataFile()
    const orders = getAllServerOrders()
    // Check if order already exists
    const idx = orders.findIndex((o) => o.id === newOrder.id)
    if (idx >= 0) {
      orders[idx] = newOrder
    } else {
      orders.unshift(newOrder)
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8')
    return newOrder
  } catch (err) {
    console.error('Error saving server order:', err)
    return newOrder
  }
}

export function updateServerOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
): Order | undefined {
  try {
    ensureDataFile()
    const orders = getAllServerOrders()
    const normalizedId = orderId.startsWith('#') ? orderId : `#${orderId}`
    const idx = orders.findIndex((o) => o.id === normalizedId || o.id.replace('#', '') === orderId)
    if (idx === -1) return undefined

    const now = new Date().toISOString()
    const STATUS_TITLE_MAP: Record<OrderStatus, string> = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận đơn hàng',
      shipping: 'Đang vận chuyển',
      delivered: 'Đã giao hàng thành công',
      cancelled: 'Đã hủy đơn hàng',
    }

    orders[idx] = {
      ...orders[idx],
      status,
      timeline: [
        {
          date: now,
          status: STATUS_TITLE_MAP[status] || status,
          note: note || `Trạng thái cập nhật: ${STATUS_TITLE_MAP[status]}`,
        },
        ...orders[idx].timeline,
      ],
    }

    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8')
    return orders[idx]
  } catch (err) {
    console.error('Error updating server order:', err)
    return undefined
  }
}

export function markServerOrderAsPaid(
  orderId: string,
  gateway: 'sepay' | 'momo' | 'cod',
  transactionId?: string,
): Order | undefined {
  try {
    ensureDataFile()
    const orders = getAllServerOrders()
    const normalizedId = orderId.startsWith('#') ? orderId : `#${orderId}`
    const idx = orders.findIndex((o) => o.id === normalizedId || o.id.replace('#', '') === orderId)
    if (idx === -1) return undefined

    const now = new Date().toISOString()
    const gatewayName =
      gateway === 'momo' ? 'Ví MoMo' : gateway === 'sepay' ? 'SePay (VietQR)' : 'COD'

    orders[idx] = {
      ...orders[idx],
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentGateway: gateway,
      transactionId: transactionId || `TX-${Date.now()}`,
      paidAt: now,
      timeline: [
        {
          date: now,
          status: 'Đã thanh toán',
          note: `Xác nhận nhận thanh toán thành công qua ${gatewayName}. Mã GD: ${transactionId || 'Tự động xác thực'}`,
        },
        ...orders[idx].timeline,
      ],
    }

    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8')
    return orders[idx]
  } catch (err) {
    console.error('Error marking server order paid:', err)
    return undefined
  }
}
