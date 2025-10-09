-- Query men's products
SELECT id, name, slug, description, base_price, sale_price, images, is_featured, is_new
FROM products 
WHERE category_id = '550e8400-e29b-41d4-a716-446655440001' 
ORDER BY id;

-- Count men's products
SELECT COUNT(*) AS men_product_count
FROM products 
WHERE category_id = '550e8400-e29b-41d4-a716-446655440001';

-- Count women's products
SELECT COUNT(*) AS women_product_count
FROM products 
WHERE category_id = '550e8400-e29b-41d4-a716-446655440002';