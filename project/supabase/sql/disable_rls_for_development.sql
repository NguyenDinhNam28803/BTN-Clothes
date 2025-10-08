-- Tạm thời vô hiệu hóa RLS cho các bảng trong quá trình phát triển
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_vouchers DISABLE ROW LEVEL SECURITY;
ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;

-- Bảo đảm rằng có chính sách cho PUBLIC access vào các bảng chính
CREATE POLICY IF NOT EXISTS "Allow public read access to products" 
  ON products FOR SELECT 
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read access to categories" 
  ON categories FOR SELECT 
  USING (true);

-- QUAN TRỌNG: Bảo đảm chính sách cho tài khoản mới
CREATE POLICY IF NOT EXISTS "Allow users to insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Allow users to view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Allow users to update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);