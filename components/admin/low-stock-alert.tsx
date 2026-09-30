'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

type LowStockProduct = {
  name: string
  stock: number
}

export function LowStockAlert({ products }: { products: LowStockProduct[] }) {
  if (products.length === 0) return null

  return (
    <div className="admin-card low-stock-card">
      <div className="admin-card-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} style={{ color: 'var(--admin-warning)' }} />
          Sắp hết hàng
        </h3>
      </div>
      <div className="admin-card-body">
        {products.map((p) => (
          <div className="low-stock-item" key={p.name}>
            <span className="stock-name">{p.name}</span>
            <span className="stock-count">{p.stock}</span>
          </div>
        ))}
        <Link
          href="/admin/products"
          style={{ display: 'block', marginTop: 12, fontSize: 13, color: 'var(--admin-gold)' }}
        >
          Xem kho hàng →
        </Link>
      </div>
    </div>
  )
}
