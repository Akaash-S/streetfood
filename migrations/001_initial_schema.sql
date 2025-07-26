-- Street Food Ecosystem Platform Database Schema
-- Run this script in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('vendor', 'shop_owner', 'delivery_agent')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create retail_shops table
CREATE TABLE IF NOT EXISTS retail_shops (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id VARCHAR REFERENCES users(id) NOT NULL,
    shop_name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id VARCHAR REFERENCES retail_shops(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    unit TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id VARCHAR REFERENCES users(id) NOT NULL,
    shop_id VARCHAR REFERENCES retail_shops(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR REFERENCES orders(id) NOT NULL,
    product_id VARCHAR REFERENCES products(id) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR REFERENCES orders(id) NOT NULL,
    vendor_id VARCHAR REFERENCES users(id) NOT NULL,
    shop_id VARCHAR REFERENCES retail_shops(id) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create delivery_requests table
CREATE TABLE IF NOT EXISTS delivery_requests (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR REFERENCES orders(id) NOT NULL,
    agent_id VARCHAR REFERENCES users(id),
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'accepted', 'picked_up', 'in_transit', 'delivered')),
    delivery_fee DECIMAL(10,2) NOT NULL,
    estimated_distance DECIMAL(5,2),
    estimated_time INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_retail_shops_owner_id ON retail_shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_status ON delivery_requests(status);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_agent_id ON delivery_requests(agent_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_retail_shops_updated_at BEFORE UPDATE ON retail_shops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_requests_updated_at BEFORE UPDATE ON delivery_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE retail_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic examples - customize based on your security requirements)
-- Users can read their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (firebase_uid = auth.uid()::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (firebase_uid = auth.uid()::text);

-- Shop owners can manage their shops
CREATE POLICY "Shop owners can view own shops" ON retail_shops FOR SELECT USING (
    owner_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text)
);

-- Add more policies as needed for your specific use case

COMMENT ON TABLE users IS 'Stores user information for all platform users (vendors, shop owners, delivery agents)';
COMMENT ON TABLE retail_shops IS 'Stores information about retail shops owned by shop owners';
COMMENT ON TABLE products IS 'Stores products available in retail shops';
COMMENT ON TABLE orders IS 'Stores orders placed by vendors to retail shops';
COMMENT ON TABLE order_items IS 'Stores individual items in each order';
COMMENT ON TABLE ratings IS 'Stores ratings and reviews given by vendors to shops';
COMMENT ON TABLE delivery_requests IS 'Stores delivery requests for completed orders';
