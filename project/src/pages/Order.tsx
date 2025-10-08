import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Truck, Clock, Package, ArrowLeft } from 'lucide-react';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';

// Define order status types
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Define Order interface
interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url: string;
  variant?: {
    color?: string;
    size?: string;
  };
}

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  shipping_address: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  tracking_number?: string;
  estimated_delivery?: string;
}

export default function Order() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      setLoading(true);
      
      try {
        // First, get order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq(orderId.startsWith('ORD-') ? 'order_number' : 'id', orderId)
          .single();
        
        if (orderError || !orderData) {
          throw new Error('Order not found');
        }
        
        // Define an interface for the query response
        interface OrderItemQueryResult {
          id: string;
          quantity: number;
          price: number;
          product: {
            name: string;
            images: string[];
          };
          variant: {
            color: string;
            size: string;
          };
        }
        
        // Then get order items
        const { data: orderItemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            quantity,
            price,
            product:product_id (
              name,
              images
            ),
            variant:variant_id (
              color,
              size
            )
          `)
          .eq('order_id', orderData.id);
          
        if (itemsError) {
          throw itemsError;
        }
        
        // Format the order items
        const items: OrderItem[] = orderItemsData.map(item => {
          // Cast to any to handle the nested objects from Supabase
          const typedItem = item as any;
          
          return {
            id: typedItem.id,
            product_name: typedItem.product?.name || 'Product',
            quantity: typedItem.quantity,
            price: typedItem.price,
            image_url: typedItem.product?.images?.[0] || 'https://via.placeholder.com/100',
            variant: {
              color: typedItem.variant?.color || 'Default',
              size: typedItem.variant?.size || 'One Size'
            }
          };
        });
        
        // Create complete order object
        const completeOrder: Order = {
          id: orderData.order_number || orderData.id,
          date: orderData.created_at,
          status: orderData.status as OrderStatus,
          total: orderData.total_amount,
          items: items,
          shipping_address: orderData.shipping_address || {
            fullName: 'N/A',
            address: 'N/A',
            city: 'N/A',
            postalCode: 'N/A',
            phone: 'N/A'
          },
          tracking_number: orderData.tracking_number,
          estimated_delivery: orderData.estimated_delivery
        };
        
        setOrder(completeOrder);
        
        showToast(`Đơn hàng #${completeOrder.id} đang ${completeOrder.status === 'processing' 
          ? 'được xử lý' 
          : completeOrder.status === 'shipped' 
          ? 'vận chuyển' 
          : completeOrder.status === 'delivered' 
          ? 'đã giao' 
          : 'đã hủy'}`, 'info');
          
      } catch (error) {
        console.error('Error fetching order:', error);
        showToast('Không tìm thấy đơn hàng hoặc có lỗi xảy ra', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, showToast]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'processing':
        return <Clock className="text-blue-500" size={24} />;
      case 'shipped':
        return <Truck className="text-teal-500" size={24} />;
      case 'delivered':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'cancelled':
        return <Package className="text-red-500" size={24} />;
      default:
        return <Clock className="text-gray-500" size={24} />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'processing':
        return 'Order Processing';
      case 'shipped':
        return 'Order Shipped';
      case 'delivered':
        return 'Order Delivered';
      case 'cancelled':
        return 'Order Cancelled';
      default:
        return 'Order Placed';
    }
  };

  const getStatusDescription = (status: OrderStatus) => {
    switch (status) {
      case 'processing':
        return 'We are preparing your order for shipment.';
      case 'shipped':
        return 'Your order is on its way to you.';
      case 'delivered':
        return 'Your order has been delivered successfully.';
      case 'cancelled':
        return 'This order has been cancelled.';
      default:
        return 'Your order has been received.';
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

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
        <Link to="/" className="flex items-center gap-2 text-teal-600 hover:text-teal-800">
          <ArrowLeft size={16} />
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Details</h1>
          <Link to="/account" className="flex items-center gap-2 text-teal-600 hover:text-teal-800 text-sm">
            <ArrowLeft size={16} />
            Back to Account
          </Link>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Order #{order.id}</h2>
                <p className="text-gray-500 text-sm">Placed on {formatDate(order.date)}</p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center">
                {getStatusIcon(order.status)}
                <span className="ml-2 font-medium text-gray-700">{getStatusText(order.status)}</span>
              </div>
            </div>
            <p className="text-gray-600">{getStatusDescription(order.status)}</p>
          </div>
          
          {order.status === 'shipped' && order.tracking_number && (
            <div className="bg-teal-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center">
                  <Truck className="text-teal-600" size={18} />
                  <span className="ml-2 text-sm text-teal-800">Tracking Number: <span className="font-medium">{order.tracking_number}</span></span>
                </div>
                {order.estimated_delivery && (
                  <span className="text-sm text-teal-800">
                    Estimated Delivery: <span className="font-medium">{formatDate(order.estimated_delivery)}</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Items in Your Order</h2>
            
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start py-4 border-b border-gray-100 last:border-0">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img 
                    src={item.image_url} 
                    alt={item.product_name}
                    className="h-full w-full object-cover object-center" 
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-base font-medium text-gray-900">{item.product_name}</h3>
                  {item.variant && (
                    <p className="mt-1 text-sm text-gray-500">
                      {item.variant.color && <span>Color: {item.variant.color}</span>}
                      {item.variant.color && item.variant.size && <span> / </span>}
                      {item.variant.size && <span>Size: {item.variant.size}</span>}
                    </p>
                  )}
                  <div className="mt-2 flex justify-between">
                    <p className="text-sm font-medium text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 p-6">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Subtotal</p>
              <p>${order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        {/* Shipping Information */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Shipping Address</h2>
            <address className="not-italic text-gray-600">
              <p className="font-medium text-gray-800">{order.shipping_address.fullName}</p>
              <p>{order.shipping_address.address}</p>
              <p>{order.shipping_address.city}, {order.shipping_address.postalCode}</p>
              <p className="mt-2">Phone: {order.shipping_address.phone}</p>
            </address>
          </div>
        </div>
        
        {/* Need Help */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Need Help?</h2>
            <p className="text-gray-600 mb-4">If you have any questions about your order, please contact our customer service.</p>
            <Link 
              to="/contact" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}