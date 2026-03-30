-- Supabase Schema for Burger do Gordo

-- 1. Stores Table
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Store Config Table
CREATE TABLE store_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  logo TEXT,
  banner TEXT,
  whatsapp_number TEXT,
  address TEXT,
  location TEXT,
  delivery_fee NUMERIC DEFAULT 0,
  min_order NUMERIC DEFAULT 0,
  open_hours TEXT,
  is_open BOOLEAN DEFAULT true,
  allow_orders_when_closed BOOLEAN DEFAULT false,
  cart_suggestions JSONB DEFAULT '[]',
  free_delivery_over NUMERIC,
  tab_images JSONB DEFAULT '{}',
  loyalty JSONB DEFAULT '{"enabled": false, "pointsPerReal": 1, "welcomeBonus": 0, "rewards": []}'
);

-- 3. Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  image TEXT,
  available BOOLEAN DEFAULT true,
  badge TEXT,
  suggested_products JSONB DEFAULT '[]',
  option_groups JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Neighborhoods Table
CREATE TABLE neighborhoods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fee NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, phone)
);

-- 7. Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  delivery_type TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  address TEXT,
  neighborhood TEXT,
  delivery_fee NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (for customers to browse)
CREATE POLICY "Public read stores" ON stores FOR SELECT USING (true);
CREATE POLICY "Public read store_config" ON store_config FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read neighborhoods" ON neighborhoods FOR SELECT USING (true);

-- Customer Specific Policies
CREATE POLICY "Customers can read their own data" ON customers FOR SELECT USING (true); -- Simplified for demo, ideally filter by phone
CREATE POLICY "Customers can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can read their own orders" ON orders FOR SELECT USING (true); -- Simplified for demo

-- Admin Policies (Ideally use auth.uid() and a roles table, but for simplicity we'll use email check or just allow for now)
-- In a real app, you'd use: CREATE POLICY "Admins can do everything" ON table_name USING (auth.jwt() ->> 'email' = 'admin@email.com');
