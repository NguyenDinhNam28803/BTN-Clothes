import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Star,
  Settings,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Order } from '../types';
import { useToast } from '../components/Toast';
import SettingsTabs from '../components/admin/SettingsTabs';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { showToast } = useToast();
  
  // State for data
  const [products, setProducts] = useState<Product[]>([]);
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
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
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
  
  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
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
      
      showToast('Order status updated', 'success');
      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      showToast('Failed to update order status', 'error');
    }
  };
  
  const getProductStatus = (product: Product) => {
    // This would need to check variants stock
    if (product.status === 'inactive') return 'Inactive';
    // Simplified - in real app would check total stock from variants
    return 'Active';
  };
  
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
                <button className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors">
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
                            <td className="py-3 px-4">Category</td>
                            <td className="py-3 px-4 font-semibold">${(product.sale_price || product.base_price).toFixed(2)}</td>
                            <td className="py-3 px-4">-</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  product.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button className="text-blue-500 hover:text-blue-600 font-medium">
                                  Edit
                                </button>
                                <button className="text-red-500 hover:text-red-600 font-medium">
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
                              <button className="text-teal-500 hover:text-teal-600 font-medium">
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
    </div>
  );
}
