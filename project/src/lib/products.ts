import { supabase } from './supabase';
import { getProductImage } from '../data/productImages';

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  base_price: number;
  sale_price: number | null;
  images: string[];
  is_featured: boolean;
  is_new: boolean;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  variants?: ProductVariant[];
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  sku: string;
  stock_quantity: number;
  price_adjustment: number;
  created_at?: string;
};

// Lấy tất cả sản phẩm hoặc theo danh mục
export async function getProducts(categorySlug?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('status', 'active');

  // Nếu có categorySlug, thêm điều kiện lọc theo danh mục
  if (categorySlug) {
    // Đầu tiên lấy ID danh mục từ slug
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (categories) {
      query = query.eq('category_id', categories.id);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Chuyển đổi dữ liệu trả về và tổ chức lại variants
  return data.map(product => {
    // Make sure images is always an array
    let images = product.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        console.error('Error parsing product images:', e);
        images = [];
      }
    } else if (!Array.isArray(images)) {
      images = [];
    }

    return {
      ...product,
      images,
      variants: product.product_variants,
    };
  });
}

// Lấy chi tiết một sản phẩm theo slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    console.error('Error fetching product by slug:', error);
    return null;
  }

  // Make sure images is always an array
  let images = data.images;
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch (e) {
      console.error('Error parsing product images:', e);
      images = [];
    }
  } else if (!Array.isArray(images)) {
    images = [];
  }

  // Tổ chức lại dữ liệu trả về
  return {
    ...data,
    images,
    variants: data.product_variants,
  };
}

// Lấy sản phẩm nổi bật
export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('is_featured', true)
    .eq('status', 'active')
    .limit(limit);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return data.map(product => {
    // Make sure images is always an array
    let images = product.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        console.error('Error parsing product images:', e);
        images = [];
      }
    } else if (!Array.isArray(images)) {
      images = [];
    }

    return {
      ...product,
      images,
      variants: product.product_variants,
    };
  });
}

// Lấy sản phẩm mới
export async function getNewProducts(limit = 6): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('is_new', true)
    .eq('status', 'active')
    .limit(limit);

  if (error) {
    console.error('Error fetching new products:', error);
    return [];
  }

  return data.map(product => {
    // Make sure images is always an array
    let images = product.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        console.error('Error parsing product images:', e);
        images = [];
      }
    } else if (!Array.isArray(images)) {
      images = [];
    }

    return {
      ...product,
      images,
      variants: product.product_variants,
    };
  });
}

// Lấy ảnh sản phẩm đã xử lý
export function getProcessedProductImages(product: Product): string[] {
  // Ensure product.images is an array
  if (!product || !product.images) {
    return [];
  }
  
  // Convert images to array if it's a string (JSON)
  let imageArray: string[] = [];
  if (typeof product.images === 'string') {
    try {
      imageArray = JSON.parse(product.images);
    } catch (e) {
      console.error('Error parsing product images:', e);
      return [];
    }
  } else if (Array.isArray(product.images)) {
    imageArray = product.images;
  } else {
    return [];
  }
  
  // Trả về đường dẫn ảnh đã được xử lý thông qua hàm getProductImage
  return imageArray.map(imagePath => {
    const image = getProductImage(imagePath);
    return image || imagePath; // Trả về ảnh đã xử lý hoặc đường dẫn gốc nếu không tìm thấy
  });
}