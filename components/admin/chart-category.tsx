'use client'

import { useState } from 'react'
import { CATEGORY_REVENUE, formatCompactPrice } from '@/lib/admin-data'

export function ChartCategory() {
  const total = CATEGORY_REVENUE.reduce((s, c) => s + c.value, 0)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  // Build donut segments
  const radius = 70
  const cx = 90
  const cy = 90
  const strokeWidth = 28
  const circumference = 2 * Math.PI * radius
  let cumulativeOffset = 0

  const segments = CATEGORY_REVENUE.map((cat, i) => {
    const pct = cat.value / total
    const dashArray = `${pct * circumference} ${circumference}`
    const offset = -cumulativeOffset * circumference
    cumulativeOffset += pct
    return { ...cat, pct, dashArray, offset, index: i }
  })

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>Doanh thu theo danh mục</h3>
      </div>
      <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        {/* Donut */}
        <svg width={180} height={180} viewBox="0 0 180 180">
          {segments.map((seg) => (
            <circle
              key={seg.category}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={hoverIdx === seg.index ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ cursor: 'pointer', transition: 'stroke-width 0.2s' }}
              onMouseEnter={() => setHoverIdx(seg.index)}
              onMouseLeave={() => setHoverIdx(null)}
              opacity={hoverIdx !== null && hoverIdx !== seg.index ? 0.5 : 1}
            />
          ))}
          {/* Center text */}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--admin-text)" fontSize={16} fontWeight={700} fontFamily="var(--font-cinzel)">
            {formatCompactPrice(total)}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--admin-text-muted)" fontSize={10}>
            Tổng doanh thu
          </text>
        </svg>

        {/* Legend */}
        <div style={{ width: '100%' }}>
          {CATEGORY_REVENUE.map((cat, i) => (
            <div
              key={cat.category}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 0',
                borderBottom: i < CATEGORY_REVENUE.length - 1 ? '1px solid var(--admin-border)' : 'none',
                opacity: hoverIdx !== null && hoverIdx !== i ? 0.5 : 1,
                transition: 'opacity 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <span style={{ width: 10, height: 10, borderRadius: 3, background: cat.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: 'var(--admin-text-secondary)' }}>{cat.category}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>
                {Math.round(cat.value / total * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
