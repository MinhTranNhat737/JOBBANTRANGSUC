import 'server-only'

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001/api'

export async function isAdminRequest(req: Request): Promise<boolean> {
  const authorization = req.headers.get('authorization') || ''
  if (!authorization.startsWith('Bearer ')) return false
  try {
    const response = await fetch(`${BACKEND_API}/auth/me`, {
      headers: { Authorization: authorization },
      cache: 'no-store',
    })
    if (!response.ok) return false
    const user = await response.json()
    return user?.role === 'admin' && user?.is_active !== false
  } catch {
    return false
  }
}
