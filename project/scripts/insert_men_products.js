// insert_men_products.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function insertMenProducts() {
  console.log('Deleting existing men products if any...');
  await supabase
    .from('product_variants')
    .delete()
    .like('product_id', '750e8400-e29b-41d4-a716-44665544%');
  
  await supabase
    .from('products')
    .delete()
    .like('id', '750e8400-e29b-41d4-a716-44665544%');

  console.log('Inserting men products...');

  // Product 1: Designer Track Jacket
  const { data: product1, error: error1 } = await supabase
    .from('products')
    .insert([{
      id: '750e8400-e29b-41d4-a716-446655440001',
      name: 'Designer Track Jacket',
      slug: 'designer-track-jacket',
      description: 'An iconic designer track jacket with a striking logo graphic. Perfect for an elevated street look and athletic flair.',
      category_id: '550e8400-e29b-41d4-a716-446655440001',
      base_price: 99.99,
      sale_price: 79.99,
      images: ['Men/1.webp', 'Men/1.2.webp', 'Men/1.3.webp', 'Men/1.4.webp'],
      is_featured: true,
      is_new: true,
      status: 'active'
    }])
    .select();

  if (error1) console.error('Error inserting product 1:', error1);
  else console.log('Inserted product 1:', product1[0]?.name);

  // Product 2: Relaxed Linen Shirt
  const { data: product2, error: error2 } = await supabase
    .from('products')
    .insert([{
      id: '750e8400-e29b-41d4-a716-446655440002',
      name: 'Relaxed Linen Shirt',
      slug: 'relaxed-linen-shirt',
      description: 'The quintessential relaxed linen shirt. Lightweight, breathable, and designed for superior comfort during your weekend escapes.',
      category_id: '550e8400-e29b-41d4-a716-446655440001',
      base_price: 69.99,
      sale_price: null,
      images: ['Men/2.webp', 'Men/2.1.webp', 'Men/2.3.webp'],
      is_featured: false,
      is_new: true,
      status: 'active'
    }])
    .select();

  if (error2) console.error('Error inserting product 2:', error2);
  else console.log('Inserted product 2:', product2[0]?.name);

  // Insert the remaining 8 products...
  // Product 3: Utility Overshirt
  const { data: product3, error: error3 } = await supabase
    .from('products')
    .insert([{
      id: '750e8400-e29b-41d4-a716-446655440003',
      name: 'Utility Overshirt',
      slug: 'utility-overshirt',
      description: 'A rugged yet refined utility overshirt (shacket). Features a durable fabric blend and an oversized fit for versatile layering.',
      category_id: '550e8400-e29b-41d4-a716-446655440001',
      base_price: 89.99,
      sale_price: 79.99,
      images: ['Men/3.avif', 'Men/3.1.avif', 'Men/3.3.webp', 'Men/3.4.webp'],
      is_featured: true,
      is_new: false,
      status: 'active'
    }])
    .select();

  if (error3) console.error('Error inserting product 3:', error3);
  else console.log('Inserted product 3:', product3[0]?.name);

  // Add more products here...
  // Product 4: Textured Henley Shirt
  const { data: product4, error: error4 } = await supabase
    .from('products')
    .insert([{
      id: '750e8400-e29b-41d4-a716-446655440004',
      name: 'Textured Henley Shirt',
      slug: 'textured-henley-shirt',
      description: 'A premium textured Henley shirt featuring a refined band collar. Offers a polished yet breathable feel for casual luxury.',
      category_id: '550e8400-e29b-41d4-a716-446655440001',
      base_price: 84.99,
      sale_price: 69.99,
      images: ['Men/4.avif', 'Men/4.1.avif', 'Men/4.2.webp', 'Men/4.3.avif'],
      is_featured: false,
      is_new: false,
      status: 'active'
    }])
    .select();

  if (error4) console.error('Error inserting product 4:', error4);
  else console.log('Inserted product 4:', product4[0]?.name);

  // Continue with products 5-10...

  // Insert product variants
  console.log('Inserting product variants...');

  // Variants for product 1
  const { error: variantError1 } = await supabase
    .from('product_variants')
    .insert([
      {
        product_id: '750e8400-e29b-41d4-a716-446655440001',
        size: 'S',
        color: 'Blue',
        sku: 'DTJ-S-BLUE',
        stock_quantity: 20,
        price_adjustment: 0
      },
      {
        product_id: '750e8400-e29b-41d4-a716-446655440001',
        size: 'M',
        color: 'Blue',
        sku: 'DTJ-M-BLUE',
        stock_quantity: 30,
        price_adjustment: 0
      },
      {
        product_id: '750e8400-e29b-41d4-a716-446655440001',
        size: 'L',
        color: 'Blue',
        sku: 'DTJ-L-BLUE',
        stock_quantity: 25,
        price_adjustment: 0
      },
      {
        product_id: '750e8400-e29b-41d4-a716-446655440001',
        size: 'XL',
        color: 'Blue',
        sku: 'DTJ-XL-BLUE',
        stock_quantity: 15,
        price_adjustment: 0
      }
    ]);

  if (variantError1) console.error('Error inserting variants for product 1:', variantError1);
  else console.log('Inserted variants for product 1');

  // Variants for product 2
  const { error: variantError2 } = await supabase
    .from('product_variants')
    .insert([
      {
        product_id: '750e8400-e29b-41d4-a716-446655440002',
        size: 'S',
        color: 'Beige',
        sku: 'RLS-S-BEIGE',
        stock_quantity: 25,
        price_adjustment: 0
      },
      {
        product_id: '750e8400-e29b-41d4-a716-446655440002',
        size: 'M',
        color: 'Beige',
        sku: 'RLS-M-BEIGE',
        stock_quantity: 35,
        price_adjustment: 0
      },
      {
        product_id: '750e8400-e29b-41d4-a716-446655440002',
        size: 'L',
        color: 'Beige',
        sku: 'RLS-L-BEIGE',
        stock_quantity: 30,
        price_adjustment: 0
      },
      {
        product_id: '750e8400-e29b-41d4-a716-446655440002',
        size: 'XL',
        color: 'Beige',
        sku: 'RLS-XL-BEIGE',
        stock_quantity: 20,
        price_adjustment: 0
      }
    ]);

  if (variantError2) console.error('Error inserting variants for product 2:', variantError2);
  else console.log('Inserted variants for product 2');

  // Add variants for products 3-4 here
  // Variants for product 3 (Utility Overshirt)
  const { error: variantError3 } = await supabase
    .from('product_variants')
    .insert([
      {
        product_id: '750e8400-e29b-41d4-a716-446655440003',
        size: 'S',
        color: 'Khaki',
        sku: 'UOS-S-KHAKI',
        stock_quantity: 15,
        price_adjustment: 0
      },
      {
        product_id: '750e8400-e29b-41d4-a716-446655440003',
        size: 'M',
        color: 'Khaki',
        sku: 'UOS-M-KHAKI',
        stock_quantity: 25,
        price_adjustment: 0
      },
      {
        product_id: '750e8400-e29b-41d4-a716-446655440003',
        size: 'L',
        color: 'Khaki',
        sku: 'UOS-L-KHAKI',
        stock_quantity: 30,
        price_adjustment: 0
      },
      {
        product_id: '750e8400-e29b-41d4-a716-446655440003',
        size: 'XL',
        color: 'Khaki',
        sku: 'UOS-XL-KHAKI',
        stock_quantity: 20,
        price_adjustment: 0
      }
    ]);

  if (variantError3) console.error('Error inserting variants for product 3:', variantError3);
  else console.log('Inserted variants for product 3');

  // Variants for product 4 (Textured Henley Shirt)
  const { error: variantError4 } = await supabase
    .from('product_variants')
    .insert([
      {
        product_id: '750e8400-e29b-41d4-a716-446655440004',
        size: 'S',
        color: 'Gray',
        sku: 'THS-S-GRAY',
        stock_quantity: 20,
        price_adjustment: 0
      },
      {
        product_id: '750e8400-e29b-41d4-a716-446655440004',
        size: 'M',
        color: 'Gray',
        sku: 'THS-M-GRAY',
        stock_quantity: 30,
        price_adjustment: 0
      },
      {
        product_id: '750e8400-e29b-41d4-a716-446655440004',
        size: 'L',
        color: 'Gray',
        sku: 'THS-L-GRAY',
        stock_quantity: 25,
        price_adjustment: 0
      },
      {
        product_id: '750e8400-e29b-41d4-a716-446655440004',
        size: 'XL',
        color: 'Gray',
        sku: 'THS-XL-GRAY',
        stock_quantity: 15,
        price_adjustment: 0
      }
    ]);

  if (variantError4) console.error('Error inserting variants for product 4:', variantError4);
  else console.log('Inserted variants for product 4');

  // Continue with variants for products 5-10...

  console.log('Finished inserting men products');
}

insertMenProducts().catch(console.error);