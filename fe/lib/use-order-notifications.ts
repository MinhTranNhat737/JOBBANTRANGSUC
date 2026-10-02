'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchWithAuth } from './api'
import { useAdmin } from './admin-store'

export type OrderNotification = { id: string; customerName: string; total: number; status: string; createdAt: string }

export function useOrderNotifications() {
  const token = useAdmin((state) => state.token)
  const [orders, setOrders] = useState<OrderNotification[]>([])
  const initialized = useRef(false)
  const latestId = useRef<string | null>(null)

  const refresh = useCallback(async () => {
    if (!token) { setOrders([]); return }
    try {
      const response = await fetchWithAuth('/api/orders?limit=10', { cache: 'no-store' })
      if (!response.ok) return
      const data = await response.json()
      const next: OrderNotification[] = Array.isArray(data.orders) ? data.orders : []
      const newest = next[0]
      if (initialized.current && newest && latestId.current && newest.id !== latestId.current && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('THUC LUXURY có đơn hàng mới', { body: `${newest.id} · ${newest.customerName || 'Khách hàng'} · ${Number(newest.total || 0).toLocaleString('vi-VN')}₫` })
      }
      latestId.current = newest?.id || null
      initialized.current = true
      setOrders(next)
    } catch (error) { console.warn('Không thể tải thông báo đơn hàng:', error) }
  }, [token])

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(refresh, 15000)
    return () => window.clearInterval(timer)
  }, [refresh])

  return { orders, pendingCount: orders.filter((order) => order.status === 'pending').length, refresh }
}
