/*
  # Women Products Data for BTN Clothes Store

  ## Purpose
  Insert women's clothing products based on the available images

  ## Data Inserted
  - Women category products
  - Product variants for women's clothing
*/

-- Delete previously inserted women products if they exist
DELETE FROM products WHERE id IN (
  '650e8400-e29b-41d4-a716-446655440001',
  '650e8400-e29b-41d4-a716-446655440002',
  '650e8400-e29b-41d4-a716-446655440003',
  '650e8400-e29b-41d4-a716-446655440004',
  '650e8400-e29b-41d4-a716-446655440005',
  '650e8400-e29b-41d4-a716-446655440006',
  '650e8400-e29b-41d4-a716-446655440007',
  '650e8400-e29b-41d4-a716-446655440008',
  '650e8400-e29b-41d4-a716-446655440009',
  '650e8400-e29b-41d4-a716-446655440010'
);

-- Insert Women's Products
INSERT INTO products (id, name, slug, description, category_id, base_price, sale_price, images, is_featured, is_new, status) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Elegant White Dress', 'elegant-white-dress', 'Beautiful elegant white dress perfect for special occasions', '550e8400-e29b-41d4-a716-446655440002', 89.99, 69.99, '["Women/1.webp", "Women/1.1.webp", "Women/1.2.webp", "Women/1.3.webp"]', true, true, 'active'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Casual Denim Outfit', 'casual-denim-outfit', 'Comfortable and stylish denim outfit for everyday wear', '550e8400-e29b-41d4-a716-446655440002', 69.99, null, '["Women/2.webp", "Women/2.1.webp", "Women/2.2.webp"]', false, true, 'active'),
  ('650e8400-e29b-41d4-a716-446655440003', 'Floral Summer Dress', 'floral-summer-dress', 'Light and breezy floral dress for summer days', '550e8400-e29b-41d4-a716-446655440002', 59.99, 49.99, '["Women/3.webp", "Women/3.1.webp", "Women/3.2.webp"]', true, false, 'active'),
  ('650e8400-e29b-41d4-a716-446655440004', 'Classic Black Outfit', 'classic-black-outfit', 'Timeless black outfit suitable for various occasions', '550e8400-e29b-41d4-a716-446655440002', 79.99, 59.99, '["Women/4.webp", "Women/4.1.webp", "Women/4.2.webp", "Women/4.3.webp"]', false, false, 'active'),
  ('650e8400-e29b-41d4-a716-446655440005', 'Premium Fashion Set', 'premium-fashion-set', 'High-quality fashion set for the modern woman', '550e8400-e29b-41d4-a716-446655440002', 129.99, 99.99, '["Women/5.webp", "Women/5.1.webp", "Women/5.2.webp", "Women/5.3.webp", "Women/5.4.webp"]', true, true, 'active'),
  ('650e8400-e29b-41d4-a716-446655440006', 'Casual Chic Outfit', 'casual-chic-outfit', 'Effortlessly chic outfit for a casual yet sophisticated look', '550e8400-e29b-41d4-a716-446655440002', 84.99, null, '["Women/6.webp", "Women/6.1.webp", "Women/6.2.webp", "Women/6.3.webp"]', false, true, 'active'),
  ('650e8400-e29b-41d4-a716-446655440007', 'Modern Stylish Dress', 'modern-stylish-dress', 'Contemporary dress design with unique style elements', '550e8400-e29b-41d4-a716-446655440002', 94.99, 74.99, '["Women/7.webp", "Women/7.1.webp", "Women/7.2.webp", "Women/7.3.webp"]', true, false, 'active'),
  ('650e8400-e29b-41d4-a716-446655440008', 'Luxury Collection Outfit', 'luxury-collection-outfit', 'Premium outfit from our luxury collection', '550e8400-e29b-41d4-a716-446655440002', 149.99, 119.99, '["Women/8.webp", "Women/8.1.webp", "Women/8.2.webp", "Women/8.3.webp", "Women/8.4.webp"]', true, true, 'active'),
  ('650e8400-e29b-41d4-a716-446655440009', 'Designer Fashion Set', 'designer-fashion-set', 'Exclusive designer fashion set with premium materials', '550e8400-e29b-41d4-a716-446655440002', 159.99, null, '["Women/9.webp", "Women/9.1.webp", "Women/9.2.webp", "Women/9.3.webp", "Women/9.4.webp"]', false, false, 'active'),
  ('650e8400-e29b-41d4-a716-446655440010', 'Trendy Season Outfit', 'trendy-season-outfit', 'The latest trendy outfit for the current season', '550e8400-e29b-41d4-a716-446655440002', 109.99, 89.99, '["Women/10.webp", "Women/10.1.webp", "Women/10.2.webp", "Women/10.3.webp"]', true, true, 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert Product Variants for Women's Products
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_adjustment) VALUES
  -- Variants for Product 1
  ('650e8400-e29b-41d4-a716-446655440001', 'XS', 'White', 'EWD-XS-WHITE', 15, 0),
  ('650e8400-e29b-41d4-a716-446655440001', 'S', 'White', 'EWD-S-WHITE', 25, 0),
  ('650e8400-e29b-41d4-a716-446655440001', 'M', 'White', 'EWD-M-WHITE', 30, 0),
  ('650e8400-e29b-41d4-a716-446655440001', 'L', 'White', 'EWD-L-WHITE', 20, 0),
  
  -- Variants for Product 2
  ('650e8400-e29b-41d4-a716-446655440002', 'XS', 'Blue', 'CDO-XS-BLUE', 10, 0),
  ('650e8400-e29b-41d4-a716-446655440002', 'S', 'Blue', 'CDO-S-BLUE', 30, 0),
  ('650e8400-e29b-41d4-a716-446655440002', 'M', 'Blue', 'CDO-M-BLUE', 35, 0),
  ('650e8400-e29b-41d4-a716-446655440002', 'L', 'Blue', 'CDO-L-BLUE', 25, 0),
  
  -- Variants for Product 3
  ('650e8400-e29b-41d4-a716-446655440003', 'XS', 'Floral', 'FSD-XS-FLORAL', 20, 0),
  ('650e8400-e29b-41d4-a716-446655440003', 'S', 'Floral', 'FSD-S-FLORAL', 25, 0),
  ('650e8400-e29b-41d4-a716-446655440003', 'M', 'Floral', 'FSD-M-FLORAL', 30, 0),
  ('650e8400-e29b-41d4-a716-446655440003', 'L', 'Floral', 'FSD-L-FLORAL', 15, 0),
  
  -- Variants for Product 4
  ('650e8400-e29b-41d4-a716-446655440004', 'XS', 'Black', 'CBO-XS-BLACK', 25, 0),
  ('650e8400-e29b-41d4-a716-446655440004', 'S', 'Black', 'CBO-S-BLACK', 30, 0),
  ('650e8400-e29b-41d4-a716-446655440004', 'M', 'Black', 'CBO-M-BLACK', 35, 0),
  ('650e8400-e29b-41d4-a716-446655440004', 'L', 'Black', 'CBO-L-BLACK', 20, 0),
  
  -- Variants for Product 5
  ('650e8400-e29b-41d4-a716-446655440005', 'XS', 'Beige', 'PFS-XS-BEIGE', 15, 0),
  ('650e8400-e29b-41d4-a716-446655440005', 'S', 'Beige', 'PFS-S-BEIGE', 25, 0),
  ('650e8400-e29b-41d4-a716-446655440005', 'M', 'Beige', 'PFS-M-BEIGE', 30, 0),
  ('650e8400-e29b-41d4-a716-446655440005', 'L', 'Beige', 'PFS-L-BEIGE', 20, 0),
  
  -- Variants for Product 6
  ('650e8400-e29b-41d4-a716-446655440006', 'XS', 'Multi', 'CCO-XS-MULTI', 10, 0),
  ('650e8400-e29b-41d4-a716-446655440006', 'S', 'Multi', 'CCO-S-MULTI', 20, 0),
  ('650e8400-e29b-41d4-a716-446655440006', 'M', 'Multi', 'CCO-M-MULTI', 25, 0),
  ('650e8400-e29b-41d4-a716-446655440006', 'L', 'Multi', 'CCO-L-MULTI', 15, 0),
  
  -- Variants for Product 7
  ('650e8400-e29b-41d4-a716-446655440007', 'XS', 'Brown', 'MSD-XS-BROWN', 20, 0),
  ('650e8400-e29b-41d4-a716-446655440007', 'S', 'Brown', 'MSD-S-BROWN', 25, 0),
  ('650e8400-e29b-41d4-a716-446655440007', 'M', 'Brown', 'MSD-M-BROWN', 35, 0),
  ('650e8400-e29b-41d4-a716-446655440007', 'L', 'Brown', 'MSD-L-BROWN', 15, 0),
  
  -- Variants for Product 8
  ('650e8400-e29b-41d4-a716-446655440008', 'XS', 'Cream', 'LCO-XS-CREAM', 15, 0),
  ('650e8400-e29b-41d4-a716-446655440008', 'S', 'Cream', 'LCO-S-CREAM', 25, 0),
  ('650e8400-e29b-41d4-a716-446655440008', 'M', 'Cream', 'LCO-M-CREAM', 30, 0),
  ('650e8400-e29b-41d4-a716-446655440008', 'L', 'Cream', 'LCO-L-CREAM', 20, 0),
  
  -- Variants for Product 9
  ('650e8400-e29b-41d4-a716-446655440009', 'XS', 'Gray', 'DFS-XS-GRAY', 10, 0),
  ('650e8400-e29b-41d4-a716-446655440009', 'S', 'Gray', 'DFS-S-GRAY', 20, 0),
  ('650e8400-e29b-41d4-a716-446655440009', 'M', 'Gray', 'DFS-M-GRAY', 25, 0),
  ('650e8400-e29b-41d4-a716-446655440009', 'L', 'Gray', 'DFS-L-GRAY', 15, 0),
  
  -- Variants for Product 10
  ('650e8400-e29b-41d4-a716-446655440010', 'XS', 'Pink', 'TSO-XS-PINK', 15, 0),
  ('650e8400-e29b-41d4-a716-446655440010', 'S', 'Pink', 'TSO-S-PINK', 25, 0),
  ('650e8400-e29b-41d4-a716-446655440010', 'M', 'Pink', 'TSO-M-PINK', 30, 0),
  ('650e8400-e29b-41d4-a716-446655440010', 'L', 'Pink', 'TSO-L-PINK', 20, 0)
ON CONFLICT (product_id, size, color) DO NOTHING;

-- Display results
SELECT id, name, slug, base_price, sale_price FROM products ORDER BY id;
SELECT product_id, size, color, sku FROM product_variants ORDER BY product_id, size;