import { useAdmin } from './admin-store'

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export async function fetchWithAuth(path: string, init: RequestInit = {}) {
  const token = useAdmin.getState().token
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const target = path.startsWith('http') || path.startsWith('/api/') ? path : `${API_URL}${path}`
  const response = await fetch(target, { ...init, headers })
  if (response.status === 401) useAdmin.getState().logout()
  return response
}
