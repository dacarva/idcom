import { NextRequest, NextResponse } from 'next/server'
import { orderService } from '@/services/order.service'

/**
 * GET /api/orders/by-id?orderId=ORDER-123
 * Fetch order from database by order_id
 * Used for polling CID updates from background archival
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId parameter' },
        { status: 400 }
      )
    }

    const order = await orderService.getOrderByOrderId(orderId)

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          orderId: order.order_id,
          userId: order.user_id,
          cid: order.cid,
          status: order.status,
          encryptionSalt: order.encryption_salt,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Get order by ID failed:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
