'use client'

import { useMemo, useState, useEffect } from 'react'
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import { StatCard } from '@/components/admin/stat-card'
import { ChartRevenue } from '@/components/admin/chart-revenue'
import { ChartCategory } from '@/components/admin/chart-category'
import { RecentOrders } from '@/components/admin/recent-orders'
import { LowStockAlert } from '@/components/admin/low-stock-alert'
import { getAdminStats, formatCompactPrice } from '@/lib/admin-data'
import { useOrderStore } from '@/lib/order-store'

export default function AdminDashboard() {
  const { orders } = useOrderStore()
  const baseStats = getAdminStats()
  const [outOfStockProducts, setOutOfStockProducts] = useState<{ name: string; stock: number }[]>([])
  const [customerCount, setCustomerCount] = useState(0)

  useEffect(() => {
    fetch('/api/customers', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.total === 'number') {
          setCustomerCount(data.total)
        } else if (data && Array.isArray(data.customers)) {
          setCustomerCount(data.customers.length)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/inventory', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.products && Array.isArray(data.products)) {
          const outOfStock = data.products
            .filter((p: any) => parseInt(p.quantity ?? p.stock ?? 0) <= 0)
            .map((p: any) => ({ name: p.name, stock: 0 }))
          setOutOfStockProducts(outOfStock)
        }
      })
      .catch((err) => console.error('Dashboard inventory fetch error:', err))
  }, [])

  const dynamicStats = useMemo(() => {
    const totalRev = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((s, o) => s + o.total, 0)
    const totalOrders = orders.length
    const pendingCount = orders.filter((o) => o.status === 'pending').length

    return {
      revenue: totalRev,
      ordersCount: totalOrders,
      pendingCount,
    }
  }, [orders])

  return (
    <>
      <div className="admin-page-heading">
        <h1>Dashboard</h1>
        <p>Tổng quan hoạt động kinh doanh & tiếp nhận đơn</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards-grid">
        <StatCard
          label="Doanh thu"
          value={formatCompactPrice(dynamicStats.revenue)}
          icon={<DollarSign size={20} />}
          change={0}
          trend="neutral"
        />
        <StatCard
          label="Đơn hàng"
          value={String(dynamicStats.ordersCount)}
          icon={<ShoppingCart size={20} />}
          change={0}
          trend="neutral"
        />
        <StatCard
          label="Khách hàng"
          value={String(customerCount)}
          icon={<Users size={20} />}
          change={0}
          trend="neutral"
        />
        <StatCard
          label="Chờ xử lý"
          value={String(dynamicStats.pendingCount)}
          icon={<Package size={20} />}
          change={0}
          trend={dynamicStats.pendingCount > 0 ? 'up' : 'neutral'}
          suffix={`${dynamicStats.pendingCount} đơn cần xử lý`}
        />
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <ChartRevenue />
        <ChartCategory />
      </div>

      {/* Bottom section */}
      <div className="dashboard-bottom">
        <RecentOrders />
        <LowStockAlert products={outOfStockProducts} />
      </div>
    </>
  )
}
