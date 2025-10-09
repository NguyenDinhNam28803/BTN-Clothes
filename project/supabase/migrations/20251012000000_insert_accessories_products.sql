/*
  # Accessories Products Data for BTN Clothes Store

  ## Purpose
  Insert accessories products based on the available images

  ## Data Inserted`
  - Accessories category products
  - Product variants for accessories
*/

-- Insert Accessories Products with proper image paths
INSERT INTO products (id, name, slug, description, category_id, base_price, sale_price, images, is_featured, is_new, status) VALUES
  ('950e8400-e29b-41d4-a716-446655440001', 'Tortoiseshell Oval Frames', 'tortoiseshell-oval-frames', 'Chic tortoiseshell frames in a flattering narrow oval shape. Perfect for a subtle retro-inspired look.', '550e8400-e29b-41d4-a716-446655440004', 89.99, 79.99, '["Accessories/1.webp", "Accessories/1.1.webp", "Accessories/1.2.webp"]', true, true, 'active'),
  
  ('950e8400-e29b-41d4-a716-446655440002', 'Rimless Oval Eyeglasses', 'rimless-oval-eyeglasses', 'Ultra-minimalist rimless oval design. Offers a sophisticated, barely-there look.', '550e8400-e29b-41d4-a716-446655440004', 129.99, null, '["Accessories/2.webp", "Accessories/2.1.webp", "Accessories/2.2.webp"]', false, true, 'active'),
  
  ('950e8400-e29b-41d4-a716-446655440003', 'Silver Jeweled Round', 'silver-jeweled-round', 'Dazzling silver round frames accented with sparkling jewel details on the temples. For a unique, glamorous look.', '550e8400-e29b-41d4-a716-446655440004', 109.99, 99.99, '["Accessories/3.webp", "Accessories/3.1.webp"]', true, false, 'active'),
  
  ('950e8400-e29b-41d4-a716-446655440004', 'Narrow Square Metal', 'narrow-square-metal', 'On-trend narrow square metal glasses. A perfect blend of retro style and modern sensibility.', '550e8400-e29b-41d4-a716-446655440004', 99.99, 79.99, '["Accessories/4.webp", "Accessories/4.1.webp"]', false, false, 'active'),
  
  ('950e8400-e29b-41d4-a716-446655440005', 'Classic Silver Rectangle', 'classic-silver-rectangle', 'Sleek and timeless silver rectangle glasses. A clean, professional look for everyday wear.', '550e8400-e29b-41d4-a716-446655440004', 79.99, 69.99, '["Accessories/5.webp", "Accessories/5.1.webp"]', true, true, 'active'),
  
  ('950e8400-e29b-41d4-a716-446655440006', 'Silver Jeweled Oval', 'silver-jeweled-oval', 'Elegant silver oval frames featuring intricate jewel detailing. Adds a touch of vintage luxury.', '550e8400-e29b-41d4-a716-446655440004', 119.99, null, '["Accessories/6.webp", "Accessories/6.1.webp"]', false, true, 'active'),
  
  ('950e8400-e29b-41d4-a716-446655440007', 'Gold Oversized Geometric', 'gold-oversized-geometric', 'Trendy gold geometric frames with a bold, oversized fit. Instantly elevates your fashion game.', '550e8400-e29b-41d4-a716-446655440004', 104.99, 89.99, '["Accessories/7.webp", "Accessories/7.1.webp"]', true, false, 'active'),
  
  ('950e8400-e29b-41d4-a716-446655440008', 'Gold Semi-Rimless Round', 'gold-semi-rimless-round', 'Minimalist gold half-rim (browline) glasses. A lightweight and versatile choice for modern style.', '550e8400-e29b-41d4-a716-446655440004', 94.99, 84.99, '["Accessories/8.webp", "Accessories/8.1.webp"]', true, true, 'active'),
  
  ('950e8400-e29b-41d4-a716-446655440009', 'Oversized Pilot Frames', 'oversized-pilot-frames', 'Statement oversized pilot/aviator frames. Combines metal and clear acetate for a high-fashion, bold aesthetic.', '550e8400-e29b-41d4-a716-446655440004', 124.99, null, '["Accessories/9.webp", "Accessories/9.1.webp"]', false, false, 'active'),
  
  ('950e8400-e29b-41d4-a716-446655440010', 'Thin Metal Round', 'thin-metal-round', 'Lightweight thin metal round frames with a delicate profile. Subtle elegance for everyday sophistication.', '550e8400-e29b-41d4-a716-446655440004', 84.99, 74.99, '["Accessories/10.webp", "Accessories/10.1.webp", "Accessories/10.2.webp"]', true, true, 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert Product Variants for Accessories Products
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_adjustment) VALUES
  -- Variants for Tortoiseshell Oval Frames
  ('950e8400-e29b-41d4-a716-446655440001', 'Standard', 'Tortoiseshell', 'TOF-STD-TORTOISE', 20, 0),
  ('950e8400-e29b-41d4-a716-446655440001', 'Large', 'Tortoiseshell', 'TOF-LRG-TORTOISE', 15, 10),
  
  -- Variants for Rimless Oval Eyeglasses
  ('950e8400-e29b-41d4-a716-446655440002', 'Standard', 'Clear', 'ROE-STD-CLEAR', 25, 0),
  ('950e8400-e29b-41d4-a716-446655440002', 'Large', 'Clear', 'ROE-LRG-CLEAR', 20, 10),
  
  -- Variants for Silver Jeweled Round
  ('950e8400-e29b-41d4-a716-446655440003', 'Standard', 'Silver', 'SJR-STD-SILVER', 15, 0),
  ('950e8400-e29b-41d4-a716-446655440003', 'Large', 'Silver', 'SJR-LRG-SILVER', 10, 10),
  
  -- Variants for Narrow Square Metal
  ('950e8400-e29b-41d4-a716-446655440004', 'Standard', 'Black', 'NSM-STD-BLACK', 20, 0),
  ('950e8400-e29b-41d4-a716-446655440004', 'Large', 'Black', 'NSM-LRG-BLACK', 15, 10),
  
  -- Variants for Classic Silver Rectangle
  ('950e8400-e29b-41d4-a716-446655440005', 'Standard', 'Silver', 'CSR-STD-SILVER', 25, 0),
  ('950e8400-e29b-41d4-a716-446655440005', 'Large', 'Silver', 'CSR-LRG-SILVER', 20, 10),
  
  -- Variants for Silver Jeweled Oval
  ('950e8400-e29b-41d4-a716-446655440006', 'Standard', 'Silver', 'SJO-STD-SILVER', 15, 0),
  ('950e8400-e29b-41d4-a716-446655440006', 'Large', 'Silver', 'SJO-LRG-SILVER', 10, 10),
  
  -- Variants for Gold Oversized Geometric
  ('950e8400-e29b-41d4-a716-446655440007', 'Standard', 'Gold', 'GOG-STD-GOLD', 20, 0),
  ('950e8400-e29b-41d4-a716-446655440007', 'Large', 'Gold', 'GOG-LRG-GOLD', 15, 10),
  
  -- Variants for Gold Semi-Rimless Round
  ('950e8400-e29b-41d4-a716-446655440008', 'Standard', 'Gold', 'GSRR-STD-GOLD', 25, 0),
  ('950e8400-e29b-41d4-a716-446655440008', 'Large', 'Gold', 'GSRR-LRG-GOLD', 20, 10),
  
  -- Variants for Oversized Pilot Frames
  ('950e8400-e29b-41d4-a716-446655440009', 'Standard', 'Gold/Clear', 'OPF-STD-GOLDCLEAR', 15, 0),
  ('950e8400-e29b-41d4-a716-446655440009', 'Large', 'Gold/Clear', 'OPF-LRG-GOLDCLEAR', 10, 10),
  
  -- Variants for Thin Metal Round
  ('950e8400-e29b-41d4-a716-446655440010', 'Standard', 'Silver', 'TMR-STD-SILVER', 20, 0),
  ('950e8400-e29b-41d4-a716-446655440010', 'Large', 'Silver', 'TMR-LRG-SILVER', 15, 10)
;