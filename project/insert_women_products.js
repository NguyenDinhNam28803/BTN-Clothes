import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Create a Supabase client
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabase = createClient(supabaseUrl, supabaseKey);

// Women's product data
const womenProducts = [
  {
    id: '650e8400-e29b-41d4-a716-446655440001',
    name: 'Elegant White Dress',
    slug: 'elegant-white-dress',
    description: 'Beautiful elegant white dress perfect for special occasions',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    base_price: 89.99,
    sale_price: 69.99,
    images: ['Women/1.webp', 'Women/1.1.webp', 'Women/1.2.webp', 'Women/1.3.webp'],
    is_featured: true,
    is_new: true,
    status: 'active'
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440002',
    name: 'Casual Denim Outfit',
    slug: 'casual-denim-outfit',
    description: 'Comfortable and stylish denim outfit for everyday wear',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    base_price: 69.99,
    sale_price: null,
    images: ['Women/2.webp', 'Women/2.1.webp', 'Women/2.2.webp'],
    is_featured: false,
    is_new: true,
    status: 'active'
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440003',
    name: 'Floral Summer Dress',
    slug: 'floral-summer-dress',
    description: 'Light and breezy floral dress for summer days',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    base_price: 59.99,
    sale_price: 49.99,
    images: ['Women/3.webp', 'Women/3.1.webp', 'Women/3.2.webp'],
    is_featured: true,
    is_new: false,
    status: 'active'
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440004',
    name: 'Classic Black Outfit',
    slug: 'classic-black-outfit',
    description: 'Timeless black outfit suitable for various occasions',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    base_price: 79.99,
    sale_price: 59.99,
    images: ['Women/4.webp', 'Women/4.1.webp', 'Women/4.2.webp', 'Women/4.3.webp'],
    is_featured: false,
    is_new: false,
    status: 'active'
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440005',
    name: 'Premium Fashion Set',
    slug: 'premium-fashion-set',
    description: 'High-quality fashion set for the modern woman',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    base_price: 129.99,
    sale_price: 99.99,
    images: ['Women/5.webp', 'Women/5.1.webp', 'Women/5.2.webp', 'Women/5.3.webp', 'Women/5.4.webp'],
    is_featured: true,
    is_new: true,
    status: 'active'
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440006',
    name: 'Casual Chic Outfit',
    slug: 'casual-chic-outfit',
    description: 'Effortlessly chic outfit for a casual yet sophisticated look',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    base_price: 84.99,
    sale_price: null,
    images: ['Women/6.webp', 'Women/6.1.webp', 'Women/6.2.webp', 'Women/6.3.webp'],
    is_featured: false,
    is_new: true,
    status: 'active'
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440007',
    name: 'Modern Stylish Dress',
    slug: 'modern-stylish-dress',
    description: 'Contemporary dress design with unique style elements',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    base_price: 94.99,
    sale_price: 74.99,
    images: ['Women/7.webp', 'Women/7.1.webp', 'Women/7.2.webp', 'Women/7.3.webp'],
    is_featured: true,
    is_new: false,
    status: 'active'
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440008',
    name: 'Luxury Collection Outfit',
    slug: 'luxury-collection-outfit',
    description: 'Premium outfit from our luxury collection',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    base_price: 149.99,
    sale_price: 119.99,
    images: ['Women/8.webp', 'Women/8.1.webp', 'Women/8.2.webp', 'Women/8.3.webp', 'Women/8.4.webp'],
    is_featured: true,
    is_new: true,
    status: 'active'
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440009',
    name: 'Designer Fashion Set',
    slug: 'designer-fashion-set',
    description: 'Exclusive designer fashion set with premium materials',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    base_price: 159.99,
    sale_price: null,
    images: ['Women/9.webp', 'Women/9.1.webp', 'Women/9.2.webp', 'Women/9.3.webp', 'Women/9.4.webp'],
    is_featured: false,
    is_new: false,
    status: 'active'
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440010',
    name: 'Trendy Season Outfit',
    slug: 'trendy-season-outfit',
    description: 'The latest trendy outfit for the current season',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    base_price: 109.99,
    sale_price: 89.99,
    images: ['Women/10.webp', 'Women/10.1.webp', 'Women/10.2.webp', 'Women/10.3.webp'],
    is_featured: true,
    is_new: true,
    status: 'active'
  }
];

// Product variants data
const productVariants = [
  // Variants for Product 1
  { product_id: '650e8400-e29b-41d4-a716-446655440001', size: 'XS', color: 'White', sku: 'EWD-XS-WHITE', stock_quantity: 15, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440001', size: 'S', color: 'White', sku: 'EWD-S-WHITE', stock_quantity: 25, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440001', size: 'M', color: 'White', sku: 'EWD-M-WHITE', stock_quantity: 30, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440001', size: 'L', color: 'White', sku: 'EWD-L-WHITE', stock_quantity: 20, price_adjustment: 0 },
  
  // Variants for Product 2
  { product_id: '650e8400-e29b-41d4-a716-446655440002', size: 'XS', color: 'Blue', sku: 'CDO-XS-BLUE', stock_quantity: 10, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440002', size: 'S', color: 'Blue', sku: 'CDO-S-BLUE', stock_quantity: 30, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440002', size: 'M', color: 'Blue', sku: 'CDO-M-BLUE', stock_quantity: 35, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440002', size: 'L', color: 'Blue', sku: 'CDO-L-BLUE', stock_quantity: 25, price_adjustment: 0 },
  
  // Variants for Product 3
  { product_id: '650e8400-e29b-41d4-a716-446655440003', size: 'XS', color: 'Floral', sku: 'FSD-XS-FLORAL', stock_quantity: 20, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440003', size: 'S', color: 'Floral', sku: 'FSD-S-FLORAL', stock_quantity: 25, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440003', size: 'M', color: 'Floral', sku: 'FSD-M-FLORAL', stock_quantity: 30, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440003', size: 'L', color: 'Floral', sku: 'FSD-L-FLORAL', stock_quantity: 15, price_adjustment: 0 },
  
  // Variants for Product 4
  { product_id: '650e8400-e29b-41d4-a716-446655440004', size: 'XS', color: 'Black', sku: 'CBO-XS-BLACK', stock_quantity: 25, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440004', size: 'S', color: 'Black', sku: 'CBO-S-BLACK', stock_quantity: 30, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440004', size: 'M', color: 'Black', sku: 'CBO-M-BLACK', stock_quantity: 35, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440004', size: 'L', color: 'Black', sku: 'CBO-L-BLACK', stock_quantity: 20, price_adjustment: 0 },
  
  // Variants for Product 5
  { product_id: '650e8400-e29b-41d4-a716-446655440005', size: 'XS', color: 'Beige', sku: 'PFS-XS-BEIGE', stock_quantity: 15, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440005', size: 'S', color: 'Beige', sku: 'PFS-S-BEIGE', stock_quantity: 25, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440005', size: 'M', color: 'Beige', sku: 'PFS-M-BEIGE', stock_quantity: 30, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440005', size: 'L', color: 'Beige', sku: 'PFS-L-BEIGE', stock_quantity: 20, price_adjustment: 0 },
  
  // Variants for Product 6
  { product_id: '650e8400-e29b-41d4-a716-446655440006', size: 'XS', color: 'Multi', sku: 'CCO-XS-MULTI', stock_quantity: 10, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440006', size: 'S', color: 'Multi', sku: 'CCO-S-MULTI', stock_quantity: 20, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440006', size: 'M', color: 'Multi', sku: 'CCO-M-MULTI', stock_quantity: 25, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440006', size: 'L', color: 'Multi', sku: 'CCO-L-MULTI', stock_quantity: 15, price_adjustment: 0 },
  
  // Variants for Product 7
  { product_id: '650e8400-e29b-41d4-a716-446655440007', size: 'XS', color: 'Brown', sku: 'MSD-XS-BROWN', stock_quantity: 20, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440007', size: 'S', color: 'Brown', sku: 'MSD-S-BROWN', stock_quantity: 25, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440007', size: 'M', color: 'Brown', sku: 'MSD-M-BROWN', stock_quantity: 35, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440007', size: 'L', color: 'Brown', sku: 'MSD-L-BROWN', stock_quantity: 15, price_adjustment: 0 },
  
  // Variants for Product 8
  { product_id: '650e8400-e29b-41d4-a716-446655440008', size: 'XS', color: 'Cream', sku: 'LCO-XS-CREAM', stock_quantity: 15, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440008', size: 'S', color: 'Cream', sku: 'LCO-S-CREAM', stock_quantity: 25, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440008', size: 'M', color: 'Cream', sku: 'LCO-M-CREAM', stock_quantity: 30, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440008', size: 'L', color: 'Cream', sku: 'LCO-L-CREAM', stock_quantity: 20, price_adjustment: 0 },
  
  // Variants for Product 9
  { product_id: '650e8400-e29b-41d4-a716-446655440009', size: 'XS', color: 'Gray', sku: 'DFS-XS-GRAY', stock_quantity: 10, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440009', size: 'S', color: 'Gray', sku: 'DFS-S-GRAY', stock_quantity: 20, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440009', size: 'M', color: 'Gray', sku: 'DFS-M-GRAY', stock_quantity: 25, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440009', size: 'L', color: 'Gray', sku: 'DFS-L-GRAY', stock_quantity: 15, price_adjustment: 0 },
  
  // Variants for Product 10
  { product_id: '650e8400-e29b-41d4-a716-446655440010', size: 'XS', color: 'Pink', sku: 'TSO-XS-PINK', stock_quantity: 15, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440010', size: 'S', color: 'Pink', sku: 'TSO-S-PINK', stock_quantity: 25, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440010', size: 'M', color: 'Pink', sku: 'TSO-M-PINK', stock_quantity: 30, price_adjustment: 0 },
  { product_id: '650e8400-e29b-41d4-a716-446655440010', size: 'L', color: 'Pink', sku: 'TSO-L-PINK', stock_quantity: 20, price_adjustment: 0 }
];

async function insertWomenProducts() {
  try {
    console.log('Deleting existing women products...');
    
    // Delete existing women products
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .in('id', womenProducts.map(p => p.id));
      
    if (deleteError) {
      console.error('Error deleting products:', deleteError);
      return;
    }
    
    console.log('Inserting women products...');
    
    // Insert women products
    for (const product of womenProducts) {
      const { error } = await supabase
        .from('products')
        .insert({
          ...product,
          images: JSON.stringify(product.images)
        });
        
      if (error) {
        console.error(`Error inserting product ${product.name}:`, error);
      }
    }
    
    console.log('Inserting product variants...');
    
    // Insert product variants in batches to avoid errors
    const batchSize = 10;
    for (let i = 0; i < productVariants.length; i += batchSize) {
      const batch = productVariants.slice(i, i + batchSize);
      const { error } = await supabase
        .from('product_variants')
        .insert(batch);
        
      if (error) {
        console.error(`Error inserting variants batch ${i}:`, error);
      }
    }
    
    console.log('Done!');
    
    // Verify insertion
    const { data: productsCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .in('id', womenProducts.map(p => p.id));
      
    console.log(`Verified ${productsCount ? productsCount.length : 'unknown'} women products inserted`);
    
    const { data: variantsCount, error: variantCountError } = await supabase
      .from('product_variants')
      .select('*', { count: 'exact', head: true })
      .in('product_id', womenProducts.map(p => p.id));
      
    console.log(`Verified ${variantsCount ? variantsCount.length : 'unknown'} product variants inserted`);
  } catch (error) {
    console.error('Error in insertion process:', error);
  }
}

// Execute the insertion
insertWomenProducts();