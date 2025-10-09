import { useState, useEffect, useRef } from 'react';
import { CreditCard, MapPin, Truck, CheckCircle, Package, LogIn, ChevronUp, ChevronDown } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';

// Type definition for Address
interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
  created_at?: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });
  
  // State cho thông tin đơn hàng
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0
  });
  
  // State cho danh sách địa chỉ đã lưu
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [saveAddressOption, setSaveAddressOption] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to apply selected address to input form
  const applySelectedAddress = (addressId: string) => {
    const selectedAddress = savedAddresses.find(address => address.id === addressId);
    
    if (selectedAddress) {
      setShippingInfo({
        fullName: selectedAddress.full_name,
        email: user?.email || '',
        phone: selectedAddress.phone,
        address: selectedAddress.address_line1,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postal_code,
      });
      
      setSelectedAddressId(addressId);
      
      // Show notification when address is selected
      showToast('Shipping address applied', 'success');
    }
  };

  // Load thông tin từ localStorage khi component mount
  useEffect(() => {
    // Nếu đang loading auth, chưa làm gì
    if (authLoading) {
      return;
    }
    
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!user) {
      // Redirect to login page with a return URL
      navigate('/login?returnUrl=/checkout');
      return;
    }
    
    // Nếu không có cartItems, điều hướng về trang giỏ hàng
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    
    // Định nghĩa hàm lấy địa chỉ trong useEffect để tránh warning
    const loadSavedAddresses = async () => {
      if (!user) return;
      
      try {
        setLoadingAddresses(true);
        
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });
        
        if (error) {
          console.error('Error fetching saved addresses:', error);
          return;
        }
        
        if (data) {
          setSavedAddresses(data);
          
          // Nếu có địa chỉ mặc định, chọn nó
          const defaultAddress = data.find(address => address.is_default);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            
            // Cập nhật form với địa chỉ mặc định
            setShippingInfo({
              fullName: defaultAddress.full_name,
              email: user.email || '',
              phone: defaultAddress.phone,
              address: defaultAddress.address_line1,
              city: defaultAddress.city,
              state: defaultAddress.state,
              postalCode: defaultAddress.postal_code,
            });
          }
        }
      } catch (error) {
        console.error('Error in fetchSavedAddresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };
    
    // Lấy địa chỉ đã lưu của người dùng
    loadSavedAddresses();
    
    // Load thông tin giao hàng
    const savedShippingInfo = localStorage.getItem('shippingInfo');
    if (savedShippingInfo) {
      try {
        const parsedInfo = JSON.parse(savedShippingInfo);
        setShippingInfo(parsedInfo);
      } catch (error) {
        console.error('Failed to parse saved shipping info:', error);
      }
    }
    
    // Load thông tin đơn hàng
    const savedOrderSummary = localStorage.getItem('orderSummary');
    if (savedOrderSummary) {
      try {
        const parsedSummary = JSON.parse(savedOrderSummary);
        setOrderSummary(parsedSummary);
      } catch (error) {
        console.error('Failed to parse order summary:', error);
      }
    }
    
    // Load applied voucher from localStorage
    const storedVoucher = localStorage.getItem('activeVoucher');
    if (storedVoucher) {
      setAppliedVoucher(storedVoucher);
    }
  }, [navigate, cartItems, user, authLoading]);
  
  // Xử lý click bên ngoài dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const steps = [
    { number: 1, title: 'Shipping', icon: MapPin },
    { number: 2, title: 'Delivery', icon: Truck },
    { number: 3, title: 'Payment', icon: CreditCard },
    { number: 4, title: 'Review', icon: CheckCircle },
  ];

  // Sử dụng orderSummary từ localStorage hoặc tính toán lại nếu cần
  const { subtotal, shipping, discount, total } = orderSummary;
  
  // Tính thuế dựa trên subtotal (10%)
  const tax = subtotal * 0.1;
  
  // Function to handle order placement
  const handlePlaceOrder = async () => {
    // Show processing notification
    showToast('Đang xử lý đơn hàng...', 'info');
    
    // Generate a random order ID
    const newOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Create order object
    const order = {
      id: newOrderId,
      date: new Date().toISOString(),
      status: 'processing',
      total: total,
      items: cartItems.map(item => ({
        id: item.id,
        product_name: item.product?.name || 'Product',
        quantity: item.quantity,
        price: (item.product?.sale_price || item.product?.base_price || 0) + (item.variant?.price_adjustment || 0),
        image_url: item.product?.images?.[0] || 'https://via.placeholder.com/100',
        variant: item.variant
      })),
      shipping_address: {
        fullName: shippingInfo.fullName,
        address: shippingInfo.address,
        city: shippingInfo.city,
        postalCode: shippingInfo.postalCode,
        phone: shippingInfo.phone
      }
    };
    
    // Save order to localStorage with a slight delay to simulate processing
    setTimeout(() => {
      try {
        // Get existing orders or initialize empty array
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        existingOrders.push(order);
        localStorage.setItem('orders', JSON.stringify(existingOrders));
        
        // Update orders list
        const ordersList = JSON.parse(localStorage.getItem('ordersList') || '[]');
        ordersList.push({
          id: newOrderId,
          date: new Date().toISOString(),
          status: 'processing',
          total: total,
          items_count: cartItems.length
        });
        localStorage.setItem('ordersList', JSON.stringify(ordersList));
        
        // Set order as complete and store the ID
        setOrderId(newOrderId);
        setOrderComplete(true);
        
        // Clear the cart
        clearCart();
        
        // Remove checkout data from localStorage
        localStorage.removeItem('shippingInfo');
        localStorage.removeItem('orderSummary');
        
        // Show success notification
        showToast('Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại BTN Clothes.', 'success');
      } catch (error) {
        console.error('Failed to save order:', error);
        showToast('Đã xảy ra lỗi khi xử lý đơn hàng. Vui lòng thử lại.', 'error');
      }
    }, 1000);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="text-green-500" size={40} />
            </div>
            
            <h1 className="text-3xl font-serif mb-4">Order Successful!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for shopping with BTN Clothes. Your order has been received and is now being processed.
            </p>
            
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 text-lg font-medium">
                <span className="text-gray-600">Order Number:</span>
                <span className="text-teal-600">{orderId}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to={`/order/${orderId}`}
                className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
              >
                View Order Details
              </Link>
              <Link 
                to="/shop"
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-serif mb-8 text-center">Checkout</h1>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isActive
                          ? 'bg-teal-500 text-white scale-110'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? <CheckCircle size={24} /> : <Icon size={24} />}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-all ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-serif mb-6">Shipping Information</h2>
                  
                  {/* Saved addresses as combobox */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">Select delivery address</h3>
                      
                      <div className="relative mb-6" ref={dropdownRef}>
                        <div 
                          className="w-full flex justify-between items-center px-4 py-3 border border-gray-300 rounded-lg cursor-pointer"
                          onClick={() => setDropdownOpen(prev => !prev)}
                        >
                          {selectedAddressId ? (
                            <div>
                              {(() => {
                                const selected = savedAddresses.find(a => a.id === selectedAddressId);
                                return selected ? (
                                  <div>
                                    <p className="font-medium">{selected.full_name}</p>
                                    <p className="text-sm text-gray-600">
                                      {selected.address_line1}, {selected.city}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Phone: {selected.phone}
                                    </p>
                                  </div>
                                ) : "Select address";
                              })()}
                            </div>
                          ) : (
                            <span className="text-gray-500">Select address</span>
                          )}
                          
                          {dropdownOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                        
                        {/* Dropdown menu */}
                        {dropdownOpen && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                            {savedAddresses.map(address => (
                              <div 
                                key={address.id} 
                                className={`p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer
                                  ${selectedAddressId === address.id ? 'bg-teal-50' : ''}`}
                                onClick={() => {
                                  applySelectedAddress(address.id);
                                  setDropdownOpen(false);
                                }}
                              >
                                <div className="flex justify-between">
                                  <div>
                                    <p className="font-medium">
                                      {address.full_name}
                                      {address.is_default && (
                                        <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                          Default
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-sm text-gray-600">{address.phone}</p>
                                    <p className="text-sm text-gray-600">
                                      {address.address_line1}, {address.city}, {address.state} {address.postal_code}
                                    </p>
                                  </div>
                                  {selectedAddressId === address.id && (
                                    <div className="text-teal-500 flex items-center">
                                      <CheckCircle size={16} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            
                            {/* Add new address option */}
                            <div className="p-3 text-center border-t">
                              <button 
                                type="button"
                                className="text-teal-600 hover:underline text-sm font-medium"
                                onClick={() => {
                                  setSelectedAddressId(null);
                                  setShippingInfo({
                                    fullName: '',
                                    email: user?.email || '',
                                    phone: '',
                                    address: '',
                                    city: '',
                                    state: '',
                                    postalCode: '',
                                  });
                                  setDropdownOpen(false);
                                }}
                              >
                                + Add new address
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {!selectedAddressId && (
                        <h3 className="text-lg font-medium mb-4">Enter new address</h3>
                      )}
                    </div>
                  )}
                  
                  {/* Shipping information form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="example@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Address</label>
                      <input
                        type="text"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="123 Main St"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State/Province</label>
                      <input
                        type="text"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Postal Code</label>
                      <input
                        type="text"
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="10001"
                      />
                    </div>
                    
                    {/* Option to save this address */}
                    {user && selectedAddressId === null && (
                      <div className="md:col-span-2 flex items-center mt-4">
                        <input
                          type="checkbox"
                          id="save_address"
                          checked={saveAddressOption}
                          onChange={(e) => setSaveAddressOption(e.target.checked)}
                          className="mr-2 h-4 w-4 text-teal-500 focus:ring-teal-500"
                        />
                        <label htmlFor="save_address" className="text-sm text-gray-600">
                          Save this address for future orders
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-serif mb-6">Delivery Method</h2>
                  <div className="space-y-4">
                    {[
                      { name: 'Standard Delivery', time: '5-7 business days', price: 10 },
                      { name: 'Express Delivery', time: '2-3 business days', price: 20 },
                      { name: 'Next Day Delivery', time: '1 business day', price: 35 },
                    ].map((method, index) => (
                      <label
                        key={index}
                        className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <input type="radio" name="delivery" defaultChecked={index === 0} />
                          <div>
                            <p className="font-semibold">{method.name}</p>
                            <p className="text-sm text-gray-600">{method.time}</p>
                          </div>
                        </div>
                        <span className="font-bold">${method.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-serif mb-6">Payment Method</h2>
                  <div className="space-y-4">
                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="credit_card"
                        checked={paymentMethod === 'credit_card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-4" 
                      />
                      <div className="flex items-center gap-3">
                        <CreditCard size={24} />
                        <span className="font-semibold">Credit/Debit Card</span>
                      </div>
                    </label>

                    <div className="pl-12 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-4" 
                      />
                      <span className="font-semibold">PayPal</span>
                    </label>

                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="cash_on_delivery"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-4" 
                      />
                      <span className="font-semibold">Cash on Delivery</span>
                    </label>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h2 className="text-2xl font-serif mb-6">Review Your Order</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Shipping Address</h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium">{shippingInfo.fullName || 'John Doe'}</p>
                        <p className="text-gray-600">{shippingInfo.address || '123 Main St'}</p>
                        <p className="text-gray-600">
                          {shippingInfo.city || 'New York'}, {shippingInfo.state || 'NY'}{' '}
                          {shippingInfo.postalCode || '10001'}
                        </p>
                        <p className="text-gray-600">{shippingInfo.phone || '+1 234 567 890'}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Order Items</h3>
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between py-3 border-b">
                          <div>
                            <p className="font-medium">{item.product?.name || 'Product'}</p>
                            <p className="text-sm text-gray-600">
                              {item.variant?.size || 'One Size'} / {item.variant?.color || 'Default'} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold">
                            ${(((item.product?.sale_price || item.product?.base_price || 0) + 
                              (item.variant?.price_adjustment || 0)) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => {
                    if (currentStep < 4) {
                      setCurrentStep(currentStep + 1);
                    } else if (currentStep === 4) {
                      handlePlaceOrder();
                    }
                  }}
                  className="ml-auto px-8 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                >
                  {currentStep === 4 ? 'Place Order' : 'Continue'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-serif mb-6">Order Summary</h3>

              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product?.name || 'Product'} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ${(((item.product?.sale_price || item.product?.base_price || 0) + 
                        (item.variant?.price_adjustment || 0)) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-3 border-t">
                  <span>Total</span>
                  <span className="text-teal-500">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle size={16} />
                  Free shipping on this order
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
