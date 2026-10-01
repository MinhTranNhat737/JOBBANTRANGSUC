'use client'

import Link from 'next/link'
import { XCircle, CheckCircle2 } from 'lucide-react'

type OutOfStockProduct = {
  name: string
  stock: number
}

export function LowStockAlert({ products = [] }: { products?: OutOfStockProduct[] }) {
  const outOfStockItems = products.filter((p) => p.stock <= 0)

  return (
    <div className="admin-card low-stock-card">
      <div className="admin-card-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          {outOfStockItems.length > 0 ? (
            <>
              <XCircle size={16} style={{ color: '#f87171' }} />
              <span style={{ color: '#f87171' }}>Sản phẩm đã hết hàng ({outOfStockItems.length})</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} style={{ color: '#4ade80' }} />
              <span style={{ color: '#4ade80' }}>Kho hàng sẵn sàng</span>
            </>
          )}
        </h3>
      </div>
      <div className="admin-card-body">
        {outOfStockItems.length === 0 ? (
          <div style={{ color: 'var(--admin-text-secondary)', fontSize: 12.5, padding: '8px 0' }}>
            Tất cả các tác phẩm trang sức (kể cả tác phẩm độc bản 1 chiếc) đều sẵn sàng phục vụ khách hàng.
          </div>
        ) : (
          outOfStockItems.map((p) => (
            <div className="low-stock-item" key={p.name}>
              <span className="stock-name" style={{ color: '#ffffff' }}>{p.name}</span>
              <span
                className="stock-count"
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                Hết hàng
              </span>
            </div>
          ))
        )}
        <Link
          href="/admin/inventory"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 14,
            fontSize: 13,
            color: 'var(--admin-gold)',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Kiểm kê kho &amp; Nhập hàng →
        </Link>
      </div>
    </div>
  )
}
