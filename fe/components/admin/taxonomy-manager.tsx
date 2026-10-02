'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { fetchWithAuth } from '@/lib/api'

type Taxonomy = { id: number; name: string; slug: string; sort_order?: number }

export function TaxonomyManager({ kind }: { kind: 'categories' | 'brands' }) {
  const label = kind === 'categories' ? 'Danh mục' : 'Thương hiệu'
  const [items, setItems] = useState<Taxonomy[]>([])
  const [editing, setEditing] = useState<Taxonomy | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetchWithAuth(`/${kind}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `Không thể tải ${label.toLowerCase()}`)
      setItems(Array.isArray(data) ? data : data.data || [])
    } catch (err) { setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi') }
    finally { setLoading(false) }
  }, [kind, label])

  useEffect(() => { void load() }, [load])
  const reset = () => { setEditing(null); setName(''); setSlug('') }
  const edit = (item: Taxonomy) => { setEditing(item); setName(item.name); setSlug(item.slug) }

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('')
    const response = await fetchWithAuth(`/${kind}${editing ? `/${editing.id}` : ''}`, {
      method: editing ? 'PUT' : 'POST',
      body: JSON.stringify({ name: name.trim(), slug: slug.trim(), ...(kind === 'categories' ? { sort_order: editing?.sort_order || 0 } : {}) }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) return setError(data.error || 'Không thể lưu dữ liệu')
    reset(); await load()
  }

  const remove = async (item: Taxonomy) => {
    if (!window.confirm(`Xóa ${label.toLowerCase()} “${item.name}”?`)) return
    const response = await fetchWithAuth(`/${kind}/${item.id}`, { method: 'DELETE' })
    if (!response.ok) { const data = await response.json().catch(() => ({})); return setError(data.error || 'Không thể xóa dữ liệu') }
    await load()
  }

  return <>
    <div className="admin-page-heading" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
      <div><h1>{label}</h1><p>Quản lý {label.toLowerCase()} hiển thị trong cửa hàng.</p></div>
      <button className="admin-btn admin-btn-secondary" onClick={() => void load()}><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Tải lại</button>
    </div>
    {error && <div className="admin-card" style={{ color: 'var(--admin-danger)', marginBottom: 16, padding: 14 }}>{error}</div>}
    <div className="admin-card" style={{ marginBottom: 20, padding: 20 }}>
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(180px, 1fr) auto', gap: 12, alignItems: 'end' }}>
        <label><span className="admin-combobox-label">Tên {label.toLowerCase()}</span><input className="admin-combobox-select" style={{ width: '100%' }} value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label><span className="admin-combobox-label">Slug</span><input className="admin-combobox-select" style={{ width: '100%' }} value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} required /></label>
        <div style={{ display: 'flex', gap: 8 }}><button className="admin-btn admin-btn-primary" type="submit">{editing ? <Pencil size={15} /> : <Plus size={15} />} {editing ? 'Lưu' : 'Thêm'}</button>{editing && <button className="admin-btn admin-btn-secondary" type="button" onClick={reset}><X size={15} /> Hủy</button>}</div>
      </form>
    </div>
    <div className="admin-card"><div className="admin-table-wrap"><table className="admin-table" style={{ width: '100%' }}><thead><tr><th>Tên</th><th>Slug</th><th style={{ width: 110, textAlign: 'right' }}>Thao tác</th></tr></thead><tbody>
      {!loading && items.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: 32 }}>Chưa có dữ liệu.</td></tr>}
      {items.map((item) => <tr key={item.id}><td className="cell-name">{item.name}</td><td><code>{item.slug}</code></td><td><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}><button className="admin-btn-icon" onClick={() => edit(item)} title="Sửa"><Pencil size={15} /></button><button className="admin-btn-icon" style={{ color: 'var(--admin-danger)' }} onClick={() => void remove(item)} title="Xóa"><Trash2 size={15} /></button></div></td></tr>)}
    </tbody></table></div></div>
  </>
}
