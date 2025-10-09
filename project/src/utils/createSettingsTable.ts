// createSettingsTable.ts
import { supabase } from '../lib/supabase';

// This function will directly insert initial settings values
// It assumes the settings table exists but is empty
export async function createSettingsTable(): Promise<boolean> {
  try {
    // Since we can't create tables directly through the Supabase JS client,
    // we'll focus on inserting the initial data which is the main need
    
    // First, check if we can access the table
    const { error: accessError } = await supabase
      .from('settings')
      .select('count(*)', { count: 'exact', head: true });
      
    // If we can't access the table, it likely doesn't exist or we don't have permissions
    if (accessError) {
      console.error('Cannot access settings table:', accessError);
      return false;
    }

    // Insert initial data
    const { error: insertError } = await supabase
      .from('settings')
      .insert([
        {
          key: 'company_info',
          value: {
            name: 'BTN Clothes',
            slogan: 'Fashion For Everyone',
            description: 'BTN Clothes là thương hiệu thời trang hàng đầu với các sản phẩm chất lượng cao, thiết kế hiện đại và giá cả hợp lý.',
            logo_url: '',
            tax_id: '0123456789',
            business_license: 'BL-0123456789'
          },
          category: 'general'
        },
        {
          key: 'contact_info',
          value: {
            hotline: '0123-456-789',
            primary_email: 'info@btnclothes.com',
            sales_email: 'sales@btnclothes.com',
            support_email: 'support@btnclothes.com',
            address: '123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
            working_hours_weekday: '8:00 - 20:30',
            working_hours_weekend: '9:00 - 21:00'
          },
          category: 'contact'
        },
        {
          key: 'social_media',
          value: {
            facebook: 'https://facebook.com/btnclothes',
            twitter: 'https://twitter.com/btnclothes',
            instagram: 'https://instagram.com/btnclothes',
            linkedin: 'https://linkedin.com/company/btnclothes'
          },
          category: 'social'
        },
        {
          key: 'appearance',
          value: {
            primary_color: '#3B82F6',
            secondary_color: '#10B981'
          },
          category: 'appearance'
        },
        {
          key: 'notifications',
          value: {
            enable_notifications: true,
            enable_email_alerts: true,
            enable_sms: false,
            maintenance_mode: false
          },
          category: 'notifications'
        }
      ]);

    if (insertError) {
      console.error('Error inserting initial settings:', insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception creating settings table:', error);
    return false;
  }
}