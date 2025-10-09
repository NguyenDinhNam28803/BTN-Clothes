/*
  # Men Products Data for BTN Clothes Store

  ## Purpose
  Insert men's clothing products based on the available images

  ## Data Inserted
  - Men category products
  - Product variants for men's clothing
*/

-- Insert Men's Products with proper image paths
INSERT INTO products (id, name, slug, description, category_id, base_price, sale_price, images, is_featured, is_new, status) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'Designer Track Jacket', 'designer-track-jacket', 'An iconic designer track jacket with a striking logo graphic. Perfect for an elevated street look and athletic flair.', '550e8400-e29b-41d4-a716-446655440001', 99.99, 79.99, '["Men/1.webp", "Men/1.2.webp", "Men/1.3.webp", "Men/1.4.webp"]', true, true, 'active'),
  
  ('750e8400-e29b-41d4-a716-446655440002', 'Relaxed Linen Shirt', 'relaxed-linen-shirt', 'The quintessential relaxed linen shirt. Lightweight, breathable, and designed for superior comfort during your weekend escapes.', '550e8400-e29b-41d4-a716-446655440001', 69.99, null, '["Men/2.webp", "Men/2.1.webp", "Men/2.3.webp"]', false, true, 'active'),
  
  ('750e8400-e29b-41d4-a716-446655440003', 'Utility Overshirt', 'utility-overshirt', 'A rugged yet refined utility overshirt (shacket). Features a durable fabric blend and an oversized fit for versatile layering.', '550e8400-e29b-41d4-a716-446655440001', 89.99, 79.99, '["Men/3.avif", "Men/3.1.avif", "Men/3.3.webp", "Men/3.4.webp"]', true, false, 'active'),
  
  ('750e8400-e29b-41d4-a716-446655440004', 'Textured Henley Shirt', 'textured-henley-shirt', 'A premium textured Henley shirt featuring a refined band collar. Offers a polished yet breathable feel for casual luxury.', '550e8400-e29b-41d4-a716-446655440001', 84.99, 69.99, '["Men/4.avif", "Men/4.1.avif", "Men/4.2.webp", "Men/4.3.avif"]', false, false, 'active'),
  
  ('750e8400-e29b-41d4-a716-446655440005', 'Ribbed Button-Down', 'ribbed-button-down', 'A chic ribbed button-down shirt with impeccable tailoring. Its subtle texture and clean lines elevate any smart-casual ensemble.', '550e8400-e29b-41d4-a716-446655440001', 119.99, 99.99, '["Men/5.webp", "Men/5.1.webp", "Men/5.2.webp"]', true, true, 'active'),
  
  ('750e8400-e29b-41d4-a716-446655440006', 'Minimalist Band Shirt', 'minimalist-band-shirt', 'Our minimalist band collar shirt is a timeless piece. Clean, crisp white fabric provides a sharp and contemporary look.', '550e8400-e29b-41d4-a716-446655440001', 74.99, null, '["Men/6.webp", "Men/6.1.webp", "Men/6.2.webp", "Men/6.3.webp"]', false, true, 'active'),
  
  ('750e8400-e29b-41d4-a716-446655440007', 'Crinkled Linen Shirt', 'crinkled-linen-shirt', 'Effortlessly stylish crinkled linen shirt. Its unique texture and soft feel are ideal for warm weather and beachside elegance.', '550e8400-e29b-41d4-a716-446655440001', 64.99, 54.99, '["Men/7.webp", "Men/7.1.webp", "Men/7.2.webp"]', true, false, 'active'),
  
  ('750e8400-e29b-41d4-a716-446655440008', 'Luxe Muslin Shirt', 'luxe-muslin-shirt', 'The ultimate luxe muslin shirt. Crafted from soft, breathable muslin gauze for a relaxed fit and all-day comfort.', '550e8400-e29b-41d4-a716-446655440001', 139.99, 119.99, '["Men/8.webp", "Men/8.1.webp", "Men/8.2.webp"]', true, true, 'active'),
  
  ('750e8400-e29b-41d4-a716-446655440009', 'Chic Striped Shirt', 'chic-striped-shirt', 'A chic striped shirt with a contemporary relaxed fit. An easy piece to layer or wear open for a modern, sophisticated style.', '550e8400-e29b-41d4-a716-446655440001', 94.99, null, '["Men/9.webp", "Men/9.1.webp"]', false, false, 'active'),
  
  ('750e8400-e29b-41d4-a716-446655440010', 'Jacquard Pattern Shirt', 'jacquard-pattern-shirt', 'An elevated jacquard pattern shirt. Its subtle, intricate woven detail adds depth and unique luxury to your wardrobe.', '550e8400-e29b-41d4-a716-446655440001', 109.99, 89.99, '["Men/10.webp", "Men/10.1.webp", "Men/10.2.webp", "Men/10.3.webp"]', true, true, 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert Product Variants for Men's Products
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_adjustment) VALUES
  -- Variants for Designer Track Jacket
  ('750e8400-e29b-41d4-a716-446655440001', 'S', 'Blue', 'DTJ-S-BLUE', 20, 0),
  ('750e8400-e29b-41d4-a716-446655440001', 'M', 'Blue', 'DTJ-M-BLUE', 30, 0),
  ('750e8400-e29b-41d4-a716-446655440001', 'L', 'Blue', 'DTJ-L-BLUE', 25, 0),
  ('750e8400-e29b-41d4-a716-446655440001', 'XL', 'Blue', 'DTJ-XL-BLUE', 15, 0),
  
  -- Variants for Relaxed Linen Shirt
  ('750e8400-e29b-41d4-a716-446655440002', 'S', 'Beige', 'RLS-S-BEIGE', 25, 0),
  ('750e8400-e29b-41d4-a716-446655440002', 'M', 'Beige', 'RLS-M-BEIGE', 35, 0),
  ('750e8400-e29b-41d4-a716-446655440002', 'L', 'Beige', 'RLS-L-BEIGE', 30, 0),
  ('750e8400-e29b-41d4-a716-446655440002', 'XL', 'Beige', 'RLS-XL-BEIGE', 20, 0),
  
  -- Variants for Utility Overshirt
  ('750e8400-e29b-41d4-a716-446655440003', 'S', 'Khaki', 'UOS-S-KHAKI', 15, 0),
  ('750e8400-e29b-41d4-a716-446655440003', 'M', 'Khaki', 'UOS-M-KHAKI', 25, 0),
  ('750e8400-e29b-41d4-a716-446655440003', 'L', 'Khaki', 'UOS-L-KHAKI', 30, 0),
  ('750e8400-e29b-41d4-a716-446655440003', 'XL', 'Khaki', 'UOS-XL-KHAKI', 20, 0),
  
  -- Variants for Textured Henley Shirt
  ('750e8400-e29b-41d4-a716-446655440004', 'S', 'Gray', 'THS-S-GRAY', 20, 0),
  ('750e8400-e29b-41d4-a716-446655440004', 'M', 'Gray', 'THS-M-GRAY', 30, 0),
  ('750e8400-e29b-41d4-a716-446655440004', 'L', 'Gray', 'THS-L-GRAY', 25, 0),
  ('750e8400-e29b-41d4-a716-446655440004', 'XL', 'Gray', 'THS-XL-GRAY', 15, 0),
  
  -- Variants for Ribbed Button-Down
  ('750e8400-e29b-41d4-a716-446655440005', 'S', 'White', 'RBD-S-WHITE', 15, 0),
  ('750e8400-e29b-41d4-a716-446655440005', 'M', 'White', 'RBD-M-WHITE', 25, 0),
  ('750e8400-e29b-41d4-a716-446655440005', 'L', 'White', 'RBD-L-WHITE', 30, 0),
  ('750e8400-e29b-41d4-a716-446655440005', 'XL', 'White', 'RBD-XL-WHITE', 20, 0),
  
  -- Variants for Minimalist Band Shirt
  ('750e8400-e29b-41d4-a716-446655440006', 'S', 'White', 'MBS-S-WHITE', 25, 0),
  ('750e8400-e29b-41d4-a716-446655440006', 'M', 'White', 'MBS-M-WHITE', 35, 0),
  ('750e8400-e29b-41d4-a716-446655440006', 'L', 'White', 'MBS-L-WHITE', 30, 0),
  ('750e8400-e29b-41d4-a716-446655440006', 'XL', 'White', 'MBS-XL-WHITE', 20, 0),
  
  -- Variants for Crinkled Linen Shirt
  ('750e8400-e29b-41d4-a716-446655440007', 'S', 'Beige', 'CLS-S-BEIGE', 20, 0),
  ('750e8400-e29b-41d4-a716-446655440007', 'M', 'Beige', 'CLS-M-BEIGE', 30, 0),
  ('750e8400-e29b-41d4-a716-446655440007', 'L', 'Beige', 'CLS-L-BEIGE', 25, 0),
  ('750e8400-e29b-41d4-a716-446655440007', 'XL', 'Beige', 'CLS-XL-BEIGE', 15, 0),
  
  -- Variants for Luxe Muslin Shirt
  ('750e8400-e29b-41d4-a716-446655440008', 'S', 'Cream', 'LMS-S-CREAM', 15, 0),
  ('750e8400-e29b-41d4-a716-446655440008', 'M', 'Cream', 'LMS-M-CREAM', 25, 0),
  ('750e8400-e29b-41d4-a716-446655440008', 'L', 'Cream', 'LMS-L-CREAM', 30, 0),
  ('750e8400-e29b-41d4-a716-446655440008', 'XL', 'Cream', 'LMS-XL-CREAM', 20, 0),
  
  -- Variants for Chic Striped Shirt
  ('750e8400-e29b-41d4-a716-446655440009', 'S', 'Blue Stripe', 'CSS-S-BSTRIPE', 20, 0),
  ('750e8400-e29b-41d4-a716-446655440009', 'M', 'Blue Stripe', 'CSS-M-BSTRIPE', 30, 0),
  ('750e8400-e29b-41d4-a716-446655440009', 'L', 'Blue Stripe', 'CSS-L-BSTRIPE', 25, 0),
  ('750e8400-e29b-41d4-a716-446655440009', 'XL', 'Blue Stripe', 'CSS-XL-BSTRIPE', 15, 0),
  
  -- Variants for Jacquard Pattern Shirt
  ('750e8400-e29b-41d4-a716-446655440010', 'S', 'Navy Pattern', 'JPS-S-NAVYPAT', 15, 0),
  ('750e8400-e29b-41d4-a716-446655440010', 'M', 'Navy Pattern', 'JPS-M-NAVYPAT', 25, 0),
  ('750e8400-e29b-41d4-a716-446655440010', 'L', 'Navy Pattern', 'JPS-L-NAVYPAT', 30, 0),
  ('750e8400-e29b-41d4-a716-446655440010', 'XL', 'Navy Pattern', 'JPS-XL-NAVYPAT', 20, 0)
;