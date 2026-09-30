'use client'

import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: string
  icon: ReactNode
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  suffix?: string
}

export function StatCard({ label, value, icon, change, trend = 'neutral', suffix }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      {change !== undefined && (
        <div className={`stat-trend ${trend}`}>
          {trend === 'up' && '▲'}
          {trend === 'down' && '▼'}
          {trend === 'neutral' && '⚠'}
          {' '}
          {trend === 'neutral' ? suffix : `${change > 0 ? '+' : ''}${change}% so với tuần trước`}
        </div>
      )}
    </div>
  )
}
