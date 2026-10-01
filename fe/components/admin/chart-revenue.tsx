'use client'

import { useState, useMemo } from 'react'
import { computeDailyRevenue, formatCompactPrice } from '@/lib/admin-data'
import { useOrderStore } from '@/lib/order-store'

const PERIODS = [
  { key: '7d', label: '7 ngày' },
  { key: '30d', label: '30 ngày' },
] as const

export function ChartRevenue() {
  const [period, setPeriod] = useState<'7d' | '30d'>('7d')
  const { orders } = useOrderStore()

  const currentData = useMemo(() => {
    return computeDailyRevenue(orders, period === '7d' ? 7 : 30)
  }, [orders, period])

  const totalRevenue = currentData.reduce((s, d) => s + d.value, 0)
  const maxValue = Math.max(...currentData.map((d) => d.value), 1000000)
  const minValue = Math.min(...currentData.map((d) => d.value), 0)

  // Build SVG path
  const width = 600
  const height = 200
  const padX = 0
  const padY = 10

  const points = currentData.map((d, i) => {
    const x = padX + (i / (currentData.length - 1)) * (width - padX * 2)
    const y =
      totalRevenue === 0
        ? height - padY
        : padY + (1 - (d.value - minValue * 0.8) / (maxValue - minValue * 0.8)) * (height - padY * 2)
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div>
          <h3>Doanh thu</h3>
          <span style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 2, display: 'block' }}>
            Tổng: {formatCompactPrice(totalRevenue)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`admin-btn ${period === p.key ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              style={{ padding: '4px 12px', fontSize: 12 }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="admin-card-body chart-container" style={{ padding: '20px 20px 12px' }}>
        <svg
          viewBox={`0 0 ${width} ${height + 30}`}
          width="100%"
          style={{ overflow: 'visible' }}
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(frac => {
            const y = padY + frac * (height - padY * 2)
            return (
              <line
                key={frac}
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke="var(--admin-border)"
                strokeDasharray="4 4"
              />
            )
          })}

          {/* Area fill */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--admin-gold)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--admin-gold)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#areaGrad)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="var(--admin-gold)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIdx === i ? 6 : 3}
                fill={hoverIdx === i ? 'var(--admin-gold)' : 'var(--admin-bg)'}
                stroke="var(--admin-gold)"
                strokeWidth={2}
                style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              />
              {/* x-axis label */}
              {(currentData.length <= 10 || i % Math.ceil(currentData.length / 10) === 0) && (
                <text
                  x={p.x}
                  y={height + 22}
                  textAnchor="middle"
                  fill="var(--admin-text-muted)"
                  fontSize={11}
                >
                  {p.day}
                </text>
              )}
            </g>
          ))}

          {/* Hover tooltip */}
          {hoverIdx !== null && (
            <g>
              <line
                x1={points[hoverIdx].x}
                y1={padY}
                x2={points[hoverIdx].x}
                y2={height}
                stroke="var(--admin-gold)"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.4}
              />
              <rect
                x={points[hoverIdx].x - 50}
                y={points[hoverIdx].y - 32}
                width={100}
                height={24}
                rx={6}
                fill="var(--admin-surface-elevated)"
                stroke="var(--admin-border-strong)"
                strokeWidth={1}
              />
              <text
                x={points[hoverIdx].x}
                y={points[hoverIdx].y - 16}
                textAnchor="middle"
                fill="var(--admin-gold)"
                fontSize={12}
                fontWeight={600}
              >
                {formatCompactPrice(points[hoverIdx].value)}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}
