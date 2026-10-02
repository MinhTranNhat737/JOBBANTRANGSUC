import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/products'
import { updateServerOrderStatus } from '@/lib/server-order-repo'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { orderId, items } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Thiếu orderId' }, { status: 400 })
    }

    // 1. Gọi Backend PostgreSQL Express Server để trừ kho thật trong Database
    let backendResult: any = null
    try {
      const beRes = await fetch(`${API_BASE_URL}/inventory/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: req.headers.get('authorization') || '' },
        body: JSON.stringify(body),
      })
      if (beRes.ok) {
        backendResult = await beRes.json()
      } else {
        const error = await beRes.json().catch(() => ({ error: 'Không thể xuất kho trên backend' }))
        return NextResponse.json(error, { status: beRes.status })
      }
    } catch (e: any) {
      console.warn('Backend inventory dispatch call warning:', e.message)
      return NextResponse.json({ error: `Không thể kết nối backend kho: ${e.message}` }, { status: 502 })
    }

    // 2. Cập nhật trạng thái đơn hàng trên Next.js Server repo thành "shipping"
    const updatedOrder = updateServerOrderStatus(
      orderId,
      'shipping',
      'Đã xuất kho thành công. Sản phẩm đã trừ tồn kho và bắt đầu chuyển giao cho bưu tá vận chuyển.',
    )

    return NextResponse.json({
      success: true,
      message: backendResult?.message || `Đã xuất kho cho đơn hàng ${orderId} và chuyển trạng thái sang "Đang giao"`,
      orderId,
      status: 'shipping',
      dispatchedProducts: backendResult?.dispatchedProducts || [],
      order: updatedOrder,
    })
  } catch (err: any) {
    console.error('API /api/inventory/dispatch error:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
