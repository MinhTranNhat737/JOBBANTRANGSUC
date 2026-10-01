// ── Admin Mock Data ──────────────────────────────────────────────
// All data is client-side mock for demo purposes.

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'

export type Order = {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  items: {
    slug: string
    name: string
    image: string
    size?: string
    quantity: number
    price: number
  }[]
  total: number
  shippingFee: number
  status: OrderStatus
  createdAt: string
  timeline: { date: string; status: string; note?: string }[]
  notes?: string
  paymentMethod?: string
  customerId?: string
  paymentStatus?: 'pending' | 'paid' | 'failed'
  paymentGateway?: 'sepay' | 'momo' | 'cod'
  transactionId?: string
  paidAt?: string
}

export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  totalOrders: number
  totalSpent: number
  joinedAt: string
  lastOrderAt: string
}

export const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Chờ xử lý', color: '#d4d4d8', bg: 'rgba(255,255,255,0.12)' },
  confirmed: { label: 'Đã xác nhận', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  shipping: { label: 'Đang giao', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  delivered: { label: 'Đã giao', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  cancelled: { label: 'Đã hủy', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
}

export const MOCK_ORDERS: Order[] = []

export const MOCK_CUSTOMERS: Customer[] = []

// Revenue data templates / dynamic calculations
export const REVENUE_7D: { day: string; value: number }[] = []
export const REVENUE_30D: { day: string; value: number }[] = []
export const CATEGORY_REVENUE: { category: string; value: number; color: string }[] = []
export const TOP_PRODUCTS: { name: string; sold: number; revenue: number }[] = []

export function computeDailyRevenue(orders: Order[], days: 7 | 30 = 7) {
  const result: { day: string; value: number }[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const label =
      days === 7
        ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]
        : String(d.getDate()).padStart(2, '0')
    const datePrefix = d.toISOString().slice(0, 10)

    const sum = orders
      .filter((o) => o.status !== 'cancelled' && o.createdAt?.startsWith(datePrefix))
      .reduce((acc, o) => acc + (o.total || 0), 0)

    result.push({ day: label, value: sum })
  }
  return result
}

export function computeCategoryRevenue(orders: Order[]) {
  const catMap: Record<string, number> = {}
  orders.forEach((o) => {
    if (o.status === 'cancelled') return
    o.items?.forEach((item) => {
      const cat = (item as any).category || 'Trang sức cao cấp'
      catMap[cat] = (catMap[cat] || 0) + (item.price || 0) * (item.quantity || 1)
    })
  })

  const COLORS = ['#ffffff', '#e4e4e7', '#a1a1aa', '#71717a', '#52525b']
  return Object.entries(catMap).map(([category, value], i) => ({
    category,
    value,
    color: COLORS[i % COLORS.length],
  }))
}

export function computeTopProducts(orders: Order[]) {
  const prodMap: Record<string, { name: string; sold: number; revenue: number }> = {}
  orders.forEach((o) => {
    if (o.status === 'cancelled') return
    o.items?.forEach((item) => {
      const name = item.name || 'Sản phẩm'
      if (!prodMap[name]) {
        prodMap[name] = { name, sold: 0, revenue: 0 }
      }
      const qty = item.quantity || 1
      prodMap[name].sold += qty
      prodMap[name].revenue += (item.price || 0) * qty
    })
  })

  return Object.values(prodMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
}

export function getAdminStats() {
  const totalRevenue = MOCK_ORDERS.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  const totalOrders = MOCK_ORDERS.length
  const newCustomers = MOCK_CUSTOMERS.length
  const pendingOrders = MOCK_ORDERS.filter(o => o.status === 'pending').length

  return {
    revenue: { value: totalRevenue, change: 0, trend: 'neutral' as const },
    orders: { value: totalOrders, change: 0, trend: 'neutral' as const },
    customers: { value: newCustomers, change: 0, trend: 'neutral' as const },
    pendingOrders: { value: pendingOrders, change: 0, trend: 'neutral' as const },
  }
}

export function formatCompactPrice(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B₫`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M₫`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K₫`
  return `${value}₫`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}
