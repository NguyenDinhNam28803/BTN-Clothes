import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';
import { 
  Eye, 
  Loader, 
  Calendar, 
  User, 
  MapPin, 
  CreditCard, 
  ShoppingBag,
  CheckCircle,
  Clock,
  Truck,
  Package,
  XCircle
} from 'lucide-react';

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status, updated_at: new Date().toISOString() } 
          : order
      ));

      // If we're updating the current order in the modal, update that too
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder({ 
          ...currentOrder, 
          status, 
          updated_at: new Date().toISOString() 
        });
      }

    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={18} />;
      case 'processing':
        return <Package className="text-blue-500" size={18} />;
      case 'shipped':
        return <Truck className="text-purple-500" size={18} />;
      case 'delivered':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={18} />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'shipped':
        return 'bg-purple-100 text-purple-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const openDetailsModal = (order: Order) => {
    setCurrentOrder(order);
    setShowDetailsModal(true);
    fetchOrderItems(order.id);
  };

  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderItemsLoading, setOrderItemsLoading] = useState(false);

  const fetchOrderItems = async (orderId: string) => {
    setOrderItemsLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(name, images),
          variant:product_variants(size, color)
        `)
        .eq('order_id', orderId);

      if (error) {
        throw error;
      }

      setOrderItems(data || []);
    } catch (error) {
      console.error('Error fetching order items:', error);
    } finally {
      setOrderItemsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_address.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Management</h1>
        <p className="text-gray-600">View and manage customer orders</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex gap-4 mb-6 flex-wrap md:flex-nowrap">
          <input
            type="text"
            placeholder="Search by order number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin text-teal-500" size={36} />
          </div>
        ) : (
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
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{order.order_number}</td>
                      <td className="py-3 px-4">{order.shipping_address.full_name}</td>
                      <td className="py-3 px-4">{formatDate(order.created_at)}</td>
                      <td className="py-3 px-4 font-semibold">{formatCurrency(order.total_amount)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order.status)}`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openDetailsModal(order)}
                          className="text-teal-500 hover:text-teal-600 font-medium flex items-center gap-1"
                          aria-label="View order details"
                        >
                          <Eye size={18} /> 
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Order {currentOrder.order_number}</h2>
                <p className="text-gray-500">{formatDate(currentOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-gray-700">
                  <User size={18} />
                  <h3 className="font-semibold">Customer</h3>
                </div>
                <p className="text-gray-800 font-medium">{currentOrder.shipping_address.full_name}</p>
                <p className="text-gray-600">{currentOrder.shipping_address.phone}</p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-gray-700">
                  <MapPin size={18} />
                  <h3 className="font-semibold">Shipping Address</h3>
                </div>
                <p className="text-gray-800">{currentOrder.shipping_address.address_line1}</p>
                {currentOrder.shipping_address.address_line2 && (
                  <p className="text-gray-800">{currentOrder.shipping_address.address_line2}</p>
                )}
                <p className="text-gray-800">
                  {currentOrder.shipping_address.city}, {currentOrder.shipping_address.state} {currentOrder.shipping_address.postal_code}
                </p>
                <p className="text-gray-600">{currentOrder.shipping_address.country}</p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-gray-700">
                  <CreditCard size={18} />
                  <h3 className="font-semibold">Payment</h3>
                </div>
                <p className="text-gray-800 capitalize">{currentOrder.payment_method}</p>
                <p className="text-gray-600 capitalize">{currentOrder.payment_status}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Order Status</h3>
              <div className="flex items-center gap-3">
                <select
                  value={currentOrder.status}
                  onChange={(e) => updateOrderStatus(currentOrder.id, e.target.value as Order['status'])}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(currentOrder.status)}`}
                >
                  {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Order Items</h3>
              {orderItemsLoading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader className="animate-spin text-teal-500" size={24} />
                </div>
              ) : orderItems.length === 0 ? (
                <p className="text-gray-500 italic">No items found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-sm font-semibold">Product</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold">Variant</th>
                        <th className="text-center py-2 px-3 text-sm font-semibold">Quantity</th>
                        <th className="text-right py-2 px-3 text-sm font-semibold">Price</th>
                        <th className="text-right py-2 px-3 text-sm font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              {item.product.images && item.product.images[0] ? (
                                <img 
                                  src={item.product.images[0]} 
                                  alt={item.product.name}
                                  className="w-10 h-10 object-cover rounded-md"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                  <ShoppingBag size={16} className="text-gray-400" />
                                </div>
                              )}
                              <span>{item.product.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {item.variant ? `${item.variant.size} / ${item.variant.color}` : 'N/A'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="py-3 px-3 text-right font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(currentOrder.total_amount - currentOrder.discount_amount)}</span>
              </div>
              {currentOrder.discount_amount > 0 && (
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Discount {currentOrder.voucher_code && `(${currentOrder.voucher_code})`}</span>
                  <span className="text-green-500">-{formatCurrency(currentOrder.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between mt-2 text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(currentOrder.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}