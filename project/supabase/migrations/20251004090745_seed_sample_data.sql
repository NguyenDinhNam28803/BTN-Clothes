/*
  # Seed Sample Data for BTN Clothes Store

  ## Purpose
  Populate the database with sample data for testing and demonstration

  ## Data Inserted
  - Categories (Men, Women, Kids, Accessories)
  - Products (20 sample products)
  - Product variants (sizes and colors)
  - Vouchers (discount codes)
*/

-- Insert Categories
INSERT INTO categories (id, name, slug, description, image_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Men', 'men', 'Mens fashion collection', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Women', 'women', 'Womens fashion collection', 'https://images.pexels.com/photos/972995/pexels-photo-972995.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Kids', 'kids', 'Kids fashion collection', 'https://images.pexels.com/photos/1620653/pexels-photo-1620653.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Accessories', 'accessories', 'Fashion accessories', 'https://images.pexels.com/photos/322207/pexels-photo-322207.jpeg')
ON CONFLICT (id) DO NOTHING;

-- Insert Products
INSERT INTO products (id, name, slug, description, category_id, base_price, sale_price, images, is_featured, is_new, status) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Premium Cotton Shirt', 'premium-cotton-shirt', 'Comfortable and stylish cotton shirt perfect for any occasion', '550e8400-e29b-41d4-a716-446655440001', 49.99, 34.99, '["https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg", "https://images.pexels.com/photos/1926770/pexels-photo-1926770.jpeg"]', true, true, 'active'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Designer Jeans', 'designer-jeans', 'Premium denim jeans with modern fit', '550e8400-e29b-41d4-a716-446655440001', 89.99, 62.99, '["https://images.pexels.com/photos/1926771/pexels-photo-1926771.jpeg"]', true, false, 'active'),
  ('650e8400-e29b-41d4-a716-446655440003', 'Leather Jacket', 'leather-jacket', 'Genuine leather jacket for style and warmth', '550e8400-e29b-41d4-a716-446655440001', 199.99, 149.99, '["https://images.pexels.com/photos/1926772/pexels-photo-1926772.jpeg"]', true, false, 'active'),
  ('650e8400-e29b-41d4-a716-446655440004', 'Summer Dress', 'summer-dress', 'Light and breezy summer dress', '550e8400-e29b-41d4-a716-446655440002', 69.99, null, '["https://images.pexels.com/photos/1926773/pexels-photo-1926773.jpeg"]', false, true, 'active'),
  ('650e8400-e29b-41d4-a716-446655440005', 'Casual T-Shirt', 'casual-t-shirt', 'Comfortable everyday t-shirt', '550e8400-e29b-41d4-a716-446655440001', 24.99, 19.99, '["https://images.pexels.com/photos/1926774/pexels-photo-1926774.jpeg"]', false, true, 'active'),
  ('650e8400-e29b-41d4-a716-446655440006', 'Formal Blazer', 'formal-blazer', 'Professional blazer for business occasions', '550e8400-e29b-41d4-a716-446655440001', 149.99, null, '["https://images.pexels.com/photos/1926775/pexels-photo-1926775.jpeg"]', false, false, 'active'),
  ('650e8400-e29b-41d4-a716-446655440007', 'Midi Skirt', 'midi-skirt', 'Elegant midi skirt for various occasions', '550e8400-e29b-41d4-a716-446655440002', 54.99, 38.49, '["https://images.pexels.com/photos/1926776/pexels-photo-1926776.jpeg"]', false, true, 'active'),
  ('650e8400-e29b-41d4-a716-446655440008', 'Kids Hoodie', 'kids-hoodie', 'Warm and cozy hoodie for kids', '550e8400-e29b-41d4-a716-446655440003', 34.99, 24.99, '["https://images.pexels.com/photos/1926777/pexels-photo-1926777.jpeg"]', false, true, 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert Product Variants
INSERT INTO product_variants (id, product_id, size, color, sku, stock_quantity, price_adjustment) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'S', 'Blue', 'PCS-S-BLUE', 25, 0),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'M', 'Blue', 'PCS-M-BLUE', 45, 0),
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'L', 'Blue', 'PCS-L-BLUE', 30, 0),
  ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 'M', 'White', 'PCS-M-WHITE', 50, 0),
  ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', 'M', 'Black', 'PCS-M-BLACK', 40, 0),
  
  ('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', '30', 'Blue', 'DJ-30-BLUE', 20, 0),
  ('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440002', '32', 'Blue', 'DJ-32-BLUE', 30, 0),
  ('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440002', '34', 'Black', 'DJ-34-BLACK', 25, 0),
  
  ('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440003', 'M', 'Black', 'LJ-M-BLACK', 15, 0),
  ('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440003', 'L', 'Black', 'LJ-L-BLACK', 10, 0),
  
  ('750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440004', 'S', 'Pink', 'SD-S-PINK', 35, 0),
  ('750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440004', 'M', 'Pink', 'SD-M-PINK', 40, 0),
  ('750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440004', 'L', 'White', 'SD-L-WHITE', 30, 0),
  
  ('750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440005', 'M', 'Gray', 'CT-M-GRAY', 60, 0),
  ('750e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440005', 'L', 'Gray', 'CT-L-GRAY', 55, 0)
ON CONFLICT (id) DO NOTHING;

-- Insert Vouchers
INSERT INTO vouchers (id, code, description, discount_type, discount_value, min_order_value, max_uses, valid_from, valid_until, is_active) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', 'WELCOME20', '20% off your first order', 'percentage', 20, 50, 1000, NOW(), NOW() + INTERVAL '3 months', true),
  ('850e8400-e29b-41d4-a716-446655440002', 'FREESHIP', 'Free shipping on all orders', 'fixed', 10, 30, 0, NOW(), NOW() + INTERVAL '1 month', true),
  ('850e8400-e29b-41d4-a716-446655440003', 'SAVE50', '$50 off orders over $200', 'fixed', 50, 200, 500, NOW(), NOW() + INTERVAL '2 months', true),
  ('850e8400-e29b-41d4-a716-446655440004', 'FLASH30', '30% off flash sale', 'percentage', 30, 0, 300, NOW(), NOW() + INTERVAL '7 days', true),
  ('850e8400-e29b-41d4-a716-446655440005', 'SUMMER25', '25% off summer collection', 'percentage', 25, 75, 0, NOW(), NOW() + INTERVAL '1 month', true)
ON CONFLICT (id) DO NOTHING;