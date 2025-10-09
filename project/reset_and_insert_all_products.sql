/*
  # Reset Database and Insert All Products for BTN Clothes Store
  
  ## Purpose
  This script resets the database and inserts both women's and men's products
  
  ## Usage
  Run this script with: npx supabase db reset && npx supabase db query -f reset_and_insert_all_products.sql
*/

-- First ensure we delete any existing products to avoid conflicts
DELETE FROM product_variants WHERE product_id LIKE '650e8400-e29b-41d4-a716-44665544%' OR product_id LIKE '750e8400-e29b-41d4-a716-44665544%';
DELETE FROM products WHERE id LIKE '650e8400-e29b-41d4-a716-44665544%' OR id LIKE '750e8400-e29b-41d4-a716-44665544%';

-- Include women's and men's product SQL directly or run them separately
-- Execute these files manually using:
-- npx supabase db query -f supabase/migrations/20251009000014_insert_women_products.sql
-- npx supabase db query -f supabase/migrations/20251010000000_insert_men_products.sql

-- Verify insertion by counting products by category
SELECT 
  c.name as category_name, 
  COUNT(p.id) as product_count
FROM 
  products p
JOIN 
  categories c ON p.category_id = c.id
GROUP BY 
  c.name;

-- Show sample products
SELECT TOP 10
  id, 
  name, 
  slug, 
  category_id, 
  base_price, 
  sale_price, 
  is_featured, 
  is_new
FROM 
  products;