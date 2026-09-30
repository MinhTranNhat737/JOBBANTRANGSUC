'use client'

import { useMemo } from 'react'
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import { StatCard } from '@/components/admin/stat-card'
import { ChartRevenue } from '@/components/admin/chart-revenue'
import { ChartCategory } from '@/components/admin/chart-category'
import { RecentOrders } from '@/components/admin/recent-orders'
import { LowStockAlert } from '@/components/admin/low-stock-alert'
import { getAdminStats, formatCompactPrice, MOCK_CUSTOMERS } from '@/lib/admin-data'
import { useOrderStore } from '@/lib/order-store'

// Import product data for low stock
const LOW_STOCK_PRODUCTS = [
  { name: 'Crest Signet Heavy', stock: 2 },
  { name: 'Red Dragon Tag Pendant', stock: 3 },
  { name: 'Fleur Link Bracelet', stock: 4 },
  { name: 'Vermilion Bird Ring', stock: 5 },
]

export default function AdminDashboard() {
  const { orders } = useOrderStore()
  const baseStats = getAdminStats()

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
          change={baseStats.revenue.change}
          trend="up"
        />
        <StatCard
          label="Đơn hàng"
          value={String(dynamicStats.ordersCount)}
          icon={<ShoppingCart size={20} />}
          change={baseStats.orders.change}
          trend="up"
        />
        <StatCard
          label="Khách hàng"
          value={String(MOCK_CUSTOMERS.length)}
          icon={<Users size={20} />}
          change={baseStats.customers.change}
          trend="up"
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
        <LowStockAlert products={LOW_STOCK_PRODUCTS} />
      </div>
    </>
  )
}
