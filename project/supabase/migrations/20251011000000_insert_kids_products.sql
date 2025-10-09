/*
  # Kids Products Data for BTN Clothes Store

  ## Purpose
  Insert kids clothing products based on the available images

  ## Data Inserted
  - Kids category products
  - Product variants for kids clothing
*/

-- Insert Kids Products with proper image paths
INSERT INTO products (id, name, slug, description, category_id, base_price, sale_price, images, is_featured, is_new, status) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', 'Floral Strappy Sundress', 'floral-strappy-sundress', 'A charming Floral Strappy Sundress. Features a delicate print and flowing skirt, perfect for a sweet and feminine summer style.', '550e8400-e29b-41d4-a716-446655440003', 59.99, 49.99, '["Kids/1.webp", "Kids/1.1.webp", "Kids/1.2.webp"]', true, true, 'active'),
  
  ('850e8400-e29b-41d4-a716-446655440002', 'Striped Long Sleeve Top', 'striped-long-sleeve-top', 'Classic Striped Long Sleeve Top with a soft feel. An easy layering piece for a cozy back-to-school look.', '550e8400-e29b-41d4-a716-446655440003', 49.99, null, '["Kids/2.webp", "Kids/2.1.webp", "Kids/2.2.webp"]', false, true, 'active'),
  
  ('850e8400-e29b-41d4-a716-446655440003', 'Plaid Flannel Overshirt', 'plaid-flannel-overshirt', 'A comfy Plaid Flannel Overshirt. Its relaxed fit makes it ideal for layering and achieving a cozy, grunge-inspired style.', '550e8400-e29b-41d4-a716-446655440003', 54.99, 44.99, '["Kids/3.webp", "Kids/3.1.webp", "Kids/3.2.webp", "Kids/3.3.webp"]', true, false, 'active'),
  
  ('850e8400-e29b-41d4-a716-446655440004', 'Textured Knit Shirt', 'textured-knit-shirt', 'The versatile Textured Knit Shirt works as a perfect lightweight jacket. Its unique texture adds a fashionable layer to any outfit.', '550e8400-e29b-41d4-a716-446655440003', 39.99, 34.99, '["Kids/4.webp", "Kids/4.1.webp", "Kids/4.2.webp", "Kids/4.3.webp"]', false, false, 'active'),
  
  ('850e8400-e29b-41d4-a716-446655440005', 'Black Boxy Shirt', 'black-boxy-shirt', 'The essential Black Boxy Shirt. Clean, minimalist, and easy to pair with any bottoms for an urban, structured look.', '550e8400-e29b-41d4-a716-446655440003', 69.99, 59.99, '["Kids/5.webp", "Kids/5.1.webp", "Kids/5.2.webp"]', true, true, 'active'),
  
  ('850e8400-e29b-41d4-a716-446655440006', 'Crinkle Texture Shirt', 'crinkle-texture-shirt', 'Unique Crinkle Texture Shirt in a breathable fabric. Provides a cool, relaxed fit for warm-weather adventures.', '550e8400-e29b-41d4-a716-446655440003', 64.99, null, '["Kids/6.webp", "Kids/6.1.webp", "Kids/6.2.webp"]', false, true, 'active'),
  
  ('850e8400-e29b-41d4-a716-446655440007', 'Plaid Short Sleeve Shirt', 'plaid-short-sleeve-shirt', 'Lightweight Plaid Short Sleeve Shirt. Great for layering over a simple tee or wearing buttoned up for a fresh, casual look.', '550e8400-e29b-41d4-a716-446655440003', 44.99, 39.99, '["Kids/7.webp", "Kids/7.1.webp", "Kids/7.2.webp"]', true, false, 'active'),
  
  ('850e8400-e29b-41d4-a716-446655440008', 'Cut-Out Halter Maxi', 'cut-out-halter-maxi', 'A trendy Cut-Out Halter Maxi dress. Sophisticated yet playful, ideal for special summer events or vacations.', '550e8400-e29b-41d4-a716-446655440003', 34.99, 29.99, '["Kids/8.webp", "Kids/8.1.webp", "Kids/8.2.webp"]', true, true, 'active'),
  
  ('850e8400-e29b-41d4-a716-446655440009', 'Pastel Stripe Tee', 'pastel-stripe-tee', 'A comfortable and cool Pastel Stripe Tee. Its vibrant colors and relaxed fit are perfect for casual, everyday wear.', '550e8400-e29b-41d4-a716-446655440003', 39.99, null, '["Kids/9.webp", "Kids/9.1.webp", "Kids/9.2.webp"]', false, false, 'active'),
  
  ('850e8400-e29b-41d4-a716-446655440010', 'Vintage Ringer Tee', 'vintage-ringer-tee', 'A retro-inspired Vintage Ringer Tee with contrast trim. A must-have for a cool, throwback street style.', '550e8400-e29b-41d4-a716-446655440003', 29.99, 24.99, '["Kids/10.webp", "Kids/10.1.webp", "Kids/10.2.webp"]', true, true, 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert Product Variants for Kids Products
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_adjustment) VALUES
  -- Variants for Floral Strappy Sundress
  ('850e8400-e29b-41d4-a716-446655440001', '3T', 'Floral', 'FSD-3T-FLORAL', 15, 0),
  ('850e8400-e29b-41d4-a716-446655440001', '4T', 'Floral', 'FSD-4T-FLORAL', 20, 0),
  ('850e8400-e29b-41d4-a716-446655440001', '5T', 'Floral', 'FSD-5T-FLORAL', 15, 0),
  ('850e8400-e29b-41d4-a716-446655440001', '6', 'Floral', 'FSD-6-FLORAL', 10, 0),
  
  -- Variants for Striped Long Sleeve Top
  ('850e8400-e29b-41d4-a716-446655440002', '3T', 'Striped', 'SLST-3T-STRIPE', 15, 0),
  ('850e8400-e29b-41d4-a716-446655440002', '4T', 'Striped', 'SLST-4T-STRIPE', 25, 0),
  ('850e8400-e29b-41d4-a716-446655440002', '5T', 'Striped', 'SLST-5T-STRIPE', 20, 0),
  ('850e8400-e29b-41d4-a716-446655440002', '6', 'Striped', 'SLST-6-STRIPE', 15, 0),
  
  -- Variants for Plaid Flannel Overshirt
  ('850e8400-e29b-41d4-a716-446655440003', '3T', 'Plaid', 'PFO-3T-PLAID', 10, 0),
  ('850e8400-e29b-41d4-a716-446655440003', '4T', 'Plaid', 'PFO-4T-PLAID', 15, 0),
  ('850e8400-e29b-41d4-a716-446655440003', '5T', 'Plaid', 'PFO-5T-PLAID', 20, 0),
  ('850e8400-e29b-41d4-a716-446655440003', '6', 'Plaid', 'PFO-6-PLAID', 15, 0),
  
  -- Variants for Textured Knit Shirt
  ('850e8400-e29b-41d4-a716-446655440004', '3T', 'Gray', 'TKS-3T-GRAY', 15, 0),
  ('850e8400-e29b-41d4-a716-446655440004', '4T', 'Gray', 'TKS-4T-GRAY', 25, 0),
  ('850e8400-e29b-41d4-a716-446655440004', '5T', 'Gray', 'TKS-5T-GRAY', 20, 0),
  ('850e8400-e29b-41d4-a716-446655440004', '6', 'Gray', 'TKS-6-GRAY', 15, 0),
  
  -- Variants for Black Boxy Shirt
  ('850e8400-e29b-41d4-a716-446655440005', '3T', 'Black', 'BBS-3T-BLACK', 10, 0),
  ('850e8400-e29b-41d4-a716-446655440005', '4T', 'Black', 'BBS-4T-BLACK', 15, 0),
  ('850e8400-e29b-41d4-a716-446655440005', '5T', 'Black', 'BBS-5T-BLACK', 20, 0),
  ('850e8400-e29b-41d4-a716-446655440005', '6', 'Black', 'BBS-6-BLACK', 15, 0),
  
  -- Variants for Crinkle Texture Shirt
  ('850e8400-e29b-41d4-a716-446655440006', '3T', 'Beige', 'CTS-3T-BEIGE', 15, 0),
  ('850e8400-e29b-41d4-a716-446655440006', '4T', 'Beige', 'CTS-4T-BEIGE', 25, 0),
  ('850e8400-e29b-41d4-a716-446655440006', '5T', 'Beige', 'CTS-5T-BEIGE', 20, 0),
  ('850e8400-e29b-41d4-a716-446655440006', '6', 'Beige', 'CTS-6-BEIGE', 15, 0),
  
  -- Variants for Plaid Short Sleeve Shirt
  ('850e8400-e29b-41d4-a716-446655440007', '3T', 'Plaid', 'PSSS-3T-PLAID', 15, 0),
  ('850e8400-e29b-41d4-a716-446655440007', '4T', 'Plaid', 'PSSS-4T-PLAID', 20, 0),
  ('850e8400-e29b-41d4-a716-446655440007', '5T', 'Plaid', 'PSSS-5T-PLAID', 15, 0),
  ('850e8400-e29b-41d4-a716-446655440007', '6', 'Plaid', 'PSSS-6-PLAID', 10, 0),
  
  -- Variants for Cut-Out Halter Maxi
  ('850e8400-e29b-41d4-a716-446655440008', '3T', 'Brown', 'COHM-3T-BROWN', 10, 0),
  ('850e8400-e29b-41d4-a716-446655440008', '4T', 'Brown', 'COHM-4T-BROWN', 15, 0),
  ('850e8400-e29b-41d4-a716-446655440008', '5T', 'Brown', 'COHM-5T-BROWN', 20, 0),
  ('850e8400-e29b-41d4-a716-446655440008', '6', 'Brown', 'COHM-6-BROWN', 15, 0),
  
  -- Variants for Pastel Stripe Tee
  ('850e8400-e29b-41d4-a716-446655440009', '3T', 'Pastel', 'PST-3T-PASTEL', 15, 0),
  ('850e8400-e29b-41d4-a716-446655440009', '4T', 'Pastel', 'PST-4T-PASTEL', 25, 0),
  ('850e8400-e29b-41d4-a716-446655440009', '5T', 'Pastel', 'PST-5T-PASTEL', 20, 0),
  ('850e8400-e29b-41d4-a716-446655440009', '6', 'Pastel', 'PST-6-PASTEL', 15, 0),
  
  -- Variants for Vintage Ringer Tee
  ('850e8400-e29b-41d4-a716-446655440010', '3T', 'White', 'VRT-3T-WHITE', 10, 0),
  ('850e8400-e29b-41d4-a716-446655440010', '4T', 'White', 'VRT-4T-WHITE', 15, 0),
  ('850e8400-e29b-41d4-a716-446655440010', '5T', 'White', 'VRT-5T-WHITE', 20, 0),
  ('850e8400-e29b-41d4-a716-446655440010', '6', 'White', 'VRT-6-WHITE', 15, 0)
;