-- Create orders table for idcom
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10, 2) NOT NULL,
  subsidy DECIMAL(10, 2) DEFAULT 0,
  shipping DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  cid TEXT UNIQUE, -- Filecoin Content ID
  status TEXT DEFAULT 'pending', -- pending, confirmed, shipped, delivered
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_cid ON orders(cid);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Enable public read access for verification (anyone can verify by CID)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read orders by CID"
ON orders FOR SELECT
USING (true);
