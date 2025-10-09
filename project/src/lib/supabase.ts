import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const isLocal = supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost');
console.log(`Kết nối đến Supabase ${isLocal ? 'cục bộ (Docker)' : 'trực tuyến'}: ${supabaseUrl}`);

if (!isLocal) {
  console.warn('CẢNH BÁO: Bạn đang không sử dụng cơ sở dữ liệu cục bộ. Hãy chắc chắn đây là môi trường Production/Staging.');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);















