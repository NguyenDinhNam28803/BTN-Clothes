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
import { Product, Order, Category } from '../types';
import { useToast } from '../components/Toast';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { showToast } = useToast();
  
  // State for data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'vouchers', label: 'Vouchers', icon: Tag },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const statsDisplay = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, change: '+12.5%', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), change: '+8.2%', icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Total Customers', value: stats.totalCustomers.toString(), change: '+15.3%', icon: Users, color: 'bg-purple-500' },
    { label: 'Low Stock Items', value: stats.lowStockItems.toString(), change: '-3', icon: AlertCircle, color: 'bg-red-500' },
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
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-gray-600">Welcome back to your store</p>
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
                  <h3 className="text-xl font-semibold mb-4">Sales Overview</h3>
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
                  <h3 className="text-xl font-semibold mb-4">Top Categories</h3>
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
                  <h3 className="text-xl font-semibold">Recent Orders</h3>
                  <button className="text-teal-500 hover:text-teal-600 font-medium">
                    View All →
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-2">Delete Product</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <strong>{deletingProduct.name}</strong>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingProduct(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
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
