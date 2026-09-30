'use client'

import { useState } from 'react'
import { REVENUE_7D, REVENUE_30D, CATEGORY_REVENUE, TOP_PRODUCTS, formatCompactPrice } from '@/lib/admin-data'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d'>('7d')
  const revenueData = period === '7d' ? REVENUE_7D : REVENUE_30D
  const totalRevenue = revenueData.reduce((s, d) => s + d.value, 0)
  const avgRevenue = totalRevenue / revenueData.length
  const maxCatValue = Math.max(...CATEGORY_REVENUE.map(c => c.value))

  // Build sparkline for the area chart
  const width = 700
  const height = 180
  const maxVal = Math.max(...revenueData.map(d => d.value))
  const minVal = Math.min(...revenueData.map(d => d.value)) * 0.8

  const points = revenueData.map((d, i) => {
    const x = (i / (revenueData.length - 1)) * width
    const y = 10 + (1 - (d.value - minVal) / (maxVal - minVal)) * (height - 20)
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

  return (
    <>
      <div className="admin-page-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Phân tích</h1>
          <p>Thống kê chi tiết hoạt động kinh doanh</p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className={`admin-btn ${period === '7d' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => setPeriod('7d')}
            style={{ padding: '6px 14px', fontSize: 13 }}
          >
            7 ngày
          </button>
          <button
            className={`admin-btn ${period === '30d' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => setPeriod('30d')}
            style={{ padding: '6px 14px', fontSize: 13 }}
          >
            30 ngày
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label" style={{ marginBottom: 8 }}>Tổng doanh thu</div>
          <div className="stat-value" style={{ fontSize: 24 }}>{formatCompactPrice(totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ marginBottom: 8 }}>Trung bình/ngày</div>
          <div className="stat-value" style={{ fontSize: 24 }}>{formatCompactPrice(avgRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ marginBottom: 8 }}>Tỷ lệ chuyển đổi</div>
          <div className="stat-value" style={{ fontSize: 24 }}>3.4%</div>
          <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 4 }}>
            1,234 lượt xem → 42 đơn hàng
          </div>
        </div>
      </div>

      {/* Revenue Area Chart */}
      <div className="admin-card" style={{ marginBottom: 28 }}>
        <div className="admin-card-header">
          <h3>Doanh thu theo thời gian</h3>
        </div>
        <div className="admin-card-body" style={{ padding: '20px' }}>
          <svg viewBox={`0 0 ${width} ${height + 20}`} width="100%" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="analyticsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--admin-gold)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--admin-gold)" stopOpacity={0} />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map(frac => (
              <line key={frac} x1={0} y1={10 + frac * (height - 20)} x2={width} y2={10 + frac * (height - 20)} stroke="var(--admin-border)" strokeDasharray="4 4" />
            ))}
            <path d={areaPath} fill="url(#analyticsAreaGrad)" />
            <path d={linePath} fill="none" stroke="var(--admin-gold)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
              (revenueData.length <= 10 || i % Math.ceil(revenueData.length / 10) === 0) && (
                <text key={i} x={p.x} y={height + 16} textAnchor="middle" fill="var(--admin-text-muted)" fontSize={10}>{p.day}</text>
              )
            ))}
          </svg>
        </div>
      </div>

      {/* Two column grid */}
      <div className="analytics-grid">
        {/* Top products */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Top sản phẩm bán chạy</h3>
          </div>
          <div className="admin-card-body">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < TOP_PRODUCTS.length - 1 ? '1px solid var(--admin-border)' : 'none' }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i === 0 ? 'var(--admin-gold-muted)' : 'var(--admin-surface-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  color: i === 0 ? 'var(--admin-gold)' : 'var(--admin-text-muted)',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--admin-text)' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{p.sold} đã bán</div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--admin-gold)' }}>
                  {formatCompactPrice(p.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category bars */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Doanh thu theo danh mục</h3>
          </div>
          <div className="admin-card-body">
            {CATEGORY_REVENUE.map((cat) => (
              <div className="analytics-bar" key={cat.category}>
                <span className="bar-label">{cat.category}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(cat.value / maxCatValue) * 100}%`,
                      background: cat.color,
                    }}
                  />
                </div>
                <span className="bar-value">{formatCompactPrice(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
