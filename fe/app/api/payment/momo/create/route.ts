import { NextResponse } from 'next/server'
import { createMomoPayment } from '@/lib/momo'
import { useOrderStore } from '@/lib/order-store'

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const { getOrderById } = useOrderStore.getState()
    const order = getOrderById(orderId)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const momoRes = await createMomoPayment(order)
    return NextResponse.json(momoRes)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'MoMo error' }, { status: 500 })
  }
}
