'use client'

import { useState } from 'react'
import { useAdmin } from '@/lib/admin-store'

export function AdminLogin() {
  const { login } = useAdmin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    if (!result.success) setError(result.error || 'Email hoặc mật khẩu không đúng')
    setLoading(false)
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
            disabled={loading}
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 20, height: 44, fontSize: 14, fontWeight: 600 }}
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>

        </form>
      </div>
    </div>
  )
}
