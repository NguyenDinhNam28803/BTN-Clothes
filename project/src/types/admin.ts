import { User } from '@supabase/supabase-js';

// Extended user profile type
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string | null;
  dob?: string | null;
  role: UserRole;
  created_at: string;
  last_sign_in?: string;
  is_active: boolean;
}

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'customer';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: PermissionCategory;
}

export type PermissionCategory = 
  'users' | 
  'products' | 
  'orders' | 
  'content' | 
  'settings' | 
  'analytics';

export interface RolePermission {
  id: string;
  role: UserRole;
  permissions: string[]; // Array of permission IDs
  created_at: string;
  updated_at: string;
}

export interface SystemConfig {
  id: string;
  site_name: string;
  site_description: string;
  contact_email: string;
  support_phone: string;
  default_currency: string;
  default_language: string;
  default_timezone: string;
  maintenance_mode: boolean;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  updated_at: string;
}

export interface SecuritySettings {
  id: string;
  require_email_verification: boolean;
  login_attempts_before_captcha: number;
  login_attempts_before_lockout: number;
  lockout_duration_minutes: number;
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_number: boolean;
  password_require_special_char: boolean;
  session_timeout_minutes: number;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string;
  variables: string[]; // Available variables that can be used in template
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  is_active: boolean;
  config: Record<string, string>; // Configuration parameters
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface BackupRecord {
  id: string;
  filename: string;
  size_bytes: number;
  backup_type: 'full' | 'partial';
  status: 'in_progress' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  created_by: string;
  download_url?: string;
}

export interface Analytics {
  daily_sales: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  product_performance: {
    product_id: string;
    product_name: string;
    units_sold: number;
    revenue: number;
  }[];
  customer_metrics: {
    new_customers: number;
    returning_customers: number;
    average_order_value: number;
  };
  inventory_status: {
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
  };
}