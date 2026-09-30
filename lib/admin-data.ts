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

export const MOCK_ORDERS: Order[] = [
  {
    id: '#1089',
    customerName: 'Nguyễn Minh Tuấn',
    customerEmail: 'minhtuan@email.com',
    customerPhone: '0901 234 567',
    customerAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    items: [
      { slug: 'vermilion-bird-ring', name: 'Vermilion Bird Ring', image: '/images/p-ring-sapphire.png', size: '10', quantity: 1, price: 3890000 },
      { slug: 'libra-lotus-pendant', name: 'Libra Lotus Pendant', image: '/images/p-pendant-lotus.png', quantity: 1, price: 2450000 },
    ],
    total: 6340000,
    shippingFee: 30000,
    status: 'delivered',
    createdAt: '2026-09-27T15:45:00',
    timeline: [
      { date: '2026-09-29T14:30:00', status: 'Đã giao hàng', note: 'Khách đã nhận' },
      { date: '2026-09-28T09:15:00', status: 'Đang vận chuyển' },
      { date: '2026-09-27T16:00:00', status: 'Đã xác nhận' },
      { date: '2026-09-27T15:45:00', status: 'Đặt hàng' },
    ],
  },
  {
    id: '#1088',
    customerName: 'Trần Thu Hà',
    customerEmail: 'thuha@email.com',
    customerPhone: '0912 345 678',
    customerAddress: '45 Lê Lợi, Quận 1, TP.HCM',
    items: [
      { slug: 'fleur-link-bracelet', name: 'Fleur Link Bracelet', image: '/images/p-chain-bracelet.png', size: '19cm', quantity: 1, price: 5790000 },
    ],
    total: 5790000,
    shippingFee: 30000,
    status: 'pending',
    createdAt: '2026-09-29T10:20:00',
    timeline: [
      { date: '2026-09-29T10:20:00', status: 'Đặt hàng' },
    ],
  },
  {
    id: '#1087',
    customerName: 'Lê Hoàng Phúc',
    customerEmail: 'hoangphuc@email.com',
    customerPhone: '0923 456 789',
    customerAddress: '78 Hai Bà Trưng, Quận 3, TP.HCM',
    items: [
      { slug: 'dragon-tag-mini', name: 'Dragon Tag Mini', image: '/images/p-pendant-ruby.png', quantity: 2, price: 1790000 },
    ],
    total: 3580000,
    shippingFee: 30000,
    status: 'shipping',
    createdAt: '2026-09-28T14:00:00',
    timeline: [
      { date: '2026-09-29T08:00:00', status: 'Đang vận chuyển' },
      { date: '2026-09-28T16:30:00', status: 'Đã xác nhận' },
      { date: '2026-09-28T14:00:00', status: 'Đặt hàng' },
    ],
  },
  {
    id: '#1086',
    customerName: 'Phạm Quỳnh Anh',
    customerEmail: 'quynhanh@email.com',
    customerPhone: '0934 567 890',
    customerAddress: '12 Trần Hưng Đạo, Quận 5, TP.HCM',
    items: [
      { slug: 'libra-lotus-pendant', name: 'Libra Lotus Pendant', image: '/images/p-pendant-lotus.png', quantity: 1, price: 2450000 },
    ],
    total: 2450000,
    shippingFee: 0,
    status: 'delivered',
    createdAt: '2026-09-26T09:30:00',
    timeline: [
      { date: '2026-09-28T11:00:00', status: 'Đã giao hàng' },
      { date: '2026-09-27T07:00:00', status: 'Đang vận chuyển' },
      { date: '2026-09-26T10:00:00', status: 'Đã xác nhận' },
      { date: '2026-09-26T09:30:00', status: 'Đặt hàng' },
    ],
  },
  {
    id: '#1085',
    customerName: 'Hoàng Đức Thịnh',
    customerEmail: 'ducthinh@email.com',
    customerPhone: '0945 678 901',
    customerAddress: '56 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội',
    items: [
      { slug: 'gothic-cross-signet', name: 'Gothic Cross Signet Ring', image: '/images/p-ring-signet.png', size: '11', quantity: 1, price: 3250000 },
    ],
    total: 3250000,
    shippingFee: 50000,
    status: 'cancelled',
    createdAt: '2026-09-25T18:00:00',
    timeline: [
      { date: '2026-09-26T09:00:00', status: 'Đã hủy', note: 'Khách yêu cầu hủy' },
      { date: '2026-09-25T18:00:00', status: 'Đặt hàng' },
    ],
  },
  {
    id: '#1084',
    customerName: 'Vũ Thanh Thảo',
    customerEmail: 'thanhthao@email.com',
    customerPhone: '0956 789 012',
    customerAddress: '89 Cách Mạng Tháng 8, Quận 10, TP.HCM',
    items: [
      { slug: 'sunflower-chain-bracelet', name: 'Sunflower Chain Bracelet', image: '/images/p-chain-bracelet.png', size: '17cm', quantity: 1, price: 4590000 },
      { slug: 'mythic-dagger-earring', name: 'Mythic Dagger Earring', image: '/images/p-pendant-dagger.png', quantity: 2, price: 1290000 },
    ],
    total: 7170000,
    shippingFee: 0,
    status: 'confirmed',
    createdAt: '2026-09-29T16:45:00',
    timeline: [
      { date: '2026-09-30T08:00:00', status: 'Đã xác nhận' },
      { date: '2026-09-29T16:45:00', status: 'Đặt hàng' },
    ],
  },
  {
    id: '#1083',
    customerName: 'Đặng Bảo Long',
    customerEmail: 'baolong@email.com',
    customerPhone: '0967 890 123',
    customerAddress: '34 Phạm Ngọc Thạch, Quận 3, TP.HCM',
    items: [
      { slug: 'crest-signet-heavy', name: 'Crest Signet Heavy', image: '/images/p-ring-signet.png', size: '12', quantity: 1, price: 4290000 },
    ],
    total: 4290000,
    shippingFee: 30000,
    status: 'delivered',
    createdAt: '2026-09-24T11:00:00',
    timeline: [
      { date: '2026-09-27T16:00:00', status: 'Đã giao hàng' },
      { date: '2026-09-25T09:00:00', status: 'Đang vận chuyển' },
      { date: '2026-09-24T14:00:00', status: 'Đã xác nhận' },
      { date: '2026-09-24T11:00:00', status: 'Đặt hàng' },
    ],
  },
  {
    id: '#1082',
    customerName: 'Nguyễn Minh Tuấn',
    customerEmail: 'minhtuan@email.com',
    customerPhone: '0901 234 567',
    customerAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    items: [
      { slug: 'red-dragon-tag-pendant', name: 'Red Dragon Tag Pendant', image: '/images/p-pendant-ruby.png', quantity: 1, price: 2690000 },
      { slug: 'chimaera-lock-cuff', name: 'Chimaera Lock Cuff', image: '/images/p-cuff-horseshoe.png', quantity: 1, price: 1450000 },
    ],
    total: 4140000,
    shippingFee: 30000,
    status: 'delivered',
    createdAt: '2026-09-22T13:00:00',
    timeline: [
      { date: '2026-09-25T10:00:00', status: 'Đã giao hàng' },
      { date: '2026-09-23T07:00:00', status: 'Đang vận chuyển' },
      { date: '2026-09-22T15:00:00', status: 'Đã xác nhận' },
      { date: '2026-09-22T13:00:00', status: 'Đặt hàng' },
    ],
  },
  {
    id: '#1081',
    customerName: 'Trần Thu Hà',
    customerEmail: 'thuha@email.com',
    customerPhone: '0912 345 678',
    customerAddress: '45 Lê Lợi, Quận 1, TP.HCM',
    items: [
      { slug: 'azure-scale-band', name: 'Azure Scale Band', image: '/images/p-ring-sapphire.png', size: '9', quantity: 1, price: 2990000 },
    ],
    total: 2990000,
    shippingFee: 30000,
    status: 'delivered',
    createdAt: '2026-09-20T10:00:00',
    timeline: [
      { date: '2026-09-23T14:00:00', status: 'Đã giao hàng' },
      { date: '2026-09-21T08:00:00', status: 'Đang vận chuyển' },
      { date: '2026-09-20T12:00:00', status: 'Đã xác nhận' },
      { date: '2026-09-20T10:00:00', status: 'Đặt hàng' },
    ],
  },
  {
    id: '#1080',
    customerName: 'Lê Hoàng Phúc',
    customerEmail: 'hoangphuc@email.com',
    customerPhone: '0923 456 789',
    customerAddress: '78 Hai Bà Trưng, Quận 3, TP.HCM',
    items: [
      { slug: 'warrior-clip-charm', name: 'Warrior Clip Charm', image: '/images/p-keychain.png', quantity: 1, price: 1590000 },
      { slug: 'horseshoe-hoop', name: 'Horseshoe Hoop Earring', image: '/images/p-cuff-horseshoe.png', quantity: 2, price: 1190000 },
    ],
    total: 3970000,
    shippingFee: 30000,
    status: 'pending',
    createdAt: '2026-09-30T08:30:00',
    timeline: [
      { date: '2026-09-30T08:30:00', status: 'Đặt hàng' },
    ],
  },
]

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    name: 'Nguyễn Minh Tuấn',
    email: 'minhtuan@email.com',
    phone: '0901 234 567',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    totalOrders: 5,
    totalSpent: 18450000,
    joinedAt: '2026-06-15',
    lastOrderAt: '2026-09-27',
  },
  {
    id: 'cust-002',
    name: 'Trần Thu Hà',
    email: 'thuha@email.com',
    phone: '0912 345 678',
    address: '45 Lê Lợi, Quận 1, TP.HCM',
    totalOrders: 3,
    totalSpent: 12790000,
    joinedAt: '2026-07-20',
    lastOrderAt: '2026-09-29',
  },
  {
    id: 'cust-003',
    name: 'Lê Hoàng Phúc',
    email: 'hoangphuc@email.com',
    phone: '0923 456 789',
    address: '78 Hai Bà Trưng, Quận 3, TP.HCM',
    totalOrders: 3,
    totalSpent: 7580000,
    joinedAt: '2026-08-01',
    lastOrderAt: '2026-09-30',
  },
  {
    id: 'cust-004',
    name: 'Phạm Quỳnh Anh',
    email: 'quynhanh@email.com',
    phone: '0934 567 890',
    address: '12 Trần Hưng Đạo, Quận 5, TP.HCM',
    totalOrders: 2,
    totalSpent: 5640000,
    joinedAt: '2026-08-10',
    lastOrderAt: '2026-09-26',
  },
  {
    id: 'cust-005',
    name: 'Hoàng Đức Thịnh',
    email: 'ducthinh@email.com',
    phone: '0945 678 901',
    address: '56 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội',
    totalOrders: 1,
    totalSpent: 3250000,
    joinedAt: '2026-09-10',
    lastOrderAt: '2026-09-25',
  },
  {
    id: 'cust-006',
    name: 'Vũ Thanh Thảo',
    email: 'thanhthao@email.com',
    phone: '0956 789 012',
    address: '89 Cách Mạng Tháng 8, Quận 10, TP.HCM',
    totalOrders: 2,
    totalSpent: 9860000,
    joinedAt: '2026-07-05',
    lastOrderAt: '2026-09-29',
  },
  {
    id: 'cust-007',
    name: 'Đặng Bảo Long',
    email: 'baolong@email.com',
    phone: '0967 890 123',
    address: '34 Phạm Ngọc Thạch, Quận 3, TP.HCM',
    totalOrders: 1,
    totalSpent: 4290000,
    joinedAt: '2026-09-20',
    lastOrderAt: '2026-09-24',
  },
]

// Revenue data for last 7 days
export const REVENUE_7D = [
  { day: 'T2', value: 8450000 },
  { day: 'T3', value: 12300000 },
  { day: 'T4', value: 6780000 },
  { day: 'T5', value: 15200000 },
  { day: 'T6', value: 22100000 },
  { day: 'T7', value: 18900000 },
  { day: 'CN', value: 9500000 },
]

export const REVENUE_30D = [
  { day: '01', value: 5200000 }, { day: '02', value: 8100000 },
  { day: '03', value: 6700000 }, { day: '04', value: 12400000 },
  { day: '05', value: 9800000 }, { day: '06', value: 11200000 },
  { day: '07', value: 7600000 }, { day: '08', value: 14500000 },
  { day: '09', value: 18200000 }, { day: '10', value: 13800000 },
  { day: '11', value: 9100000 }, { day: '12', value: 6300000 },
  { day: '13', value: 15700000 }, { day: '14', value: 21300000 },
  { day: '15', value: 17400000 }, { day: '16', value: 8900000 },
  { day: '17', value: 12600000 }, { day: '18', value: 10200000 },
  { day: '19', value: 7800000 }, { day: '20', value: 19500000 },
  { day: '21', value: 22100000 }, { day: '22', value: 16800000 },
  { day: '23', value: 11400000 }, { day: '24', value: 8200000 },
  { day: '25', value: 14900000 }, { day: '26', value: 20600000 },
  { day: '27', value: 18300000 }, { day: '28', value: 12700000 },
  { day: '29', value: 9400000 }, { day: '30', value: 15100000 },
]

export const CATEGORY_REVENUE = [
  { category: 'Nhẫn bạc', value: 45200000, color: '#ffffff' },
  { category: 'Mặt dây chuyền', value: 36100000, color: '#e4e4e7' },
  { category: 'Vòng & Lắc tay', value: 28700000, color: '#a1a1aa' },
  { category: 'Khuyên tai', value: 12300000, color: '#71717a' },
  { category: 'Phụ kiện', value: 5200000, color: '#52525b' },
]

export const TOP_PRODUCTS = [
  { name: 'Vermilion Bird Ring', sold: 23, revenue: 89470000 },
  { name: 'Sunflower Chain Bracelet', sold: 18, revenue: 82620000 },
  { name: 'Gothic Cross Signet Ring', sold: 15, revenue: 48750000 },
  { name: 'Libra Lotus Pendant', sold: 12, revenue: 29400000 },
  { name: 'Fleur Link Bracelet', sold: 9, revenue: 52110000 },
]

export function getAdminStats() {
  const totalRevenue = MOCK_ORDERS.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  const totalOrders = MOCK_ORDERS.length
  const newCustomers = MOCK_CUSTOMERS.length
  const pendingOrders = MOCK_ORDERS.filter(o => o.status === 'pending').length

  return {
    revenue: { value: 127450000, change: 12.5, trend: 'up' as const },
    orders: { value: totalOrders, change: 8.3, trend: 'up' as const },
    customers: { value: newCustomers * 22, change: 23.1, trend: 'up' as const },
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
