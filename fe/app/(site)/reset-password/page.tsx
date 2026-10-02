'use client'
import { FormEvent, Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { API_URL } from '@/lib/api'

function ResetForm() { const token = useSearchParams().get('token'); const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); async function submit(e: FormEvent) { e.preventDefault(); const r = await fetch(`${API_URL}/auth/reset-password`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({token,password}) }); const d=await r.json(); setMessage(d.message||d.error) } return <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6"><h1 className="font-display text-4xl uppercase tracking-[.15em]">Mật khẩu mới</h1>{token ? <form onSubmit={submit} className="mt-8 space-y-5"><input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Tối thiểu 8 ký tự" className="w-full border-b border-[var(--border-strong)] bg-transparent py-3 outline-none"/><button className="w-full rounded-full bg-white py-4 text-xs font-bold uppercase tracking-widest text-black">Đặt lại mật khẩu</button></form> : <p className="mt-6 text-rose-400">Thiếu token đặt lại mật khẩu.</p>}{message&&<p className="mt-5 text-sm">{message}</p>}<Link href="/login" className="mt-6 text-xs underline">Đăng nhập</Link></main> }
export default function ResetPasswordPage(){ return <Suspense><ResetForm/></Suspense> }
