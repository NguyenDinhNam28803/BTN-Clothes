import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, CreditCard, Heart, Tag, Star, Bell, LogOut, Clock, Truck, CheckCircle, X, Plus, Edit2, Trash2, ShoppingCart, Loader2, ArrowRight, Calendar, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { Address, Voucher } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';

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

export default function Account() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const { items: wishlistItems, loading: loadingWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  // Orders state
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Vouchers state
  const [userVouchers, setUserVouchers] = useState<Voucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  
  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressFormData, setAddressFormData] = useState<Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    address_type: 'Home',
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false
  });
  
  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login?returnUrl=/account');
    }
  }, [user, navigate]);
  
  // Load orders when the orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      setLoadingOrders(true);
      
      // Simulate API delay
      setTimeout(() => {
        // Check if we have stored orders in localStorage
        const savedOrders = localStorage.getItem('ordersList');
        
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        } else {
          // Set empty array if no orders
          setOrders([]);
        }
        
        setLoadingOrders(false);
      }, 600);
    }
  }, [activeTab]);
  
  // Load addresses when the addresses tab is active
  useEffect(() => {
    if (activeTab === 'addresses') {
      setLoadingAddresses(true);
      
      // Simulate API delay
      setTimeout(() => {
        // Check if we have stored addresses in localStorage
        const savedAddresses = localStorage.getItem('addressesList');
        
        if (savedAddresses) {
          setAddresses(JSON.parse(savedAddresses));
        } else {
          // Create an empty addresses array
          const defaultAddresses: Address[] = [];
          setAddresses(defaultAddresses);
          
          // Save to localStorage for persistence
          localStorage.setItem('addressesList', JSON.stringify(defaultAddresses));
        }
        
        setLoadingAddresses(false);
      }, 600);
    }
    
    // Load vouchers when the vouchers tab is active
    if (activeTab === 'vouchers') {
      setLoadingVouchers(true);
      
      // Simulate API delay
      setTimeout(() => {
        // Get collected vouchers from localStorage
        const collectedVouchersIds = localStorage.getItem('collectedVouchers');
        const voucherIds = collectedVouchersIds ? JSON.parse(collectedVouchersIds) : [];
        
        // Sample vouchers data - in a real app, this would come from an API
        const sampleVouchers: Voucher[] = [
          {
            id: "1",
            code: "WELCOME20",
            description: "20% off your first order",
            discount_type: "percentage",
            discount_value: 20,
            min_order_value: 50,
            max_uses: 1,
            used_count: 0,
            valid_from: "2025-01-01",
            valid_until: "2025-12-31",
            is_active: true,
            created_at: "2025-01-01"
          },
          {
            id: "2",
            code: "FREESHIP",
            description: "Free shipping on orders over $30",
            discount_type: "fixed",
            discount_value: 10,
            min_order_value: 30,
            max_uses: 3,
            used_count: 0,
            valid_from: "2025-01-01",
            valid_until: "2025-11-30",
            is_active: true,
            created_at: "2025-01-01"
          },
          {
            id: "3",
            code: "SUMMER25",
            description: "25% off summer collection",
            discount_type: "percentage",
            discount_value: 25,
            min_order_value: 100,
            max_uses: 2,
            used_count: 0,
            valid_from: "2025-06-01",
            valid_until: "2025-08-31",
            is_active: true,
            created_at: "2025-06-01"
          }
        ];
        
        // Filter to only include vouchers that have been collected
        // For demo purposes, we'll show all vouchers as collected
        setUserVouchers(sampleVouchers);
        setLoadingVouchers(false);
      }, 600);
    }
  }, [activeTab, user]);
  
  // Function to add a new address
  const handleAddAddress = () => {
    // Reset form and enable add mode
    setAddressFormData({
      address_type: 'Home',
      full_name: user?.user_metadata?.full_name || '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      is_default: false
    });
    setEditingAddress(null);
    setIsAddingAddress(true);
  };
  
  // Function to start editing an address
  const handleEditAddress = (address: Address) => {
    setAddressFormData({
      address_type: address.address_type,
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default
    });
    setEditingAddress(address);
    setIsAddingAddress(true);
  };
  
  // Function to delete an address
  const handleDeleteAddress = (addressId: string) => {
    // Find the address to be deleted for the toast message
    const addressToDelete = addresses.find(addr => addr.id === addressId);
    const newAddresses = addresses.filter(address => address.id !== addressId);
    
    // If we deleted the default address, make the first address the default (if any)
    if (newAddresses.length > 0 && !newAddresses.some(address => address.is_default)) {
      newAddresses[0].is_default = true;
    }
    
    setAddresses(newAddresses);
    localStorage.setItem('addressesList', JSON.stringify(newAddresses));
    
    // Show success toast
    showToast(`${addressToDelete?.address_type} address deleted successfully`, 'success');
  };
  
  // Function to set an address as default
  const handleSetDefaultAddress = (addressId: string) => {
    // Find the address being set as default for the toast message
    const defaultAddress = addresses.find(addr => addr.id === addressId);
    
    const newAddresses = addresses.map(address => ({
      ...address,
      is_default: address.id === addressId
    }));
    
    setAddresses(newAddresses);
    localStorage.setItem('addressesList', JSON.stringify(newAddresses));
    
    // Show success toast
    showToast(`${defaultAddress?.address_type} address set as default`, 'success');
  };
  
  // Function to save address (create or update)
  const handleSaveAddress = () => {
    const now = new Date().toISOString();
    
    if (editingAddress) {
      // Update existing address
      const updatedAddresses = addresses.map(address => {
        if (address.id === editingAddress.id) {
          return {
            ...address,
            ...addressFormData,
            updated_at: now
          };
        }
        
        // If this is being set as default, remove default from others
        if (addressFormData.is_default && address.id !== editingAddress.id) {
          return { ...address, is_default: false };
        }
        
        return address;
      });
      
      setAddresses(updatedAddresses);
      localStorage.setItem('addressesList', JSON.stringify(updatedAddresses));
      
      // Show success toast
      showToast(`${addressFormData.address_type} address updated successfully`, 'success');
    } else {
      // Create new address
      const newAddress: Address = {
        id: uuidv4(),
        user_id: user?.id || 'anonymous',
        ...addressFormData,
        created_at: now,
        updated_at: now
      };
      
      let newAddresses: Address[];
      
      if (newAddress.is_default) {
        // If this is the default, remove default from others
        newAddresses = addresses.map(address => ({
          ...address,
          is_default: false
        }));
        newAddresses.push(newAddress);
      } else {
        // If this is the first address, make it default
        if (addresses.length === 0) {
          newAddress.is_default = true;
        }
        newAddresses = [...addresses, newAddress];
      }
      
      setAddresses(newAddresses);
      localStorage.setItem('addressesList', JSON.stringify(newAddresses));
      
      // Show success toast
      showToast(`${addressFormData.address_type} address added successfully`, 'success');
    }
    
    // Reset state
    setIsAddingAddress(false);
    setEditingAddress(null);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle checkbox separately
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setAddressFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setAddressFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'vouchers', label: 'My Vouchers', icon: Tag },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif mb-2">My Account</h1>
          <p className="text-gray-600">Manage your account and orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  JD
                </div>
                <h3 className="font-semibold text-lg">John Doe</h3>
                <p className="text-sm text-gray-600">john@example.com</p>
              </div>

              <div className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-teal-50 text-teal-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                <button 
                  onClick={() => {
                    signOut();
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-serif mb-6">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="john@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        defaultValue="+1 234 567 890"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date of Birth</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <button className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors">
                      Save Changes
                    </button>
                    <button className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif">My Orders</h2>
                    <Link 
                      to="/orders"
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                    >
                      View All Orders
                    </Link>
                  </div>
                  
                  {loadingOrders ? (
                    <div className="py-20 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading your orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-gray-300 rounded-lg">
                      <Package className="mx-auto mb-4 text-gray-400" size={48} />
                      <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                      <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                      <Link 
                        to="/shop" 
                        className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                      >
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <div>
                              <p className="font-semibold text-lg mb-1">Order #{order.id}</p>
                              <p className="text-sm text-gray-600">
                                Placed on {new Intl.DateTimeFormat('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                }).format(new Date(order.date))}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                              {order.status === 'processing' && (
                                <span className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 bg-blue-100 text-blue-700">
                                  <Clock size={16} />
                                  Processing
                                </span>
                              )}
                              {order.status === 'shipped' && (
                                <span className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 bg-teal-100 text-teal-700">
                                  <Truck size={16} />
                                  Shipped
                                </span>
                              )}
                              {order.status === 'delivered' && (
                                <span className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 bg-green-100 text-green-700">
                                  <CheckCircle size={16} />
                                  Delivered
                                </span>
                              )}
                              {order.status === 'cancelled' && (
                                <span className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 bg-red-100 text-red-700">
                                  <X size={16} />
                                  Cancelled
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-600">{order.items_count} items</p>
                              <p className="text-xl font-bold text-teal-500">${order.total.toFixed(2)}</p>
                            </div>
                            <div className="flex gap-3">
                              <Link 
                                to={`/order/${order.id}`} 
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                View Details
                              </Link>
                              {order.status === 'delivered' && (
                                <button className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                                  Reorder
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif">Saved Addresses</h2>
                    {!isAddingAddress && (
                      <button
                        onClick={handleAddAddress}
                        className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
                      >
                        <Plus size={20} />
                        Add New Address
                      </button>
                    )}
                  </div>

                  {loadingAddresses ? (
                    <div className="py-20 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading your addresses...</p>
                    </div>
                  ) : isAddingAddress ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                      <h3 className="text-xl font-semibold mb-4">
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium mb-2" htmlFor="address_type">Address Type</label>
                          <select
                            id="address_type"
                            name="address_type"
                            value={addressFormData.address_type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2" htmlFor="full_name">Full Name</label>
                          <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            placeholder="Enter full name"
                            value={addressFormData.full_name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2" htmlFor="phone">Phone Number</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="Enter phone number"
                            value={addressFormData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2" htmlFor="address_line1">Address Line 1</label>
                          <input
                            type="text"
                            id="address_line1"
                            name="address_line1"
                            placeholder="Street address, apartment, suite, etc"
                            value={addressFormData.address_line1}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2" htmlFor="address_line2">Address Line 2 (Optional)</label>
                          <input
                            type="text"
                            id="address_line2"
                            name="address_line2"
                            placeholder="Apartment, suite, unit, etc (optional)"
                            value={addressFormData.address_line2}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2" htmlFor="city">City</label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            placeholder="Enter city"
                            value={addressFormData.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2" htmlFor="state">State/Province</label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            placeholder="Enter state or province"
                            value={addressFormData.state}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2" htmlFor="postal_code">Postal/ZIP Code</label>
                          <input
                            type="text"
                            id="postal_code"
                            name="postal_code"
                            placeholder="Enter postal or ZIP code"
                            value={addressFormData.postal_code}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2" htmlFor="country">Country</label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            placeholder="Enter country"
                            value={addressFormData.country}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-6">
                        <input
                          type="checkbox"
                          id="is_default"
                          name="is_default"
                          checked={addressFormData.is_default}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-teal-600 bg-gray-100 rounded border-gray-300 focus:ring-teal-500"
                        />
                        <label htmlFor="is_default" className="ml-2 text-sm font-medium">
                          Set as default address
                        </label>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveAddress}
                          className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                        >
                          {editingAddress ? 'Update Address' : 'Save Address'}
                        </button>
                        <button
                          onClick={() => setIsAddingAddress(false)}
                          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-gray-300 rounded-lg">
                      <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
                      <h3 className="text-xl font-semibold mb-2">No saved addresses</h3>
                      <p className="text-gray-500 mb-6">Add your first address to get started</p>
                      <button
                        onClick={handleAddAddress}
                        className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <Plus size={20} />
                        Add New Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((address) => (
                        <div key={address.id} className="border border-gray-200 rounded-lg p-6 relative hover:shadow-lg transition-shadow">
                          {address.is_default && (
                            <span className="absolute top-4 right-4 px-3 py-1 bg-teal-100 text-teal-600 text-xs font-semibold rounded-full">
                              Default
                            </span>
                          )}
                          <h3 className="font-semibold text-lg mb-3">{address.address_type}</h3>
                          <p className="text-gray-600 mb-1">{address.full_name}</p>
                          <p className="text-gray-600 mb-1">{address.address_line1}</p>
                          {address.address_line2 && (
                            <p className="text-gray-600 mb-1">{address.address_line2}</p>
                          )}
                          <p className="text-gray-600 mb-1">{address.city}, {address.state} {address.postal_code}</p>
                          <p className="text-gray-600 mb-1">{address.country}</p>
                          <p className="text-gray-600 mb-4">{address.phone}</p>
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="flex items-center gap-1 text-teal-500 hover:text-teal-600 font-medium"
                            >
                              <Edit2 size={16} />
                              Edit
                            </button>
                            {!address.is_default && (
                              <>
                                <button
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                  className="flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium"
                                >
                                  Set as Default
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="flex items-center gap-1 text-red-500 hover:text-red-600 font-medium"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif">My Wishlist</h2>
                    <Link to="/shop" className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors">
                      Continue Shopping
                    </Link>
                  </div>

                  {loadingWishlist ? (
                    <div className="py-12 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-teal-500 mx-auto mb-4" />
                        <p className="text-xl text-gray-600">Loading your wishlist...</p>
                      </div>
                    </div>
                  ) : wishlistItems.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="text-6xl mb-4">💔</div>
                      <h3 className="text-2xl font-serif mb-4">Your wishlist is empty</h3>
                      <p className="text-gray-600 mb-8">Start adding your favorite items</p>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                      >
                        Start Shopping
                        <ArrowRight size={20} />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlistItems.map((item) => (
                        <div
                          key={item.id}
                          className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all"
                        >
                          <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                            <img
                              src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                              alt={item.product?.name || 'Product'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-red-50 hover:text-red-500 transition-colors"
                              aria-label="Remove from wishlist"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-1 group-hover:text-teal-500 transition-colors">
                              {item.product?.name || 'Product'}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="font-bold">
                                ${item.product?.sale_price || item.product?.base_price || 0}
                              </span>
                              {item.product?.sale_price && item.product?.base_price && item.product.sale_price < item.product.base_price && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${item.product.base_price}
                                </span>
                              )}
                            </div>

                            {item.product && item.product.status === 'active' ? (
                              <button 
                                onClick={() => {
                                  addToCart(item.product_id, 'default', 1);
                                  showToast('Added to cart', 'success');
                                }} 
                                className="w-full flex items-center justify-center gap-2 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                              >
                                <ShoppingCart size={16} />
                                Add to Cart
                              </button>
                            ) : (
                              <button className="w-full py-2 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed">
                                Out of Stock
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payment' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif">Payment Methods</h2>
                    <button className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors">
                      Add Card
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            VISA
                          </div>
                          <div>
                            <p className="font-semibold">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-600">Expires 12/25</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button className="text-teal-500 hover:text-teal-600 font-medium">
                            Edit
                          </button>
                          <button className="text-red-500 hover:text-red-600 font-medium">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'vouchers' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif">My Vouchers</h2>
                    <Link to="/vouchers" className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors">
                      Get More Vouchers
                    </Link>
                  </div>

                  {loadingVouchers ? (
                    <div className="py-12 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-teal-500 mx-auto mb-4" />
                        <p className="text-xl text-gray-600">Loading your vouchers...</p>
                      </div>
                    </div>
                  ) : userVouchers.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="text-6xl mb-4">🎟️</div>
                      <h3 className="text-2xl font-serif mb-4">No vouchers yet</h3>
                      <p className="text-gray-600 mb-8">Explore our vouchers and save on your next purchase</p>
                      <Link
                        to="/vouchers"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                      >
                        Browse Vouchers
                        <ArrowRight size={20} />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userVouchers.map((voucher) => (
                        <div
                          key={voucher.id}
                          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
                        >
                          <div className="flex flex-col md:flex-row">
                            <div className={`p-6 md:w-1/4 flex items-center justify-center bg-gradient-to-br ${
                              voucher.discount_type === 'percentage' ? 'from-teal-400 to-teal-600' : 'from-yellow-400 to-yellow-600'
                            }`}>
                              <div className="text-center text-white">
                                <p className="text-3xl font-bold">
                                  {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : `$${voucher.discount_value}`}
                                </p>
                                <p className="text-sm uppercase tracking-wider">
                                  {voucher.discount_type === 'percentage' ? 'Off' : 'Discount'}
                                </p>
                              </div>
                            </div>
                            <div className="p-6 md:w-3/4">
                              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                                <h3 className="font-semibold text-lg">{voucher.code}</h3>
                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-2 md:mt-0">
                                  <Calendar size={16} />
                                  <span>Valid until {new Date(voucher.valid_until).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <p className="text-gray-600 mb-4">{voucher.description}</p>
                              <div className="flex flex-wrap items-center gap-4">
                                <p className="text-sm text-gray-500">Min. purchase: ${voucher.min_order_value}</p>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(voucher.code);
                                    showToast('Voucher code copied to clipboard!', 'success');
                                  }}
                                  className="flex items-center gap-2 text-teal-500 hover:text-teal-600 font-medium"
                                >
                                  <Copy size={16} />
                                  Copy Code
                                </button>
                                <Link 
                                  to={`/shop?voucher=${voucher.code}`}
                                  className="px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 transition-colors"
                                >
                                  Use Now
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-serif mb-6">Notification Settings</h2>
                  <div className="space-y-6">
                    {[
                      { title: 'Order Updates', description: 'Get notified about your order status' },
                      { title: 'Promotions', description: 'Receive updates about sales and offers' },
                      { title: 'New Arrivals', description: 'Be the first to know about new products' },
                      { title: 'Price Drops', description: 'Get alerts when items in your wishlist go on sale' },
                    ].map((setting, index) => (
                      <div key={index} className="flex items-center justify-between py-4 border-b">
                        <div>
                          <p className="font-semibold">{setting.title}</p>
                          <p className="text-sm text-gray-600">{setting.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
