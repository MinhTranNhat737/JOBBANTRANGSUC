'use client'

import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { use } from 'react'

export default function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--admin-text-secondary)', textDecoration: 'none', marginBottom: 12 }}>
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>
        <h1 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 26, fontWeight: 700, color: 'var(--admin-text)', letterSpacing: '0.04em' }}>
          Chỉnh sửa sản phẩm
        </h1>
        <p style={{ fontSize: 14, color: 'var(--admin-text-secondary)', marginTop: 4 }}>
          Slug: <code style={{ background: 'var(--admin-surface-elevated)', padding: '2px 8px', borderRadius: 4, fontSize: 13 }}>{slug}</code>
        </p>
      </div>

      <div className="form-section" style={{ maxWidth: 600 }}>
        <h3>Chỉnh sửa sản phẩm</h3>
        <p style={{ color: 'var(--admin-text-secondary)', fontSize: 14 }}>
          Đây là trang demo. Trong phiên bản production, form này sẽ load dữ liệu sản phẩm hiện tại và cho phép chỉnh sửa.
        </p>
        <div className="form-actions" style={{ paddingTop: 16 }}>
          <Link href="/admin/products" className="admin-btn admin-btn-secondary">
            Quay lại
          </Link>
          <button className="admin-btn admin-btn-primary">
            <Save size={16} /> Lưu thay đổi
          </button>
        </div>
      </div>
    </>
  )
}
