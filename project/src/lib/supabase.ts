import { createClient } from '@supabase/supabase-js';

// Sử dụng biến môi trường từ .env nhưng đảm bảo đang trỏ đến cơ sở dữ liệu cục bộ
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

// Xác minh chúng ta đang sử dụng cơ sở dữ liệu cục bộ
const isLocal = supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost');
console.log(`Kết nối đến Supabase ${isLocal ? 'cục bộ (Docker)' : 'trực tuyến'}: ${supabaseUrl}`);

if (!isLocal) {
  console.warn('CẢNH BÁO: Bạn đang không sử dụng cơ sở dữ liệu cục bộ. Kiểm tra lại file .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testConnection = async () => {
  try {
    console.log('Đang kiểm tra kết nối đến Supabase...');
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('❌ Lỗi kết nối Supabase:', error.message);
      return;
    }
    console.log('✅ Kết nối Supabase thành công! Số lượng sản phẩm:', data?.length || 0);
  } catch (err) {
    console.error('❌ Lỗi kiểm tra kết nối Supabase:', err);
  }
};

testConnection();
