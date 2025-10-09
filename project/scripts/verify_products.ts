import { supabase } from '../lib/supabase';

// Query men's products
async function getProducts() {
  const { data: menProducts, error: menError } = await supabase
    .from('products')
    .select('id, name, slug, description, base_price, sale_price, images, is_featured, is_new')
    .eq('category_id', '550e8400-e29b-41d4-a716-446655440001')
    .order('id');

  if (menError) {
    console.error('Error fetching men products:', menError);
    return;
  }

  console.log('Men products count:', menProducts.length);
  console.log('Men products:', JSON.stringify(menProducts, null, 2));

  // Query women's products
  const { data: womenProducts, error: womenError } = await supabase
    .from('products')
    .select('id, name, slug, description, base_price, sale_price, images, is_featured, is_new')
    .eq('category_id', '550e8400-e29b-41d4-a716-446655440002')
    .order('id');

  if (womenError) {
    console.error('Error fetching women products:', womenError);
    return;
  }

  console.log('Women products count:', womenProducts.length);
  console.log('Women products:', JSON.stringify(womenProducts, null, 2));
}

getProducts();