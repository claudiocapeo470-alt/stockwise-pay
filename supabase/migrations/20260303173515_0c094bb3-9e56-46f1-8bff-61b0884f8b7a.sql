-- Configuration de la boutique en ligne
CREATE TABLE IF NOT EXISTS online_store (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  logo_url text,
  banner_url text,
  primary_color text DEFAULT '#4f46e5',
  whatsapp text,
  phone text,
  email text,
  address text,
  is_published boolean DEFAULT false,
  show_stock boolean DEFAULT true,
  allow_orders boolean DEFAULT true,
  delivery_fee numeric DEFAULT 0,
  delivery_info text,
  free_delivery_minimum numeric DEFAULT 0,
  enable_reviews boolean DEFAULT true,
  maintenance_mode boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE online_store ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own store" ON online_store FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can view published stores" ON online_store FOR SELECT TO anon USING (is_published = true AND maintenance_mode = false);
CREATE POLICY "Authenticated can view published stores" ON online_store FOR SELECT TO authenticated USING (is_published = true AND maintenance_mode = false);

-- Produits publiés dans la boutique
CREATE TABLE IF NOT EXISTS store_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES online_store(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  is_featured boolean DEFAULT false,
  online_price numeric,
  online_description text,
  published_at timestamptz DEFAULT now(),
  UNIQUE(store_id, product_id)
);

ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their store products" ON store_products FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM online_store WHERE online_store.id = store_products.store_id AND online_store.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM online_store WHERE online_store.id = store_products.store_id AND online_store.user_id = auth.uid())
);
CREATE POLICY "Public can view store products" ON store_products FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM online_store WHERE online_store.id = store_products.store_id AND online_store.is_published = true)
);
CREATE POLICY "Authenticated public can view store products" ON store_products FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM online_store WHERE online_store.id = store_products.store_id AND online_store.is_published = true)
);

-- Commandes
CREATE TABLE IF NOT EXISTS store_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES online_store(id) ON DELETE CASCADE NOT NULL,
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  customer_address text,
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  delivery_fee numeric DEFAULT 0,
  total numeric NOT NULL,
  status text DEFAULT 'pending',
  payment_method text DEFAULT 'cash_on_delivery',
  payment_status text DEFAULT 'unpaid',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can manage orders" ON store_orders FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM online_store WHERE online_store.id = store_orders.store_id AND online_store.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM online_store WHERE online_store.id = store_orders.store_id AND online_store.user_id = auth.uid())
);
CREATE POLICY "Public can create orders" ON store_orders FOR INSERT TO anon WITH CHECK (
  EXISTS (SELECT 1 FROM online_store WHERE online_store.id = store_orders.store_id AND online_store.is_published = true AND online_store.allow_orders = true)
);
CREATE POLICY "Authenticated can create orders" ON store_orders FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM online_store WHERE online_store.id = store_orders.store_id AND online_store.is_published = true AND online_store.allow_orders = true)
);

-- Articles de commande
CREATE TABLE IF NOT EXISTS store_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES store_orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  product_icon text,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL
);

ALTER TABLE store_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can view order items" ON store_order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM store_orders JOIN online_store ON online_store.id = store_orders.store_id WHERE store_orders.id = store_order_items.order_id AND online_store.user_id = auth.uid())
);
CREATE POLICY "Public can insert order items" ON store_order_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated can insert order items" ON store_order_items FOR INSERT TO authenticated WITH CHECK (true);

-- Avis clients
CREATE TABLE IF NOT EXISTS store_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES online_store(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id),
  customer_name text NOT NULL,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  comment text,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE store_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can manage reviews" ON store_reviews FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM online_store WHERE online_store.id = store_reviews.store_id AND online_store.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM online_store WHERE online_store.id = store_reviews.store_id AND online_store.user_id = auth.uid())
);
CREATE POLICY "Public can create reviews" ON store_reviews FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public can view approved reviews" ON store_reviews FOR SELECT TO anon USING (is_approved = true);
CREATE POLICY "Authenticated can create reviews" ON store_reviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can view approved reviews" ON store_reviews FOR SELECT TO authenticated USING (is_approved = true);

-- Allow public read on products for store display
CREATE POLICY "Public can view products via store" ON products FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM store_products sp JOIN online_store os ON os.id = sp.store_id WHERE sp.product_id = products.id AND os.is_published = true)
);