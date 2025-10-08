import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Eye, Loader, ShoppingBag, MapPin, Mail, Phone, Search } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  created_at: string;
  email?: string;
}

interface CustomerOrder {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export default function CustomerManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Profile | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [customerAddresses, setCustomerAddresses] = useState<Address[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Fetch profiles on component mount
  useEffect(() => {
    fetchProfiles();
    // Return cleanup function to cancel any pending requests when component unmounts
    return () => {
      setProfiles([]);
      setCustomerOrders([]);
      setCustomerAddresses([]);
    };
  }, []);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        throw profilesError;
      }

      // Get emails from auth.users table (if you have admin access)
      const { data: authData, error: authError } = await supabase
        .from('users')
        .select('id, email');

      if (authError) {
        console.error('Error fetching user emails:', authError);
        // Continue without emails
        setProfiles(profilesData || []);
      } else {
        // Combine profile data with email information
        const profilesWithEmail = profilesData?.map(profile => {
          const user = authData?.find(user => user.id === profile.id);
          return {
            ...profile,
            email: user?.email
          };
        });
        
        setProfiles(profilesWithEmail || []);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerOrders = async (userId: string) => {
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCustomerOrders(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchCustomerAddresses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) {
        throw error;
      }

      setCustomerAddresses(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching customer addresses:', error);
      return [];
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

  const openCustomerDetails = (customer: Profile) => {
    setCurrentCustomer(customer);
    setShowDetailsModal(true);
    // Fetch customer data in parallel for better performance
    Promise.all([
      fetchCustomerOrders(customer.id),
      fetchCustomerAddresses(customer.id)
    ]).catch(error => {
      console.error('Error fetching customer details:', error);
    });
  };

  const getStatusBadgeClass = (status: string) => {
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

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(profile => {
    if (!searchTerm.trim()) return true;
    
    return (
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.phone?.includes(searchTerm)
    );
  });

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Customer Management</h1>
        <p className="text-gray-600">View and manage customer information</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Search customers"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
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
                  <th className="text-left py-3 px-4 font-semibold">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold">Joined On</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((profile) => (
                    <tr key={profile.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        <div className="flex items-center gap-2">
                          {profile.avatar_url ? (
                            <img 
                              src={profile.avatar_url} 
                              alt={profile.full_name} 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User size={16} className="text-gray-400" />
                            </div>
                          )}
                          {profile.full_name || 'Unnamed Customer'}
                        </div>
                      </td>
                      <td className="py-3 px-4">{profile.email || 'N/A'}</td>
                      <td className="py-3 px-4">{profile.phone || 'N/A'}</td>
                      <td className="py-3 px-4">{formatDate(profile.created_at)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openCustomerDetails(profile)}
                          className="text-teal-500 hover:text-teal-600 font-medium flex items-center gap-1"
                          aria-label="View customer details"
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

      {/* Customer Details Modal */}
      {showDetailsModal && currentCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                {currentCustomer.avatar_url ? (
                  <img 
                    src={currentCustomer.avatar_url} 
                    alt={currentCustomer.full_name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <User size={24} className="text-teal-600" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{currentCustomer.full_name || 'Unnamed Customer'}</h2>
                  <p className="text-gray-500">Member since {formatDate(currentCustomer.created_at)}</p>
                </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-gray-500" />
                    <span>{currentCustomer.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-gray-500" />
                    <span>{currentCustomer.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Account Summary</h3>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-1 mx-auto">
                      <ShoppingBag size={18} className="text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-500">Orders</p>
                    <p className="font-semibold">{customerOrders.length}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-1 mx-auto">
                      <MapPin size={18} className="text-green-600" />
                    </div>
                    <p className="text-sm text-gray-500">Addresses</p>
                    <p className="font-semibold">{customerAddresses.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Customer Addresses</h3>
              {customerAddresses.length === 0 ? (
                <p className="text-gray-500 italic">No addresses found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customerAddresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4">
                      {address.is_default && (
                        <span className="inline-block px-2 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded mb-2">
                          Default
                        </span>
                      )}
                      <p className="font-medium">{address.full_name}</p>
                      <p>{address.phone}</p>
                      <p>{address.address_line1}</p>
                      {address.address_line2 && <p>{address.address_line2}</p>}
                      <p>{address.city}, {address.state} {address.postal_code}</p>
                      <p>{address.country}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Order History</h3>
              {ordersLoading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader className="animate-spin text-teal-500" size={24} />
                </div>
              ) : customerOrders.length === 0 ? (
                <p className="text-gray-500 italic">No orders found</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 text-sm font-semibold">Order #</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold">Date</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold">Status</th>
                      <th className="text-right py-2 px-3 text-sm font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-3 font-medium">{order.order_number}</td>
                        <td className="py-3 px-3">{formatDate(order.created_at)}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order.status)}`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold">
                          {formatCurrency(order.total_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}