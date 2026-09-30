'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_ORDERS, type Order, type OrderStatus } from '@/lib/admin-data'
import { API_BASE_URL } from '@/lib/products'

type NewOrderInput = {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  notes?: string
  paymentMethod?: string
  paymentGateway?: 'sepay' | 'momo' | 'cod'
  paymentStatus?: 'pending' | 'paid' | 'failed'
  transactionId?: string
  paidAt?: string
  customerId?: string
  shippingFee?: number
  items: {
    slug: string
    name: string
    image: string
    size?: string
    quantity: number
    price: number
  }[]
  total: number
}

type OrderStoreState = {
  orders: Order[]
  createOrder: (input: NewOrderInput) => Order
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void
  markOrderAsPaid: (orderId: string, gateway: 'sepay' | 'momo', transactionId?: string) => void
  getOrderById: (orderId: string) => Order | undefined
  getOrdersForCustomer: (customerId?: string, email?: string, phone?: string) => Order[]
  syncOrders: (newOrders: Order[]) => void
}

export const useOrderStore = create<OrderStoreState>()(
  persist(
    (set, get) => ({
      orders: MOCK_ORDERS,
      syncOrders: (newOrders) => {
        set({ orders: newOrders })
      },
      createOrder: (input) => {
        const state = get()
        // Generate order number, e.g. #1090, #1091...
        const numericIds = state.orders
          .map((o) => parseInt(o.id.replace(/\D/g, ''), 10))
          .filter((n) => !isNaN(n))
        const nextNum = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1090
        const id = `#${nextNum}`
        const now = new Date().toISOString()

        const newOrder: Order = {
          id,
          customerName: input.customerName.trim(),
          customerEmail: input.customerEmail.trim(),
          customerPhone: input.customerPhone.trim(),
          customerAddress: input.customerAddress.trim(),
          items: input.items,
          total: input.total,
          shippingFee: input.shippingFee ?? 30000,
          status: input.paymentStatus === 'paid' ? 'confirmed' : 'pending',
          createdAt: now,
          notes: input.notes,
          paymentMethod: input.paymentMethod || 'COD',
          paymentGateway: input.paymentGateway || (input.paymentMethod?.includes('MoMo') ? 'momo' : input.paymentMethod?.includes('VietQR') ? 'sepay' : 'cod'),
          paymentStatus: input.paymentStatus || 'pending',
          transactionId: input.transactionId,
          paidAt: input.paidAt,
          customerId: input.customerId,
          timeline: [
            {
              date: now,
              status: input.paymentStatus === 'paid' ? 'Đã thanh toán thành công' : 'Đặt hàng thành công',
              note: input.paymentStatus === 'paid'
                ? `Thanh toán thành công qua ${input.paymentGateway === 'momo' ? 'MoMo' : 'SePay (VietQR)'}`
                : 'Đơn hàng mới đã được gửi về hệ thống cửa hàng để xử lý',
            },
          ],
        }

        set((s) => ({ orders: [newOrder, ...s.orders] }))

        // Đồng bộ đơn hàng lên Backend PostgreSQL Database
        try {
          fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: id,
              customer_id: input.customerId ? parseInt(input.customerId) : null,
              payment_method: input.paymentGateway || (input.paymentMethod?.includes('MoMo') ? 'momo' : input.paymentMethod?.includes('VietQR') ? 'sepay' : 'cod'),
              shipping_name: input.customerName,
              shipping_phone: input.customerPhone,
              shipping_addr: input.customerAddress,
              note: input.notes,
              items: input.items.map((it) => ({
                product_id: (it as any).id || null,
                name: it.name,
                unit_price: it.price,
                quantity: it.quantity,
              })),
            }),
          }).catch((err) => console.warn('Order DB sync background warning:', err))
        } catch (e) {
          // ignore
        }

        return newOrder
      },
      markOrderAsPaid: (orderId, gateway, transactionId) => {
        const normalizedId = orderId.startsWith('#') ? orderId : `#${orderId}`
        const now = new Date().toISOString()
        const gatewayName = gateway === 'momo' ? 'Ví MoMo' : 'Chuyển khoản SePay (VietQR)'

        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== normalizedId) return o
            return {
              ...o,
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
                ...o.timeline,
              ],
            }
          }),
        }))
      },
      updateOrderStatus: (orderId, status, note) => {
        const normalizedId = orderId.startsWith('#') ? orderId : `#${orderId}`
        const now = new Date().toISOString()
        const STATUS_TITLE_MAP: Record<OrderStatus, string> = {
          pending: 'Chờ xử lý',
          confirmed: 'Đã xác nhận đơn hàng',
          shipping: 'Đang vận chuyển',
          delivered: 'Đã giao hàng thành công',
          cancelled: 'Đã hủy đơn hàng',
        }

        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== normalizedId) return o
            return {
              ...o,
              status,
              timeline: [
                {
                  date: now,
                  status: STATUS_TITLE_MAP[status] || status,
                  note: note || `Trạng thái cập nhật: ${STATUS_TITLE_MAP[status]}`,
                },
                ...o.timeline,
              ],
            }
          }),
        }))
      },
      getOrderById: (orderId) => {
        const normalizedId = orderId.startsWith('#') ? orderId : `#${orderId}`
        return get().orders.find((o) => o.id === normalizedId || o.id.replace('#', '') === orderId)
      },
      getOrdersForCustomer: (customerId, email, phone) => {
        const orders = get().orders
        const cleanPhone = phone ? phone.replace(/\s+/g, '') : ''
        const cleanEmail = email ? email.toLowerCase().trim() : ''

        return orders.filter((o) => {
          if (customerId && o.customerId === customerId) return true
          if (cleanEmail && o.customerEmail.toLowerCase().trim() === cleanEmail) return true
          if (cleanPhone && o.customerPhone.replace(/\s+/g, '') === cleanPhone) return true
          return false
        })
      },
    }),
    {
      name: 'legend-orders',
      partialize: (state) => ({ orders: state.orders }),
    },
  ),
)
