INSERT INTO products (id, name, slug, description, category_id, base_price, sale_price, images, is_featured, is_new, status) 
VALUES (
  '650e8400-e29b-41d4-a716-446655440001', 
  'Elegant White Dress', 
  'elegant-white-dress', 
  'Beautiful elegant white dress perfect for special occasions', 
  '550e8400-e29b-41d4-a716-446655440002', 
  89.99, 
  69.99, 
  '["Women/1.webp", "Women/1.1.webp", "Women/1.2.webp", "Women/1.3.webp"]', 
  true, 
  true, 
  'active'
);

SELECT id, name, slug FROM products WHERE id = '650e8400-e29b-41d4-a716-446655440001';