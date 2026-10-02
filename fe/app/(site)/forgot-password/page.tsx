'use client'
import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { API_URL } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(false)
  async function submit(e: FormEvent) { e.preventDefault(); setLoading(true); const r = await fetch(`${API_URL}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); const d = await r.json(); setMessage(d.message || d.error); setLoading(false) }
  return <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6"><h1 className="font-display text-4xl uppercase tracking-[.15em]">Quên mật khẩu</h1><p className="mt-3 text-sm text-[var(--text-muted)]">Nhập email để nhận liên kết đặt lại mật khẩu.</p><form onSubmit={submit} className="mt-8 space-y-5"><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="w-full border-b border-[var(--border-strong)] bg-transparent py-3 outline-none"/><button disabled={loading} className="w-full rounded-full bg-white py-4 text-xs font-bold uppercase tracking-widest text-black disabled:opacity-50">{loading ? 'Đang gửi...' : 'Gửi liên kết'}</button></form>{message && <p className="mt-5 text-sm">{message}</p>}<Link href="/login" className="mt-6 text-xs underline">Quay lại đăng nhập</Link></main>
}
