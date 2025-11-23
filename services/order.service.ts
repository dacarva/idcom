import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Order } from '@/lib/supabase';

/**
 * Save order to Supabase
 */
export async function saveOrder(orderData: {
  orderId: string;
  userId: string;
  items: any[];
  subtotal: number;
  subsidy: number;
  shipping: number;
  total: number;
  shippingAddress: any;
  paymentMethod: string;
  timestamp: string;
  cid?: string | null;
  encryption_salt?: string;
}): Promise<Order> {
  try {
    const { data, error } = await supabaseAdmin
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
          encryption_salt: orderData.encryption_salt || null,
          status: 'pending',
          created_at: orderData.timestamp,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save order: ${error.message}`);
    }

    console.log(`✅ Order saved to database: ${orderData.orderId}`);
    return data as Order;
  } catch (error) {
    console.error('❌ Database save failed:', error);
    throw error;
  }
}

/**
 * Get order by CID
 */
export async function getOrderByCid(cid: string): Promise<Order | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('cid', cid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get order: ${error.message}`);
    }

    return data as Order;
  } catch (error) {
    console.error('❌ Database query failed:', error);
    throw error;
  }
}

/**
 * Get order by order_id
 */
export async function getOrderByOrderId(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get order: ${error.message}`);
    }

    return data as Order;
  } catch (error) {
    console.error('❌ Database query failed:', error);
    throw error;
  }
}

/**
 * Get all orders for a user
 */
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get orders: ${error.message}`);
    }

    return (data || []) as Order[];
  } catch (error) {
    console.error('❌ Database query failed:', error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
): Promise<Order> {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update order: ${error.message}`);
    }

    console.log(`✅ Order status updated: ${orderId} → ${status}`);
    return data as Order;
  } catch (error) {
    console.error('❌ Database update failed:', error);
    throw error;
  }
}

/**
 * Update order CID by order_id (best-effort after background archival)
 */
export async function updateOrderCid(orderId: string, cid: string): Promise<Order> {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({
        cid,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update order CID: ${error.message}`)
    }

    console.log(`✅ Order CID updated: ${orderId} → ${cid}`)
    return data as Order
  } catch (error) {
    console.error('❌ Database update (CID) failed:', error)
    throw error
  }
}

/**
 * Check if Supabase is configured
 */
export function isConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

// Export as namespace object for backward compatibility
export const orderService = {
  saveOrder,
  getOrderByCid,
  getOrderByOrderId,
  getOrdersByUserId,
  updateOrderStatus,
  updateOrderCid,
  isConfigured,
};
