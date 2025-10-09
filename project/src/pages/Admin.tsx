import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Star,
  Settings,
  DollarSign,
  ShoppingBag,
  AlertCircle,
  X,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Order, Category, User, Voucher, Review } from '../types';
import { useToast } from '../components/Toast';
import SettingsTabs from '../components/admin/SettingsTabs';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { showToast } = useToast();
  
  // State for data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    lowStockItems: 0
  });
  
  // Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('all');
  const [productStatus, setProductStatus] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState('all');
  const [voucherSearch, setVoucherSearch] = useState('');
  const [voucherStatus, setVoucherStatus] = useState('all');
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewStatus, setReviewStatus] = useState('all');
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [showReviewDetailModal, setShowReviewDetailModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deletingVoucher, setDeletingVoucher] = useState<Voucher | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [viewingReview, setViewingReview] = useState<Review | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  
  // Form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    base_price: '',
    sale_price: '',
    category_id: '',
    status: 'active' as 'active' | 'inactive',
    images: [] as string[],
  });

  const [voucherForm, setVoucherForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_value: '',
    max_uses: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
  });
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCategories(),
        loadProducts(),
        loadOrders(),
        loadUsers(),
        loadVouchers(),
        loadReviews(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error loading categories:', error);
    } else {
      setCategories(data || []);
    }
  };
  
  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(
          id,
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading products:', error);
    } else {
      setProducts(data || []);
    }
  };
  
  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
      console.log(data)
    if (error) {
      console.error('Error loading orders:', error);
    } else {
      setOrders(data || []);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading users:', error);
    } else {
      setUsers(data || []);
    }
  };

  const loadVouchers = async () => {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading vouchers:', error);
    } else {
      setVouchers(data || []);
    }
  };

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        product:products(
          id,
          name,
          images
        ),
        user:users(
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading reviews:', error);
    } else {
      setReviews(data || []);
    }
  };
  
  const loadStats = async () => {
    try {
      // Total revenue from completed orders
      const { data: completedOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .in('status', ['delivered']);
      
      const totalRevenue = completedOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      
      // Total orders
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      // Total customers
      const { count: totalCustomers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');
      
      // Low stock items (variants with stock < 10)
      const { data: lowStockVariants } = await supabase
        .from('product_variants')
        .select('product_id')
        .lt('stock_quantity', 10);
      
      const uniqueLowStockProducts = new Set(lowStockVariants?.map(v => v.product_id) || []);
      
      setStats({
        totalRevenue,
        totalOrders: totalOrders || 0,
        totalCustomers: totalCustomers || 0,
        lowStockItems: uniqueLowStockProducts.size
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };
  
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      showToast('Order status updated successfully', 'success');
      loadOrders();
      
      // Update viewing order if it's open
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder({ ...viewingOrder, status: newStatus as any });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      showToast('Failed to update order status', 'error');
    }
  };
  
  const openOrderDetailModal = async (order: Order) => {
    setViewingOrder(order);
    setShowOrderDetailModal(true);
    
    // Load order items
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(
            id,
            name,
            images
          )
        `)
        .eq('order_id', order.id);
      
      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error('Error loading order items:', error);
      showToast('Failed to load order items', 'error');
    }
  };
  
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      
      if (error) throw error;
      
      showToast('Order cancelled successfully', 'success');
      loadOrders();
      setShowOrderDetailModal(false);
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast('Failed to cancel order', 'error');
    }
  };
  
  const openCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      base_price: '',
      sale_price: '',
      category_id: '',
      status: 'active',
      images: [],
    });
    setShowProductModal(true);
  };
  
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      base_price: product.base_price.toString(),
      sale_price: product.sale_price?.toString() || '',
      category_id: product.category_id,
      status: product.status,
      images: product.images || [],
    });
    setShowProductModal(true);
  };
  
  const openDeleteModal = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };
  
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        base_price: parseFloat(productForm.base_price),
        sale_price: productForm.sale_price ? parseFloat(productForm.sale_price) : null,
        category_id: productForm.category_id,
        status: productForm.status,
        images: productForm.images || null,
      };
      
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        showToast('Product updated successfully', 'success');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
        showToast('Product created successfully', 'success');
      }
      
      setShowProductModal(false);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Failed to save product', 'error');
    }
  };
  
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deletingProduct.id);
      
      if (error) throw error;
      
      showToast('Product deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Failed to delete product', 'error');
    }
  };

  // Voucher functions
  const openCreateVoucherModal = () => {
    setEditingVoucher(null);
    setVoucherForm({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_value: '',
      max_uses: '',
      valid_from: '',
      valid_until: '',
      is_active: true,
    });
    setShowVoucherModal(true);
  };

  const openEditVoucherModal = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setVoucherForm({
      code: voucher.code,
      description: voucher.description,
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value.toString(),
      min_order_value: voucher.min_order_value.toString(),
      max_uses: voucher.max_uses.toString(),
      valid_from: voucher.valid_from.split('T')[0],
      valid_until: voucher.valid_until.split('T')[0],
      is_active: voucher.is_active,
    });
    setShowVoucherModal(true);
  };

  const openDeleteVoucherModal = (voucher: Voucher) => {
    setDeletingVoucher(voucher);
    setShowDeleteModal(true);
  };

  const handleSubmitVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const voucherData = {
        code: voucherForm.code,
        description: voucherForm.description,
        discount_type: voucherForm.discount_type,
        discount_value: parseFloat(voucherForm.discount_value),
        min_order_value: parseFloat(voucherForm.min_order_value),
        max_uses: parseInt(voucherForm.max_uses),
        valid_from: new Date(voucherForm.valid_from).toISOString(),
        valid_until: new Date(voucherForm.valid_until).toISOString(),
        is_active: voucherForm.is_active,
      };
      
      if (editingVoucher) {
        const { error } = await supabase
          .from('vouchers')
          .update(voucherData)
          .eq('id', editingVoucher.id);
        
        if (error) throw error;
        showToast('Voucher updated successfully', 'success');
      } else {
        const { error } = await supabase
          .from('vouchers')
          .insert([voucherData]);
        
        if (error) throw error;
        showToast('Voucher created successfully', 'success');
      }
      
      setShowVoucherModal(false);
      loadVouchers();
    } catch (error) {
      console.error('Error saving voucher:', error);
      showToast('Failed to save voucher', 'error');
    }
  };

  const handleDeleteVoucher = async () => {
    if (!deletingVoucher) return;
    
    try {
      const { error } = await supabase
        .from('vouchers')
        .delete()
        .eq('id', deletingVoucher.id);
      
      if (error) throw error;
      
      showToast('Voucher deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingVoucher(null);
      loadVouchers();
    } catch (error) {
      console.error('Error deleting voucher:', error);
      showToast('Failed to delete voucher', 'error');
    }
  };

  // Review functions
  const openReviewDetailModal = async (review: Review) => {
    setViewingReview(review);
    setShowReviewDetailModal(true);
  };

  const approveReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', reviewId);
      
      if (error) throw error;
      
      showToast('Review approved successfully', 'success');
      loadReviews();
      
      if (viewingReview && viewingReview.id === reviewId) {
        setViewingReview({ ...viewingReview, is_approved: true });
      }
    } catch (error) {
      console.error('Error approving review:', error);
      showToast('Failed to approve review', 'error');
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
      
      if (error) throw error;
      
      showToast('Review deleted successfully', 'success');
      loadReviews();
      setShowReviewDetailModal(false);
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast('Failed to delete review', 'error');
    }
  };
  
  const getProductStatus = (product: Product) => {
    // This would need to check variants stock
    if (product.status === 'inactive') return 'Inactive';
    // Simplified - in real app would check total stock from variants
    return 'Active';
  };

  const getCategoryName = (id: string) => {
    if (!id) return 'N/A';
    const category = categories.find((c) => c.id === id);
    return category?.name || 'Unknown';
  }
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategory === 'all' || product.category_id === productCategory;
    const matchesStatus = productStatus === 'all' || product.status === productStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatus === 'all' || order.status === orderStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                         (user.full_name && user.full_name.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = userRole === 'all' || user.role === userRole;
    return matchesSearch && matchesRole;
  });

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.code.toLowerCase().includes(voucherSearch.toLowerCase());
    const matchesStatus = voucherStatus === 'all' || 
                         (voucherStatus === 'active' && voucher.is_active) ||
                         (voucherStatus === 'inactive' && !voucher.is_active);
    return matchesSearch && matchesStatus;
  });

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.product?.name.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                         review.user?.full_name?.toLowerCase().includes(reviewSearch.toLowerCase());
    const matchesStatus = reviewStatus === 'all' ||
                         (reviewStatus === 'approved' && review.is_approved) ||
                         (reviewStatus === 'pending' && !review.is_approved);
    return matchesSearch && matchesStatus;
  });

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'products', label: 'Sản phẩm', icon: Package },
    { id: 'orders', label: 'Đơn hàng', icon: ShoppingCart },
    { id: 'customers', label: 'Khách hàng', icon: Users },
    { id: 'vouchers', label: 'Mã giảm giá', icon: Tag },
    { id: 'reviews', label: 'Bình luận', icon: Star },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const statsDisplay = [
    { label: 'Tổng doanh thu', value: `$${stats.totalRevenue.toFixed(2)}`, change: '+12.5%', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Tổng đơn hàng', value: stats.totalOrders.toString(), change: '+8.2%', icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Tổng khách hàng', value: stats.totalCustomers.toString(), change: '+15.3%', icon: Users, color: 'bg-purple-500' },
    { label: 'Sản phẩm sắp hết', value: stats.lowStockItems.toString(), change: '-3', icon: AlertCircle, color: 'bg-red-500' },
  ];

  const recentOrders = orders.slice(0, 4);

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-gray-900 text-white p-6 fixed">
          <h2 className="text-2xl font-serif mb-8">BTN Admin</h2>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 ml-64 p-8">
          {activeTab === 'dashboard' && (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Tổng quan</h1>
                <p className="text-gray-600">Chào mừng quay trở lại trang quản lý</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsDisplay.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                          <Icon size={24} />
                        </div>
                        <span className={`text-sm font-semibold ${
                          stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Tổng quan Bán hàng</h3>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {[65, 45, 78, 52, 90, 70, 85].map((height, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-teal-500 rounded-t-lg transition-all hover:bg-teal-600"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-gray-600 mt-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Danh mục Hàng đầu</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Men\'s Clothing', sales: 45, color: 'bg-blue-500' },
                      { name: 'Women\'s Clothing', sales: 35, color: 'bg-pink-500' },
                      { name: 'Accessories', sales: 15, color: 'bg-purple-500' },
                      { name: 'Kids', sales: 5, color: 'bg-yellow-500' },
                    ].map((category, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm text-gray-600">{category.sales}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${category.color} rounded-full transition-all`}
                            style={{ width: `${category.sales}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Đơn hàng Gần đây</h3>
                  <button className="text-teal-500 hover:text-teal-600 font-medium">
                    Xem tất cả →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold">Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Total</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-600">
                            Loading orders...
                          </td>
                        </tr>
                      ) : recentOrders.length > 0 ? (
                        recentOrders.map((order) => (
                          <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{order.id.substring(0, 8)}</td>
                            <td className="py-3 px-4">{order.shipping_address?.full_name || 'N/A'}</td>
                            <td className="py-3 px-4">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="py-3 px-4 font-semibold">${order.total_amount.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  order.status === 'delivered'
                                    ? 'bg-green-100 text-green-700'
                                    : order.status === 'shipped'
                                    ? 'bg-blue-100 text-blue-700'
                                    : order.status === 'processing'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : order.status === 'cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button className="text-teal-500 hover:text-teal-600 font-medium">
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-600">
                            No orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Products</h1>
                  <p className="text-gray-600">Manage your product inventory</p>
                </div>
                <button 
                  onClick={openCreateModal}
                  className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add New Product
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <select 
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <select 
                    value={productStatus}
                    onChange={(e) => setProductStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Product</th>
                        <th className="text-left py-3 px-4 font-semibold">Category</th>
                        <th className="text-left py-3 px-4 font-semibold">Price</th>
                        <th className="text-left py-3 px-4 font-semibold">Stock</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-600">
                            Loading products...
                          </td>
                        </tr>
                      ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{product.name}</td>
                            <td className="py-3 px-4">{getCategoryName(product.category_id)}</td>
                            <td className="py-3 px-4 font-semibold">${(product.sale_price || product.base_price).toFixed(2)}</td>
                            <td className="py-3 px-4">-</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  getProductStatus(product) === 'Active'
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {getProductStatus(product)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => openEditModal(product)}
                                  className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                                >
                                  <Edit2 size={16} />
                                  Edit
                                </button>
                                <button 
                                  onClick={() => openDeleteModal(product)}
                                  className="text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-600">
                            No products found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Quản lý Khách hàng</h1>
                <p className="text-gray-600">Xem và quản lý thông tin khách hàng</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Tìm kiếm khách hàng..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <select 
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="customer">Khách hàng</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Tên</th>
                        <th className="text-left py-3 px-4 font-semibold">Email</th>
                        <th className="text-left py-3 px-4 font-semibold">Số điện thoại</th>
                        <th className="text-left py-3 px-4 font-semibold">Vai trò</th>
                        <th className="text-left py-3 px-4 font-semibold">Trạng thái</th>
                        <th className="text-left py-3 px-4 font-semibold">Ngày tạo</th>
                        <th className="text-left py-3 px-4 font-semibold">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-600">
                            Đang tải danh sách khách hàng...
                          </td>
                        </tr>
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{user.full_name || 'Chưa cập nhật'}</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">{user.phone || 'Chưa cập nhật'}</td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {user.role === 'admin' ? 'Admin' : 'Khách hàng'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.is_active 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {user.is_active ? 'Hoạt động' : 'Không hoạt động'}
                              </span>
                            </td>
                            <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <button 
                                onClick={() => {
                                  setViewingUser(user);
                                  setShowUserDetailModal(true);
                                }}
                                className="text-teal-500 hover:text-teal-600 font-medium flex items-center gap-1"
                              >
                                <Edit2 size={16} />
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-600">
                            Không tìm thấy khách hàng nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vouchers' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Quản lý Mã giảm giá</h1>
                  <p className="text-gray-600">Tạo và quản lý các mã giảm giá</p>
                </div>
                <button 
                  onClick={openCreateVoucherModal}
                  className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Tạo mã giảm giá mới
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã giảm giá..."
                    value={voucherSearch}
                    onChange={(e) => setVoucherSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <select 
                    value={voucherStatus}
                    onChange={(e) => setVoucherStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Mã</th>
                        <th className="text-left py-3 px-4 font-semibold">Mô tả</th>
                        <th className="text-left py-3 px-4 font-semibold">Giá trị</th>
                        <th className="text-left py-3 px-4 font-semibold">Đã sử dụng</th>
                        <th className="text-left py-3 px-4 font-semibold">Hạn sử dụng</th>
                        <th className="text-left py-3 px-4 font-semibold">Trạng thái</th>
                        <th className="text-left py-3 px-4 font-semibold">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-600">
                            Đang tải danh sách mã giảm giá...
                          </td>
                        </tr>
                      ) : filteredVouchers.length > 0 ? (
                        filteredVouchers.map((voucher) => (
                          <tr key={voucher.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium font-mono">{voucher.code}</td>
                            <td className="py-3 px-4">{voucher.description}</td>
                            <td className="py-3 px-4">
                              {voucher.discount_type === 'percentage' 
                                ? `${voucher.discount_value}%` 
                                : `$${voucher.discount_value.toFixed(2)}`
                              }
                            </td>
                            <td className="py-3 px-4">{voucher.used_count}/{voucher.max_uses}</td>
                            <td className="py-3 px-4">{new Date(voucher.valid_until).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                voucher.is_active 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {voucher.is_active ? 'Hoạt động' : 'Không hoạt động'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => openEditVoucherModal(voucher)}
                                  className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                                >
                                  <Edit2 size={16} />
                                  Sửa
                                </button>
                                <button 
                                  onClick={() => openDeleteVoucherModal(voucher)}
                                  className="text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                                >
                                  <Trash2 size={16} />
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-600">
                            Không tìm thấy mã giảm giá nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Quản lý Bình luận</h1>
                <p className="text-gray-600">Xem và duyệt bình luận của khách hàng</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Tìm kiếm bình luận..."
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <select 
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="pending">Chờ duyệt</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Sản phẩm</th>
                        <th className="text-left py-3 px-4 font-semibold">Khách hàng</th>
                        <th className="text-left py-3 px-4 font-semibold">Đánh giá</th>
                        <th className="text-left py-3 px-4 font-semibold">Tiêu đề</th>
                        <th className="text-left py-3 px-4 font-semibold">Trạng thái</th>
                        <th className="text-left py-3 px-4 font-semibold">Ngày tạo</th>
                        <th className="text-left py-3 px-4 font-semibold">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-600">
                            Đang tải danh sách bình luận...
                          </td>
                        </tr>
                      ) : filteredReviews.length > 0 ? (
                        filteredReviews.map((review) => (
                          <tr key={review.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{review.product?.name || 'N/A'}</td>
                            <td className="py-3 px-4">{review.user?.full_name || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={16}
                                    className={`${
                                      star <= review.rating 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 text-sm text-gray-600">({review.rating})</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">{review.title}</td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                review.is_approved 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {review.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                              </span>
                            </td>
                            <td className="py-3 px-4">{new Date(review.created_at).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <button 
                                onClick={() => openReviewDetailModal(review)}
                                className="text-teal-500 hover:text-teal-600 font-medium flex items-center gap-1"
                              >
                                <Edit2 size={16} />
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-600">
                            Không tìm thấy bình luận nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Orders</h1>
                <p className="text-gray-600">Manage customer orders</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <select 
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold">Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Total</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-600">
                            Loading orders...
                          </td>
                        </tr>
                      ) : filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{order.id.substring(0, 8)}</td>
                            <td className="py-3 px-4">{order.shipping_address?.full_name || 'N/A'}</td>
                            <td className="py-3 px-4">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="py-3 px-4 font-semibold">${order.total_amount.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <button 
                                onClick={() => openOrderDetailModal(order)}
                                className="text-teal-500 hover:text-teal-600 font-medium flex items-center gap-1"
                              >
                                <Edit2 size={16} />
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-600">
                            No orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-gray-600">Configure store settings</p>
              </div>
              <SettingsTabs />
            </div>
          )}
        </main>
      </div>
      
      {/* Product Create/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Base Price *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={productForm.base_price}
                    onChange={(e) => setProductForm({ ...productForm, base_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Sale Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.sale_price}
                    onChange={(e) => setProductForm({ ...productForm, sale_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category *</label>
                  <select
                    required
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Status *</label>
                  <select
                    required
                    value={productForm.status}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Image URLs (comma-separated)</label>
                <input
                  type="text"
                  value={productForm.images.join(', ')}
                  onChange={(e) => setProductForm({ 
                    ...productForm, 
                    images: e.target.value.split(',').map(url => url.trim()).filter(url => url !== '')
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Enter multiple image URLs separated by commas</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Voucher Create/Edit Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingVoucher ? 'Chỉnh sửa Mã giảm giá' : 'Tạo Mã giảm giá mới'}
              </h2>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitVoucher} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Mã giảm giá *</label>
                  <input
                    type="text"
                    required
                    value={voucherForm.code}
                    onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    placeholder="VÍ DỤ: SALE20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Loại giảm giá *</label>
                  <select
                    required
                    value={voucherForm.discount_type}
                    onChange={(e) => setVoucherForm({ ...voucherForm, discount_type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định ($)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Mô tả</label>
                <textarea
                  value={voucherForm.description}
                  onChange={(e) => setVoucherForm({ ...voucherForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Mô tả về mã giảm giá"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Giá trị giảm *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={voucherForm.discount_value}
                    onChange={(e) => setVoucherForm({ ...voucherForm, discount_value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={voucherForm.discount_type === 'percentage' ? '20' : '10.00'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Đơn hàng tối thiểu *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={voucherForm.min_order_value}
                    onChange={(e) => setVoucherForm({ ...voucherForm, min_order_value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="50.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Số lần sử dụng tối đa *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={voucherForm.max_uses}
                    onChange={(e) => setVoucherForm({ ...voucherForm, max_uses: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="100"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Có hiệu lực từ *</label>
                  <input
                    type="date"
                    required
                    value={voucherForm.valid_from}
                    onChange={(e) => setVoucherForm({ ...voucherForm, valid_from: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Có hiệu lực đến *</label>
                  <input
                    type="date"
                    required
                    value={voucherForm.valid_until}
                    onChange={(e) => setVoucherForm({ ...voucherForm, valid_until: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={voucherForm.is_active}
                  onChange={(e) => setVoucherForm({ ...voucherForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="is_active" className="text-sm font-semibold">
                  Mã giảm giá đang hoạt động
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                >
                  {editingVoucher ? 'Cập nhật Mã giảm giá' : 'Tạo Mã giảm giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetailModal && viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Thông tin Khách hàng</h2>
              <button
                onClick={() => {
                  setShowUserDetailModal(false);
                  setViewingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tên đầy đủ:</span>
                      <span className="font-medium">{viewingUser.full_name || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{viewingUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số điện thoại:</span>
                      <span className="font-medium">{viewingUser.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vai trò:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        viewingUser.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {viewingUser.role === 'admin' ? 'Admin' : 'Khách hàng'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Thông tin tài khoản</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        viewingUser.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {viewingUser.is_active ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày tạo:</span>
                      <span className="font-medium">
                        {new Date(viewingUser.created_at).toLocaleString()}
                      </span>
                    </div>
                    {viewingUser.last_login && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lần đăng nhập cuối:</span>
                        <span className="font-medium">
                          {new Date(viewingUser.last_login).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowUserDetailModal(false);
                    setViewingUser(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Detail Modal */}
      {showReviewDetailModal && viewingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Chi tiết Bình luận</h2>
              <button
                onClick={() => {
                  setShowReviewDetailModal(false);
                  setViewingReview(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Thông tin sản phẩm</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tên sản phẩm:</span>
                      <span className="font-medium">{viewingReview.product?.name || 'N/A'}</span>
                    </div>
                    {viewingReview.product?.images && viewingReview.product.images.length > 0 && (
                      <div className="mt-4">
                        <img
                          src={viewingReview.product.images[0]}
                          alt={viewingReview.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Thông tin khách hàng</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tên khách hàng:</span>
                      <span className="font-medium">{viewingReview.user?.full_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{viewingReview.user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đánh giá:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={`${
                              star <= viewingReview.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-sm text-gray-600">({viewingReview.rating}/5)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Nội dung bình luận</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{viewingReview.title}</h4>
                  <p className="text-gray-700">{viewingReview.comment}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Trạng thái</h3>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    viewingReview.is_approved 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {viewingReview.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                  </span>
                  <span className="text-gray-600">
                    Được tạo: {new Date(viewingReview.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowReviewDetailModal(false);
                    setViewingReview(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                {!viewingReview.is_approved && (
                  <button
                    onClick={() => approveReview(viewingReview.id)}
                    className="flex-1 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Duyệt bình luận
                  </button>
                )}
                <button
                  onClick={() => deleteReview(viewingReview.id)}
                  className="flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Xóa bình luận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (deletingProduct || deletingVoucher) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-2">
                {deletingProduct ? 'Xóa Sản phẩm' : 'Xóa Mã giảm giá'}
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Bạn có chắc chắn muốn xóa <strong>{deletingProduct ? deletingProduct.name : deletingVoucher?.code}</strong>? Hành động này không thể hoàn tác.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingProduct(null);
                    setDeletingVoucher(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={deletingProduct ? handleDeleteProduct : handleDeleteVoucher}
                  className="flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Detail Modal */}
      {showOrderDetailModal && viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={() => {
                  setShowOrderDetailModal(false);
                  setViewingOrder(null);
                  setOrderItems([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{viewingOrder.id.substring(0, 8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium">{viewingOrder.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(viewingOrder.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium capitalize">{viewingOrder.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`font-medium ${
                        viewingOrder.payment_status === 'paid' ? 'text-green-600' : 
                        viewingOrder.payment_status === 'failed' ? 'text-red-600' : 
                        'text-yellow-600'
                      }`}>
                        {viewingOrder.payment_status.charAt(0).toUpperCase() + viewingOrder.payment_status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                  <div className="space-y-1 text-gray-700">
                    <p className="font-medium">{viewingOrder.shipping_address?.full_name}</p>
                    <p>{viewingOrder.shipping_address?.phone}</p>
                    <p>{viewingOrder.shipping_address?.address_line1}</p>
                    {viewingOrder.shipping_address?.address_line2 && (
                      <p>{viewingOrder.shipping_address.address_line2}</p>
                    )}
                    <p>
                      {viewingOrder.shipping_address?.city}, {viewingOrder.shipping_address?.state}{' '}
                      {viewingOrder.shipping_address?.postal_code}
                    </p>
                    <p>{viewingOrder.shipping_address?.country}</p>
                  </div>
                </div>
              </div>
              
              {/* Order Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Order Status</h3>
                <select
                  value={viewingOrder.status}
                  onChange={(e) => updateOrderStatus(viewingOrder.id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.product?.images?.[0] || 'https://via.placeholder.com/80'}
                        alt={item.product?.name || 'Product'}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product?.name || 'Product'}</h4>
                        <p className="text-sm text-gray-600">
                          Size: {item.size || 'N/A'} | Color: {item.color || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${item.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          Total: ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      ${(viewingOrder.total_amount - (viewingOrder.discount_amount || 0)).toFixed(2)}
                    </span>
                  </div>
                  {viewingOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-medium">-${viewingOrder.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {viewingOrder.voucher_code && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Voucher Code:</span>
                      <span className="font-mono">{viewingOrder.voucher_code}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-teal-600">${viewingOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowOrderDetailModal(false);
                    setViewingOrder(null);
                    setOrderItems([]);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {viewingOrder.status !== 'cancelled' && viewingOrder.status !== 'delivered' && (
                  <button
                    onClick={() => handleCancelOrder(viewingOrder.id)}
                    className="flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
