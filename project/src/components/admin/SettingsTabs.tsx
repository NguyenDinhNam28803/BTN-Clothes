import { useState, useEffect } from 'react';
import { 
  Store, 
  Globe, 
  Phone, 
  Save,
} from 'lucide-react';
import { useToast } from '../Toast';
import { supabase } from '../../lib/supabase';
import { createSettingsTable } from '../../utils/createSettingsTable';

interface SettingsTab {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

interface SettingsFieldProps {
  label: string;
  htmlFor: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

const settingsTabs: SettingsTab[] = [
  { id: 'general', label: 'Thông tin chung', icon: Store, description: 'Thông tin cơ bản về cửa hàng' },
  { id: 'contact', label: 'Liên hệ', icon: Phone, description: 'Thông tin liên lạc' },
  { id: 'social', label: 'Mạng xã hội', icon: Globe, description: 'Liên kết mạng xã hội' },


];

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 mb-6">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {description && <p className="text-gray-600 text-sm mb-4">{description}</p>}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export function SettingsField({ label, htmlFor, description, error, required = false, children }: SettingsFieldProps) {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={htmlFor} className="text-sm font-medium flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="bắt buộc">*</span>}
      </label>
      {description && <p className="text-xs text-gray-500" id={`${htmlFor}-description`}>{description}</p>}
      <div className="mt-1">{children}</div>
      {error && <p className="text-sm text-red-600" id={`${htmlFor}-error`} aria-live="polite">{error}</p>}
    </div>
  );
}

export default function SettingsTabs() {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formState, setFormState] = useState({
    // General Information
    companyName: 'BTN Clothes',
    slogan: 'Fashion For Everyone',
    companyDescription: '',
    logoUrl: '',
    taxId: '',
    businessLicense: '',
    
    // Contact Information
    hotline: '',
    primaryEmail: '',
    salesEmail: '',
    supportEmail: '',
    address: '',
    workingHoursWeekday: '',
    workingHoursWeekend: '',
    
    // Social Media
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    
    // Other settings
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    enableNotifications: true,
    enableEmailAlerts: true,
    enableSMS: false,
    maintenanceMode: false
  });
  
  const tabs = settingsTabs;
  const { showToast } = useToast();
  
  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [errorState, setErrorState] = useState<string | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      // Fetch all settings at once for efficiency
      const { data: allSettings, error } = await supabase
        .from('settings')
        .select('key, value');
        
      if (error) {
        console.error('Error fetching settings:', error);
        
        // If table doesn't exist, use default values
        if (error.code === 'PGRST205') {
          // Continue with default values
          setFormState({
            // Default values match the ones in your migration file
            companyName: 'BTN Clothes',
            slogan: 'Fashion For Everyone',
            companyDescription: 'BTN Clothes là thương hiệu thời trang hàng đầu với các sản phẩm chất lượng cao, thiết kế hiện đại và giá cả hợp lý.',
            logoUrl: '',
            taxId: '0123456789',
            businessLicense: 'BL-0123456789',
            
            hotline: '0123-456-789',
            primaryEmail: 'info@btnclothes.com',
            salesEmail: 'sales@btnclothes.com',
            supportEmail: 'support@btnclothes.com',
            address: '123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
            workingHoursWeekday: '8:00 - 20:30',
            workingHoursWeekend: '9:00 - 21:00',
            
            facebook: 'https://facebook.com/btnclothes',
            twitter: 'https://twitter.com/btnclothes',
            instagram: 'https://instagram.com/btnclothes',
            linkedin: 'https://linkedin.com/company/btnclothes',
            
            primaryColor: '#3B82F6',
            secondaryColor: '#10B981',
            enableNotifications: true,
            enableEmailAlerts: true,
            enableSMS: false,
            maintenanceMode: false
          });
          
          setIsLoading(false);
          return;
        }
        
        setErrorState('Không thể tải cài đặt từ máy chủ');
        showToast('Có lỗi xảy ra khi tải cài đặt: ' + error.message, 'error');
        return;
      }
      
      // Convert to key-value map for easier access
      // Using unknown for JSONB values from database
      type SettingsValue = Record<string, unknown>;
      const settingsMap: Record<string, SettingsValue> = {};
      allSettings?.forEach(item => {
        settingsMap[item.key] = item.value;
      });

      // Extract settings with proper type casting
      const generalInfo = settingsMap['company_info'] || {} as SettingsValue;
      const contactInfo = settingsMap['contact_info'] || {} as SettingsValue;
      const socialInfo = settingsMap['social_media'] || {} as SettingsValue;
      const appearanceInfo = settingsMap['appearance'] || {} as SettingsValue;
      const notificationsInfo = settingsMap['notifications'] || {} as SettingsValue;
      
      // Helper function to get string values safely
      const getString = (obj: SettingsValue, key: string, defaultValue: string = ''): string => {
        const val = obj[key];
        return typeof val === 'string' ? val : defaultValue;
      };
      
      // Helper function to get boolean values safely
      const getBoolean = (obj: SettingsValue, key: string, defaultValue: boolean = false): boolean => {
        const val = obj[key];
        return typeof val === 'boolean' ? val : defaultValue;
      };
      
      // Update state with fetched data
      setFormState({
        // General Information
        companyName: getString(generalInfo, 'name', 'BTN Clothes'),
        slogan: getString(generalInfo, 'slogan', 'Fashion For Everyone'),
        companyDescription: getString(generalInfo, 'description'),
        logoUrl: getString(generalInfo, 'logo_url'),
        taxId: getString(generalInfo, 'tax_id'),
        businessLicense: getString(generalInfo, 'business_license'),
        
        // Contact Information
        hotline: getString(contactInfo, 'hotline'),
        primaryEmail: getString(contactInfo, 'primary_email'),
        salesEmail: getString(contactInfo, 'sales_email'),
        supportEmail: getString(contactInfo, 'support_email'),
        address: getString(contactInfo, 'address'),
        workingHoursWeekday: getString(contactInfo, 'working_hours_weekday'),
        workingHoursWeekend: getString(contactInfo, 'working_hours_weekend'),
        
        // Social Media
        facebook: getString(socialInfo, 'facebook'),
        twitter: getString(socialInfo, 'twitter'),
        instagram: getString(socialInfo, 'instagram'),
        linkedin: getString(socialInfo, 'linkedin'),
        
        // Other settings
        primaryColor: getString(appearanceInfo, 'primary_color', '#3B82F6'),
        secondaryColor: getString(appearanceInfo, 'secondary_color', '#10B981'),
        enableNotifications: getBoolean(notificationsInfo, 'enable_notifications', true),
        enableEmailAlerts: getBoolean(notificationsInfo, 'enable_email_alerts', true),
        enableSMS: getBoolean(notificationsInfo, 'enable_sms', false),
        maintenanceMode: getBoolean(notificationsInfo, 'maintenance_mode', false)
      });
      
      showToast('Đã tải cài đặt thành công', 'success');
    } catch (error) {
      console.error('Error fetching settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToast(`Có lỗi xảy ra khi tải cài đặt: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setErrorState(null);
    
    try {
      // Prepare data for saving
      const companyInfo = {
        name: formState.companyName,
        slogan: formState.slogan,
        description: formState.companyDescription,
        logo_url: formState.logoUrl,
        tax_id: formState.taxId,
        business_license: formState.businessLicense
      };
      
      const contactInfo = {
        hotline: formState.hotline,
        primary_email: formState.primaryEmail,
        sales_email: formState.salesEmail,
        support_email: formState.supportEmail,
        address: formState.address,
        working_hours_weekday: formState.workingHoursWeekday,
        working_hours_weekend: formState.workingHoursWeekend
      };
      
      const socialMedia = {
        facebook: formState.facebook,
        twitter: formState.twitter,
        instagram: formState.instagram,
        linkedin: formState.linkedin
      };
      
      const appearance = {
        primary_color: formState.primaryColor,
        secondary_color: formState.secondaryColor
      };
      
      const notifications = {
        enable_notifications: formState.enableNotifications,
        enable_email_alerts: formState.enableEmailAlerts,
        enable_sms: formState.enableSMS,
        maintenance_mode: formState.maintenanceMode
      };
      
      // First, try to check if the settings table exists by making a simple query
      const { error: checkError } = await supabase
        .from('settings')
        .select('count(*)', { count: 'exact', head: true });
        
      // If the table doesn't exist, try to create it using our utility function
      if (checkError && checkError.code === 'PGRST285') {
        showToast('Bảng cài đặt không tồn tại. Đang thử tạo bảng...', 'info');
        
        try {
          // Try to create the settings table
          const success = await createSettingsTable();
          
          if (!success) {
            setErrorState('Không thể tạo bảng cài đặt. Vui lòng liên hệ quản trị viên.');
            showToast('Không thể tạo bảng cài đặt', 'error');
            return;
          }
          
          showToast('Đã tạo bảng cài đặt thành công!', 'success');
          
          // Try to fetch settings again after creating the table
          await fetchSettings();
          return;
        } catch (err) {
          console.error('Exception creating settings table:', err);
          setErrorState('Không thể tạo bảng cài đặt. Vui lòng liên hệ quản trị viên.');
          showToast('Không thể tạo bảng cài đặt', 'error');
          return;
        }
      }
      
      const updateSetting = async (key: string, value: Record<string, unknown>) => {
        // Try to update first
        const { error: updateError } = await supabase
          .from('settings')
          .update({ value })
          .eq('key', key);
        
        // If update fails, try to insert instead
        if (updateError) {
          // If the record doesn't exist, create it
          const { error: insertError } = await supabase
            .from('settings')
            .insert({ key, value, category: getCategoryForKey(key) });
            
          if (insertError) {
            throw new Error(`Error saving ${key}: ${insertError.message}`);
          }
        }
      };
      
      // Helper to get category for each key
      const getCategoryForKey = (key: string): string => {
        switch(key) {
          case 'company_info': return 'general';
          case 'contact_info': return 'contact';
          case 'social_media': return 'social';
          case 'appearance': return 'appearance';
          case 'notifications': return 'notifications';
          default: return 'general';
        }
      };
      
      // Update all settings in parallel for better performance
      await Promise.all([
        updateSetting('company_info', companyInfo),
        updateSetting('contact_info', contactInfo),
        updateSetting('social_media', socialMedia),
        updateSetting('appearance', appearance),
        updateSetting('notifications', notifications)
      ]);
      
      showToast('Cài đặt đã được lưu thành công', 'success');
      // Refresh settings to ensure we have the latest data
      await fetchSettings();
    } catch (error: unknown) {
      console.error('Error saving settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      setErrorState(`Không thể lưu cài đặt: ${errorMessage}`);
      showToast(`Có lỗi xảy ra khi lưu cài đặt: ${errorMessage}`, 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Thông tin chung</h2>
            <p className="text-gray-600">Quản lý thông tin cơ bản về công ty của bạn</p>
            
            <SettingsSection title="Thông tin cơ bản">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingsField label="Tên công ty" htmlFor="companyName" required>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    placeholder="Nhập tên công ty"
                    aria-required="true"
                    value={formState.companyName}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </SettingsField>
                
                <SettingsField label="Slogan" htmlFor="slogan">
                  <input
                    type="text"
                    id="slogan"
                    name="slogan"
                    placeholder="Nhập slogan công ty"
                    aria-label="Slogan công ty"
                    value={formState.slogan}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </SettingsField>
              </div>
              
              <SettingsField label="Mô tả công ty" htmlFor="companyDescription">
                <textarea
                  id="companyDescription"
                  name="companyDescription"
                  placeholder="Nhập mô tả về công ty của bạn"
                  aria-label="Mô tả công ty"
                  value={formState.companyDescription}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingsField>

              <SettingsField label="Logo công ty" htmlFor="logoUrl">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gray-100 flex items-center justify-center font-bold text-2xl text-gray-700 rounded-md border border-gray-300">
                    XE
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Tải lên logo mới"
                  >
                    Tải lên logo mới
                  </button>
                </div>
              </SettingsField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingsField label="Mã số thuế" htmlFor="taxId">
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    placeholder="Nhập mã số thuế"
                    aria-label="Mã số thuế"
                    value={formState.taxId}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </SettingsField>
                
                <SettingsField label="Giấy phép kinh doanh" htmlFor="businessLicense">
                  <input
                    type="text"
                    id="businessLicense"
                    name="businessLicense"
                    placeholder="Nhập mã giấy phép kinh doanh"
                    aria-label="Giấy phép kinh doanh"
                    value={formState.businessLicense}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </SettingsField>
              </div>
            </SettingsSection>
          </div>
        );
      
      case 'appearance':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Cài đặt giao diện</h2>
            <p className="text-gray-600">Tùy chỉnh giao diện cho website của bạn</p>
            
            <SettingsSection title="Màu sắc thương hiệu">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingsField label="Màu chính" htmlFor="primaryColor">
                  <div className="flex items-center">
                    <input
                      type="color"
                      id="primaryColor"
                      name="primaryColor"
                      aria-label="Chọn màu chính"
                      title="Chọn màu chính"
                      value={formState.primaryColor}
                      onChange={handleChange}
                      className="h-10 w-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      aria-label="Mã màu chính"
                      placeholder="Mã màu HEX"
                      title="Nhập mã màu HEX"
                      value={formState.primaryColor}
                      onChange={(e) => setFormState({...formState, primaryColor: e.target.value})}
                      className="ml-3 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </SettingsField>
                
                <SettingsField label="Màu phụ" htmlFor="secondaryColor">
                  <div className="flex items-center">
                    <input
                      type="color"
                      id="secondaryColor"
                      name="secondaryColor"
                      aria-label="Chọn màu phụ"
                      title="Chọn màu phụ"
                      value={formState.secondaryColor}
                      onChange={handleChange}
                      className="h-10 w-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      aria-label="Mã màu phụ"
                      placeholder="Mã màu HEX"
                      title="Nhập mã màu HEX"
                      value={formState.secondaryColor}
                      onChange={(e) => setFormState({...formState, secondaryColor: e.target.value})}
                      className="ml-3 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </SettingsField>
              </div>
            </SettingsSection>
          </div>
        );
      

      
      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Cài đặt thông báo</h2>
            <p className="text-gray-600">Quản lý thông báo cho cửa hàng của bạn</p>
            
            <SettingsSection title="Thông báo hệ thống">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableNotifications"
                      name="enableNotifications"
                      type="checkbox"
                      aria-label="Bật thông báo hệ thống"
                      checked={formState.enableNotifications}
                      onChange={(e) => setFormState({...formState, enableNotifications: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableNotifications" className="font-medium text-gray-700">Bật thông báo hệ thống</label>
                    <p className="text-gray-500">Nhận thông báo về các sự kiện hệ thống quan trọng</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableEmailAlerts"
                      name="enableEmailAlerts"
                      type="checkbox"
                      aria-label="Bật thông báo email"
                      checked={formState.enableEmailAlerts}
                      onChange={(e) => setFormState({...formState, enableEmailAlerts: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableEmailAlerts" className="font-medium text-gray-700">Bật thông báo email</label>
                    <p className="text-gray-500">Nhận email thông báo khi có đơn hàng mới hoặc thay đổi trạng thái đơn hàng</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableSMS"
                      name="enableSMS"
                      type="checkbox"
                      aria-label="Bật thông báo SMS"
                      checked={formState.enableSMS}
                      onChange={(e) => setFormState({...formState, enableSMS: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableSMS" className="font-medium text-gray-700">Bật thông báo SMS</label>
                    <p className="text-gray-500">Nhận SMS thông báo về các sự kiện quan trọng (có thể phát sinh phí)</p>
                  </div>
                </div>
              </div>
            </SettingsSection>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Thông tin liên hệ</h2>
            <p className="text-gray-600">Quản lý thông tin liên hệ của công ty</p>
            
            <SettingsSection title="Thông tin liên hệ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingsField label="Hotline" htmlFor="hotline">
                  <input
                    type="tel"
                    id="hotline"
                    name="hotline"
                    placeholder="Nhập số hotline"
                    aria-label="Hotline"
                    value={formState.hotline}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </SettingsField>
                
                <SettingsField label="Email chính" htmlFor="primaryEmail">
                  <input
                    type="email"
                    id="primaryEmail"
                    name="primaryEmail"
                    placeholder="Nhập email chính"
                    aria-label="Email chính"
                    value={formState.primaryEmail}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </SettingsField>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingsField label="Email bán hàng" htmlFor="salesEmail">
                  <input
                    type="email"
                    id="salesEmail"
                    name="salesEmail"
                    placeholder="Nhập email bán hàng"
                    aria-label="Email bán hàng"
                    value={formState.salesEmail}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </SettingsField>
                
                <SettingsField label="Email hỗ trợ" htmlFor="supportEmail">
                  <input
                    type="email"
                    id="supportEmail"
                    name="supportEmail"
                    placeholder="Nhập email hỗ trợ"
                    aria-label="Email hỗ trợ"
                    value={formState.supportEmail}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </SettingsField>
              </div>
              
              <SettingsField label="Địa chỉ trụ sở chính" htmlFor="address">
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Nhập địa chỉ trụ sở chính"
                  aria-label="Địa chỉ trụ sở chính"
                  value={formState.address}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingsField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingsField label="Giờ làm việc (T2-T6)" htmlFor="workingHoursWeekday">
                  <input
                    type="text"
                    id="workingHoursWeekday"
                    name="workingHoursWeekday"
                    placeholder="Ví dụ: 8:00 - 17:30"
                    aria-label="Giờ làm việc ngày thường"
                    value={formState.workingHoursWeekday}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </SettingsField>
                
                <SettingsField label="Giờ làm việc (T7)" htmlFor="workingHoursWeekend">
                  <input
                    type="text"
                    id="workingHoursWeekend"
                    name="workingHoursWeekend"
                    placeholder="Ví dụ: 8:00 - 12:00"
                    aria-label="Giờ làm việc cuối tuần"
                    value={formState.workingHoursWeekend}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </SettingsField>
              </div>
            </SettingsSection>
          </div>
        );
        
      case 'social':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Mạng xã hội</h2>
            <p className="text-gray-600">Quản lý các liên kết mạng xã hội của công ty</p>
            
            <SettingsSection title="Mạng xã hội">
              <SettingsField label="Facebook" htmlFor="facebook">
                <input
                  type="url"
                  id="facebook"
                  name="facebook"
                  placeholder="https://facebook.com/xecongtrinhvn"
                  aria-label="Link Facebook"
                  value={formState.facebook}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingsField>
              
              <SettingsField label="Twitter" htmlFor="twitter">
                <input
                  type="url"
                  id="twitter"
                  name="twitter"
                  placeholder="https://twitter.com/xecongtrinhvn"
                  aria-label="Link Twitter"
                  value={formState.twitter}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingsField>
              
              <SettingsField label="Instagram" htmlFor="instagram">
                <input
                  type="url"
                  id="instagram"
                  name="instagram"
                  placeholder="https://instagram.com/xecongtrinhvn"
                  aria-label="Link Instagram"
                  value={formState.instagram}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingsField>
              
              <SettingsField label="LinkedIn" htmlFor="linkedin">
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  placeholder="https://linkedin.com/company/xecongtrinhvn"
                  aria-label="Link LinkedIn"
                  value={formState.linkedin}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingsField>
            </SettingsSection>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Tính năng đang được phát triển</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tính năng này sẽ sớm được triển khai trong phiên bản tiếp theo.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full gap-6">
      {/* Sidebar with tabs */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'bg-cyan-500 text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {isLoading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center">
              <svg className="animate-spin h-10 w-10 text-cyan-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600">Đang tải cài đặt...</p>
            </div>
          ) : errorState ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center">
              <div className="rounded-full bg-red-100 p-3 mb-4">
                <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Không thể tải cài đặt</h3>
              <p className="text-gray-600 mb-4 text-center">{errorState}</p>
              <button 
                onClick={fetchSettings}
                className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : (
            renderTabContent()
          )}
          
          {/* Save button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className={`
                flex items-center justify-center gap-2 px-4 py-2 rounded-md
                ${saveLoading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }
              `}
            >
              {saveLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={18} aria-hidden="true" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
