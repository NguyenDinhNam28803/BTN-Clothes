import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Package, ArrowRight, Clock, Truck, CheckCircle, X } from 'lucide-react';

// Define order status types
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Define interfaces for Order data
interface OrderSummary {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items_count: number;
}

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login?returnUrl=/orders');
      return;
    }
    
    const fetchOrders = async () => {
      setLoading(true);
      
      try {
        // Import supabase
        const { supabase } = await import('../lib/supabase');
        
        // Get all orders for this user
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching orders:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          setOrders([]);
          setLoading(false);
          return;
        }
        
        console.log('Fetched orders:', data.length);
        
        // Transform data to match OrderSummary type
        const orderSummaries: OrderSummary[] = data.map(order => ({
          id: order.order_number || order.id,
          date: order.created_at,
          status: order.status as OrderStatus,
          total: order.total_amount,
          items_count: 0 // We'll update this in the next step
        }));
        
        // Get all order items in one batch for better performance
        const orderIds = data.map(order => order.id);
        const { data: orderItemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('order_id, quantity')
          .in('order_id', orderIds);
          
        if (itemsError) {
          console.error('Error fetching order items:', itemsError);
        } else if (orderItemsData) {
          // Group items by order_id and count them
          const itemCountByOrderId = orderItemsData.reduce((acc, item) => {
            if (!acc[item.order_id]) {
              acc[item.order_id] = 0;
            }
            acc[item.order_id] += item.quantity || 1;
            return acc;
          }, {} as Record<string, number>);
          
          // Update item counts in our order summaries
          orderSummaries.forEach(order => {
            const orderId = data.find(o => o.order_number === order.id || o.id === order.id)?.id;
            if (orderId && itemCountByOrderId[orderId]) {
              order.items_count = itemCountByOrderId[orderId];
            }
          });
        }
        
        console.log('Processed order summaries:', orderSummaries);
        setOrders(orderSummaries);
      } catch (error) {
        console.error('Error loading orders:', error);
        
        // Fallback to localStorage if available
        const savedOrders = localStorage.getItem('ordersList');
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        } else {
          setOrders([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  // Function to get status icon
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'processing':
        return <Clock className="text-blue-500" size={18} />;
      case 'shipped':
        return <Truck className="text-teal-500" size={18} />;
      case 'delivered':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'cancelled':
        return <X className="text-red-500" size={18} />;
      default:
        return <Clock className="text-gray-500" size={18} />;
    }
  };

  // Function to get status text
  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Placed';
    }
  };

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-gray-500">You haven't placed any orders yet.</p>
            <div className="mt-6">
              <Link
                to="/shop"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <ul role="list" className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link to={`/order/${order.id}`} className="block hover:bg-gray-50">
                    <div className="px-6 py-5 flex items-center">
                      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <div className="flex text-sm">
                            <p className="font-medium text-teal-600 truncate">Order #{order.id}</p>
                            <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                              {order.items_count > 1 
                                ? `(${order.items_count} items)`
                                : `(${order.items_count} item)`}
                            </p>
                          </div>
                          <div className="mt-2">
                            <div className="flex">
                              <p className="text-sm text-gray-500">
                                Placed on <time dateTime={order.date}>{formatDate(order.date)}</time>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-5 flex flex-col items-end">
                          <div className="flex items-center gap-1 text-sm">
                            {getStatusIcon(order.status)}
                            <span className="font-medium text-gray-700">
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="mt-1 text-sm font-semibold text-gray-900">
                            ${order.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="ml-5 flex-shrink-0">
                        <ArrowRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}