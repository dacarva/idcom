import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not configured. Database features will be limited.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions
export interface Order {
  id: string
  order_id: string
  user_id: string
  items: any[]
  total: number
  subtotal: number
  subsidy: number
  shipping: number
  shipping_address: {
    firstName: string
    lastName: string
    address: string
    city: string
    postalCode: string
  }
  payment_method: string
  cid?: string | null // Filecoin CID
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  created_at: string
  updated_at: string
}
