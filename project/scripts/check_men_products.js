// check_men_products.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkMenProducts() {
  console.log('Fetching men products...');
  const { data: menProducts, error: menError } = await supabase
    .from('products')
    .select('id, name, slug, description, base_price, sale_price')
    .eq('category_id', '550e8400-e29b-41d4-a716-446655440001')
    .order('id');
  
  if (menError) {
    console.error('Error fetching men products:', menError);
  } else {
    console.log(`Found ${menProducts.length} men's products:`);
    menProducts.forEach((product, i) => {
      console.log(`${i+1}. ${product.name} - $${product.base_price}${product.sale_price ? ' (Sale: $' + product.sale_price + ')' : ''}`);
    });
  }

  console.log('\nFetching men product variants...');
  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select('product_id, size, color, sku, stock_quantity')
    .in('product_id', menProducts?.map(p => p.id) || [])
    .order('product_id, size');
  
  if (variantsError) {
    console.error('Error fetching variants:', variantsError);
  } else {
    console.log(`Found ${variants.length} variants`);
    
    // Group variants by product_id
    const variantsByProduct = {};
    variants.forEach(v => {
      if (!variantsByProduct[v.product_id]) {
        variantsByProduct[v.product_id] = [];
      }
      variantsByProduct[v.product_id].push(v);
    });
    
    // Display variants for each product
    menProducts.forEach(product => {
      const productVariants = variantsByProduct[product.id] || [];
      console.log(`\n${product.name} variants (${productVariants.length}):`);
      productVariants.forEach(v => {
        console.log(`  - ${v.size} | ${v.color} | ${v.sku} | Stock: ${v.stock_quantity}`);
      });
    });
  }
}

checkMenProducts().catch(console.error);