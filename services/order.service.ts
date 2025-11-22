import { supabase, Order } from '@/lib/supabase'

/**
 * OrderService - Handles all order database operations
 * Saves orders to Supabase with CID from Filecoin
 */
class OrderService {
  /**
   * Save order to Supabase
   * Called after successful Filecoin archival
   */
  async saveOrder(orderData: {
    orderId: string
    userId: string
    items: any[]
    subtotal: number
    subsidy: number
    shipping: number
    total: number
    shippingAddress: any
    paymentMethod: string
    timestamp: string
    cid?: string | null
    wallet_address?: string
    wallet_signature?: string
    encryption_salt?: string
  }): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            order_id: orderData.orderId,
            user_id: orderData.userId,
            items: orderData.items,
            subtotal: orderData.subtotal,
            subsidy: orderData.subsidy,
            shipping: orderData.shipping,
            total: orderData.total,
            shipping_address: orderData.shippingAddress,
            payment_method: orderData.paymentMethod,
            cid: orderData.cid || null,
            wallet_address: orderData.wallet_address || null,
            wallet_signature: orderData.wallet_signature || null,
            encryption_salt: orderData.encryption_salt || null,
            status: 'pending',
            created_at: orderData.timestamp,
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to save order: ${error.message}`)
      }

      console.log(`✅ Order saved to database: ${orderData.orderId}`)
      return data as Order
    } catch (error) {
      console.error('❌ Database save failed:', error)
      throw error
    }
  }

  /**
   * Get order by CID
   * Used for verification page
   */
  async getOrderByCid(cid: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('cid', cid)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null
        }
        throw new Error(`Failed to get order: ${error.message}`)
      }

      return data as Order
    } catch (error) {
      console.error('❌ Database query failed:', error)
      throw error
    }
  }

  /**
   * Get order by order_id
   */
  async getOrderByOrderId(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw new Error(`Failed to get order: ${error.message}`)
      }

      return data as Order
    } catch (error) {
      console.error('❌ Database query failed:', error)
      throw error
    }
  }

  /**
   * Get all orders for a user
   */
  async getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to get orders: ${error.message}`)
      }

      return (data || []) as Order[]
    } catch (error) {
      console.error('❌ Database query failed:', error)
      throw error
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  ): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update order: ${error.message}`)
      }

      console.log(`✅ Order status updated: ${orderId} → ${status}`)
      return data as Order
    } catch (error) {
      console.error('❌ Database update failed:', error)
      throw error
    }
  }

  /**
   * Check if Supabase is configured
   */
  isConfigured(): boolean {
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
}

export const orderService = new OrderService()
