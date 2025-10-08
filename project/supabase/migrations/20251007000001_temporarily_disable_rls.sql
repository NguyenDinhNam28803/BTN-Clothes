-- Temporary disable RLS for development
-- WARNING: This should only be used during development, not in production!
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items DISABLE ROW LEVEL SECURITY;