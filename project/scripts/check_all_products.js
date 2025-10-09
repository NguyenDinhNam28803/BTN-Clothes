// check_all_products.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkAllProducts() {
  // Get categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');
  
  if (catError) {
    console.error('Error fetching categories:', catError);
    return;
  }

  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.id] = cat.name;
  });
  
  console.log('Categories:');
  console.log(categories.map(c => `${c.id}: ${c.name}`).join('\n'));
  
  // Get product counts by category
  console.log('\nProduct counts by category:');
  
  for (const category of categories) {
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('category_id', category.id);
      
    if (error) {
      console.error(`Error counting ${category.name} products:`, error);
    } else {
      console.log(`${category.name}: ${count} products`);
    }
  }
  
  // Total product count
  const { count: totalCount, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('Error counting all products:', countError);
  } else {
    console.log(`Total: ${totalCount} products`);
  }
}

checkAllProducts().catch(console.error);