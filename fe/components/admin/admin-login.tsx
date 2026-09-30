'use client'

import { useState } from 'react'
import { useAdmin } from '@/lib/admin-store'

export function AdminLogin() {
  const { login } = useAdmin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const ok = login(email, password)
    if (!ok) {
      setError('Email hoặc mật khẩu không đúng')
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="login-logo">
          <h1>THUC LUXURY</h1>
          <span>Admin Panel</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="admin-label">Email</label>
            <input
              className="admin-input"
              type="email"
              placeholder="admin@thucluxury.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="admin-label">Mật khẩu</label>
            <input
              className="admin-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 20, height: 44, fontSize: 14, fontWeight: 600 }}
          >
            Đăng nhập
          </button>

          <p style={{ marginTop: 16, fontSize: 12, color: 'var(--admin-text-muted)', textAlign: 'center' }}>
            Demo: admin@legend.vn / legend2024
          </p>
        </form>
      </div>
    </div>
  )
}
