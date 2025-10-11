import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Shield,
  Database,
  BarChart2,
  Mail,
  CreditCard,
  Lock,
  AlertCircle,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';

// Admin components
import ContentManagement from '../components/admin/ContentManagement';
import SettingsTabs from '../components/admin/SettingsTabs';
import GeneralSettings from '../components/admin/GeneralSettings';
import SocialSettings from '../components/admin/SocialSettings';

// Placeholder components for missing admin components
const UserManagement = () => <div className="p-4">Quản lý người dùng đang được phát triển</div>;
const SystemConfiguration = () => <div className="p-4">Cấu hình hệ thống đang được phát triển</div>;
const RolePermissions = () => <div className="p-4">Vai trò & Quyền hạn đang được phát triển</div>;
const DatabaseBackup = () => <div className="p-4">Cơ sở dữ liệu & Sao lưu đang được phát triển</div>;
const AnalyticsDashboard = () => <div className="p-4">Phân tích đang được phát triển</div>;
const EmailTemplates = () => <div className="p-4">Mẫu Email đang được phát triển</div>;
const PaymentSettings = () => <div className="p-4">Cài đặt thanh toán đang được phát triển</div>;
const SecuritySettings = () => <div className="p-4">Bảo mật đang được phát triển</div>;
const AuditLogs = () => <div className="p-4">Nhật ký hệ thống đang được phát triển</div>;

interface AdminTab {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  permissions?: string[];
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<string>('user-management');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['Settings', 'User Management']);
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const checkAdminAccess = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error || !data) {
          throw new Error('Could not verify admin status');
        }
        
        const role = data.role;
        setUserRole(role);
        
        if (role !== 'admin' && role !== 'super_admin') {
          showToast('You do not have permission to access admin settings', 'error');
          navigate('/');
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking admin access:', error);
        showToast('Authentication error', 'error');
        navigate('/');
      }
    };
    
    checkAdminAccess();
  }, [user, navigate, showToast]);
  
  const tabs: AdminTab[] = [
    {
      id: 'user-management',
      name: 'User Management',
      icon: <Users size={20} />,
      component: <UserManagement />,
      permissions: ['manage_users']
    },
    {
      id: 'system-configuration',
      name: 'System Configuration',
      icon: <Settings size={20} />,
      component: <SystemConfiguration />,
      permissions: ['manage_settings']
    },
    {
      id: 'content-management',
      name: 'Content Management',
      icon: <FileText size={20} />,
      component: <ContentManagement />,
      permissions: ['manage_content']
    },
    {
      id: 'role-permissions',
      name: 'Roles & Permissions',
      icon: <Shield size={20} />,
      component: <RolePermissions />,
      permissions: ['manage_roles']
    },
    {
      id: 'database-backup',
      name: 'Database & Backup',
      icon: <Database size={20} />,
      component: <DatabaseBackup />,
      permissions: ['manage_database']
    },
    {
      id: 'analytics-dashboard',
      name: 'Analytics',
      icon: <BarChart2 size={20} />,
      component: <AnalyticsDashboard />
    },
    {
      id: 'email-templates',
      name: 'Email Templates',
      icon: <Mail size={20} />,
      component: <EmailTemplates />,
      permissions: ['manage_emails']
    },
    {
      id: 'payment-settings',
      name: 'Payment Settings',
      icon: <CreditCard size={20} />,
      component: <PaymentSettings />,
      permissions: ['manage_payments']
    },
    {
      id: 'security',
      name: 'Security',
      icon: <Lock size={20} />,
      component: <SecuritySettings />,
      permissions: ['manage_security']
    },
    {
      id: 'audit-logs',
      name: 'Audit Logs',
      icon: <AlertCircle size={20} />,
      component: <AuditLogs />,
      permissions: ['view_logs']
    }
  ];
  
  const changeTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTab(tabId);
      setBreadcrumbs(['Settings', tab.name]);
      
      // For mobile view, close sidebar after selecting tab
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 relative">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Mobile Toggle Button */}
          <div className="lg:hidden p-4 border-b flex items-center justify-between">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              <span className="ml-2 font-medium">Admin Settings</span>
            </button>
          </div>
          
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <aside className={`${
              isSidebarOpen ? 'block' : 'hidden'
            } lg:block w-full lg:w-64 lg:min-h-[calc(100vh-240px)] bg-gray-50 border-r`}>
              <nav className="p-4">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-700">Admin Settings</h2>
                  <p className="text-sm text-gray-500">Manage your store configuration</p>
                </div>
                
                <ul className="space-y-1">
                  {tabs.map((tab) => {
                    // Only show tabs that the user has permission to see
                    if (tab.permissions && userRole !== 'super_admin' && 
                        !tab.permissions.some(perm => true)) { // Replace with actual permission check
                      return null;
                    }
                    
                    return (
                      <li key={tab.id}>
                        <button
                          className={`w-full flex items-center px-4 py-2.5 rounded-lg text-left transition-colors ${
                            activeTab === tab.id
                              ? 'bg-teal-500 text-white'
                              : 'text-gray-700 hover:bg-gray-200'
                          }`}
                          onClick={() => changeTab(tab.id)}
                        >
                          <span className="mr-3">{tab.icon}</span>
                          <span>{tab.name}</span>
                          {activeTab === tab.id && (
                            <ChevronRight size={16} className="ml-auto" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>
            
            {/* Main Content Area */}
            <main className="flex-1 p-6">
              {/* Breadcrumbs */}
              <div className="mb-6">
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    {breadcrumbs.map((crumb, index) => (
                      <li key={index} className="inline-flex items-center">
                        {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                        <span className={`${
                          index === breadcrumbs.length - 1
                            ? 'text-teal-600 font-medium'
                            : 'text-gray-500'
                        }`}>
                          {crumb}
                        </span>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
              
              {/* Active Tab Content */}
              {tabs.find(tab => tab.id === activeTab)?.component}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}