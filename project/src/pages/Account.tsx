import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, CreditCard, Heart, Tag, Star, Bell, LogOut, Clock, Truck, CheckCircle, X, Plus, Edit2, Trash2, ShoppingCart, Loader2, ArrowRight, Calendar, Copy } from 'lucide-react';

// Helper function to safely convert boolean expressions to "true"/"false" strings for ARIA attributes
const toAriaBoolean = (value: boolean): "true" | "false" => value ? "true" : "false";
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { Address, Voucher } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { getProductImage, getProductImages } from '../data/productImages';

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
  const { user, signOut, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const { items: wishlistItems, loading: loadingWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  // User profile state
  const [userProfile, setUserProfile] = useState<{
    full_name: string;
    email: string;
    phone: string;
    avatar_url: string | null;
    dob: string | null;
  } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Profile form state
  const [profileFormData, setProfileFormData] = useState<{
    full_name: string;
    phone: string;
    dob: string | null;
  }>({
    full_name: '',
    phone: '',
    dob: null
  });
  
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
  const [addressFormData, setAddressFormData] = useState<Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'address_type'>>({
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
  
  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete a voucher
  const deleteVoucher = async (voucherId: string) => {
    try {
      setIsSubmitting(true);
      
      if (!user) {
        showToast('You must be logged in to delete vouchers', 'error');
        return;
      }
      
      // Find the user_voucher record for this voucher
      const { data: userVoucherData, error: fetchError } = await supabase
        .from('user_vouchers')
        .select('id')
        .eq('user_id', user.id)
        .eq('voucher_id', voucherId)
        .single();
      
      if (fetchError) {
        console.error('Error finding user voucher:', fetchError);
        throw fetchError;
      }
      
      if (!userVoucherData) {
        throw new Error('Voucher not found');
      }
      
      // Delete the voucher from user_vouchers table
      const { error } = await supabase
        .from('user_vouchers')
        .delete()
        .eq('id', userVoucherData.id);
      
      if (error) throw error;
      
      // Update the UI immediately
      setUserVouchers(prev => prev.filter(v => v.id !== voucherId));
      
      showToast('Voucher deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting voucher:', error);
      showToast('Failed to delete voucher', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('profile_', '');
    
    setProfileFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSavingProfile(true);
      
      const { error } = await updateProfile({
        full_name: profileFormData.full_name,
        phone: profileFormData.phone
        // Temporarily removed dob field until database schema is updated
        // dob: profileFormData.dob
      });
      
      if (error) {
        showToast('Error updating profile: ' + error.message, 'error');
      } else {
        showToast('Profile updated successfully!', 'success');
        
        // Update the userProfile state with new data
        if (userProfile) {
          setUserProfile({
            ...userProfile,
            full_name: profileFormData.full_name,
            phone: profileFormData.phone
            // Temporarily removed dob field until database schema is updated
            // dob: profileFormData.dob
          });
        }
      }
    } catch (error) {
      console.error('Error in handleProfileSubmit:', error);
      showToast('An unexpected error occurred', 'error');
    } finally {
      setSavingProfile(false);
    }
  };
  
  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login?returnUrl=/account');
    } else {
      console.log("User authenticated:", user.id);
      
      // Fetch user profile information
      const fetchUserProfile = async () => {
        setLoadingProfile(true);
        try {
          // Use a simple controller with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          // Fetch with timeout - exclude dob field since it doesn't exist yet
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, phone, avatar_url')
            .eq('id', user.id)
            .single();
          
          // Clear timeout
          clearTimeout(timeoutId);
            
          if (error) {
            console.error('Error fetching user profile:', error);
            
            // Check if the error is because profile doesn't exist
            if (error.code === 'PGRST116' && error.message === 'Cannot coerce the result to a single JSON object') {
              // Profile doesn't exist, let's create one
              console.log('Profile not found, creating new profile for user:', user.id);
              
              const newProfile = {
                id: user.id,
                full_name: user?.user_metadata?.full_name || '',
                email: user.email || '',
                phone: user?.user_metadata?.phone || '',
                avatar_url: null
              };
              
              // Attempt to create profile
              try {
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert([{ 
                    id: user.id,
                    full_name: newProfile.full_name,
                    phone: newProfile.phone
                  }]);
                
                if (insertError) {
                  console.error('Error creating profile:', insertError);
                } else {
                  console.log('Profile created successfully');
                  
                  // Set the new profile data
                  setUserProfile({
                    ...newProfile,
                    dob: null
                  });
                  
                  setProfileFormData({
                    full_name: newProfile.full_name,
                    phone: newProfile.phone,
                    dob: null
                  });
                  
                  return; // Exit early since we've handled this case
                }
              } catch (insertErr) {
                console.error('Exception creating profile:', insertErr);
              }
            }
            
            // If we reach here, either it wasn't a missing profile error or creating the profile failed
            // Try to get data from localStorage as fallback
            let fallbackData;
            try {
              const storedProfile = localStorage.getItem('userProfile');
              if (storedProfile) {
                const parsedProfile = JSON.parse(storedProfile);
                fallbackData = {
                  full_name: parsedProfile.full_name || '',
                  email: user.email || '',
                  phone: parsedProfile.phone || '',
                  avatar_url: parsedProfile.avatar_url,
                  dob: parsedProfile.dob || null
                };
              }
            } catch (e) {
              console.log('Error reading from localStorage:', e);
            }
            
            // If no localStorage data, use metadata from user object
            if (!fallbackData) {
              fallbackData = {
                full_name: user?.user_metadata?.full_name || '',
                email: user.email || '',
                phone: user?.user_metadata?.phone || '',
                avatar_url: null,
                dob: null
              };
            }
            
            setUserProfile(fallbackData);
            setProfileFormData({
              full_name: fallbackData.full_name,
              phone: fallbackData.phone,
              dob: fallbackData.dob
            });
            showToast('Không thể kết nối đến máy chủ. Đang sử dụng dữ liệu cục bộ.', 'info');
          } else if (data) {
            const profileData = {
              full_name: data.full_name || '',
              email: user.email || '',
              phone: data.phone || '',
              avatar_url: data.avatar_url,
              dob: null // For now, we'll always set dob to null since the column doesn't exist
            };
            
            setUserProfile(profileData);
            
            // Initialize form data
            setProfileFormData({
              full_name: profileData.full_name,
              phone: profileData.phone,
              dob: profileData.dob
            });
          }
        } catch (error) {
          console.error('Error in fetchUserProfile:', error);
        } finally {
          setLoadingProfile(false);
        }
      };
      
      fetchUserProfile();
    }
  }, [user, navigate, showToast]);
  
  // Load orders when the orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      setLoadingOrders(true);
      
      const fetchOrders = async () => {
        try {
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
            setLoadingOrders(false);
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
          setOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      };
      
      fetchOrders();
    }
  }, [activeTab, user]);
  
  // Load addresses when the addresses tab is active
  useEffect(() => {
    if (activeTab === 'addresses' && user) {
      setLoadingAddresses(true);
      
      const fetchAddresses = async () => {
        try {
          const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (error) {
            throw error;
          }
          
          setAddresses(data || []);
        } catch (error) {
          console.error('Error loading addresses:', error);
          setAddresses([]);
        } finally {
          setLoadingAddresses(false);
        }
      };
      
      fetchAddresses();
    }
    
    // Load vouchers when the vouchers tab is active
    if (activeTab === 'vouchers' && user) {
      setLoadingVouchers(true);
      
      const fetchVouchers = async () => {
        try {
          console.log('Fetching collected vouchers for user:', user.id);
          
          // First get ONLY the vouchers collected by the user from user_vouchers table
          const { data: userVoucherData, error: userVoucherError } = await supabase
            .from('user_vouchers')
            .select('voucher_id, is_used, used_at, created_at')
            .eq('user_id', user.id);
            
          if (userVoucherError) {
            console.error('Error fetching user_vouchers:', userVoucherError);
            throw userVoucherError;
          }
          
          console.log('User vouchers data:', userVoucherData);
          
          if (!userVoucherData || userVoucherData.length === 0) {
            // No collected vouchers
            console.log('No user-specific vouchers found');
            setUserVouchers([]);
            setLoadingVouchers(false);
            return;
          }
          
          // Get voucher details for the IDs collected by the user
          const voucherIds = userVoucherData.map(item => item.voucher_id);
          
          const { data: voucherData, error: voucherError } = await supabase
            .from('vouchers')
            .select('*')
            .in('id', voucherIds);
            
          if (voucherError) {
            console.error('Error fetching voucher details:', voucherError);
            throw voucherError;
          }
          
          console.log('Voucher details:', voucherData);
          
          // Process voucher data with user info and filtering
          const now = new Date().toISOString();
          
          // First enhance vouchers with user info
          const processedVouchers = voucherData.map(voucher => {
            const userVoucherInfo = userVoucherData.find(uv => uv.voucher_id === voucher.id);
            // Create an enhanced voucher that matches our Voucher type plus is_used
            return {
              ...voucher,
              is_used: userVoucherInfo?.is_used || false,
              used_at: userVoucherInfo?.used_at || null,
              collected_at: userVoucherInfo?.created_at || null // Use created_at as fallback for collected_at
            };
          });
          
          // Filter out expired vouchers
          const validVouchers = processedVouchers.filter(voucher => 
            voucher.is_active && 
            (!voucher.valid_until || voucher.valid_until >= now) &&
            (!voucher.valid_from || voucher.valid_from <= now)
          );
          
          // Sort vouchers: unused first, then by expiration date (soonest first)
          validVouchers.sort((a, b) => {
            // Unused vouchers first
            if (a.is_used !== b.is_used) {
              return a.is_used ? 1 : -1;
            }
            
            // Then sort by expiry date (soonest first)
            if (a.valid_until && b.valid_until) {
              return new Date(a.valid_until).getTime() - new Date(b.valid_until).getTime();
            }
            return 0;
          });
          
          console.log('Valid collected vouchers for user:', validVouchers);
          setUserVouchers(validVouchers);
        } catch (error) {
          console.error('Error fetching vouchers:', error);
          setUserVouchers([]);
        } finally {
          setLoadingVouchers(false);
        }
      };
      
      fetchVouchers();
    }
  }, [activeTab, user]);
  
  // Function to add a new address
  const handleAddAddress = () => {
    // Reset form and enable add mode
    setAddressFormData({
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
    // Clear any previous form errors
    setFormErrors({});
    setEditingAddress(address);
    setIsAddingAddress(true);
    
    // Set focus to the form heading for better accessibility
    setTimeout(() => {
      const formHeading = document.querySelector('.address-form-heading');
      if (formHeading) {
        (formHeading as HTMLElement).focus();
      }
    }, 100);
  };
  
  // Function to delete an address
  const handleDeleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const newAddresses = addresses.filter(address => address.id !== addressId);
      
      // If we deleted the default address, make the first address the default (if any)
      if (newAddresses.length > 0 && !newAddresses.some(address => address.is_default)) {
        const firstAddress = newAddresses[0];
        
        // Update the first address to be default in database
        await supabase
          .from('addresses')
          .update({ is_default: true })
          .eq('id', firstAddress.id);
          
        // Update local state
        firstAddress.is_default = true;
      }
      
      setAddresses(newAddresses);
      
      // Show success toast
      showToast(`Address deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting address:', error);
      showToast('Failed to delete address', 'error');
    }
  };
  
  // Function to set an address as default
  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      // First, set all addresses as not default
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user?.id);
      
      // Then set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const newAddresses = addresses.map(address => ({
        ...address,
        is_default: address.id === addressId
      }));
      
      setAddresses(newAddresses);
      
      // Show success toast
      showToast(`Address set as default`, 'success');
    } catch (error) {
      console.error('Error setting default address:', error);
      showToast('Failed to update default address', 'error');
    }
  };
  
  // Function to save address (create or update)
  const handleSaveAddress = async () => {
    // Validate required fields
    const requiredFields = ['full_name', 'phone', 'address_line1', 'city', 'state', 'postal_code', 'country'];
    const newFormErrors: Record<string, string> = {};
    let hasErrors = false;
    
    requiredFields.forEach(field => {
      if (!addressFormData[field as keyof typeof addressFormData]) {
        newFormErrors[field] = `This field is required`;
        hasErrors = true;
      }
    });
    
    // Update form errors state
    setFormErrors(newFormErrors);
    
    if (hasErrors) {
      // Focus the first missing field
      const firstMissingField = document.getElementById(Object.keys(newFormErrors)[0]);
      if (firstMissingField) {
        firstMissingField.focus();
      }
      
      showToast(`Please fill in all required fields`, 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingAddress) {
        // Update existing address
        const updatedAddress = {
          ...addressFormData,
          updated_at: new Date().toISOString()
        };
        
        // If setting as default, first remove default from all other addresses
        if (addressFormData.is_default) {
          await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user?.id);
        }
        
        // Update the address
        const { error } = await supabase
          .from('addresses')
          .update(updatedAddress)
          .eq('id', editingAddress.id);
          
        if (error) {
          throw error;
        }
        
        // Update local state
        const updatedAddresses = addresses.map(address => {
          if (address.id === editingAddress.id) {
            return {
              ...address,
              ...updatedAddress
            };
          }
          
          // If this is being set as default, remove default from others
          if (addressFormData.is_default && address.id !== editingAddress.id) {
            return { ...address, is_default: false };
          }
          
          return address;
        });
        
        setAddresses(updatedAddresses);
        
        // Show success toast
        showToast(`Address updated successfully`, 'success');
      } else {
        // Create new address
        const now = new Date().toISOString();
        const newAddress: Address = {
          id: uuidv4(),
          user_id: user?.id || '',
          ...addressFormData,
          created_at: now,
          updated_at: now
        };
        
        // If this is the first address or marked as default, first remove default from all other addresses
        if (addresses.length === 0 || newAddress.is_default) {
          newAddress.is_default = true; // Ensure first address is default
          
          if (addresses.length > 0) {
            // Only need to update other addresses if there are any
            await supabase
              .from('addresses')
              .update({ is_default: false })
              .eq('user_id', user?.id);
          }
        }
        
        // Insert new address
        console.log("Attempting to insert address with user_id:", user?.id);
        console.log("Address data:", newAddress);
        
        const { data, error } = await supabase
          .from('addresses')
          .insert(newAddress)
          .select();
          
        if (error) {
          console.error("Supabase insert error details:", error);
          throw error;
        }
        
        console.log("Address inserted successfully:", data);
        
        // Update local state
        let newAddresses: Address[];
        
        if (newAddress.is_default) {
          // If this is the default, remove default from others in local state
          newAddresses = addresses.map(address => ({
            ...address,
            is_default: false
          }));
          newAddresses.push(newAddress);
        } else {
          newAddresses = [...addresses, newAddress];
        }
        
        setAddresses(newAddresses);
        
        // Show success toast
        showToast(`Address added successfully`, 'success');
      }
      
      // Reset state
      setIsAddingAddress(false);
      setEditingAddress(null);
      setFormErrors({});
    } catch (error) {
      console.error('Error saving address:', error);
      showToast('Failed to save address', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
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
                  {userProfile?.full_name ? userProfile.full_name.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase() : user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <h3 className="font-semibold text-lg">{userProfile?.full_name || 'User'}</h3>
                <p className="text-sm text-gray-600">{userProfile?.email || user?.email || ''}</p>
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
                  {loadingProfile ? (
                    <div className="py-20 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading your profile...</p>
                    </div>
                  ) : (
                    <>
                      <form onSubmit={handleProfileSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="profile_full_name">Full Name</label>
                            <input
                              id="profile_full_name"
                              type="text"
                              value={profileFormData.full_name}
                              onChange={handleProfileChange}
                              placeholder="Enter your full name"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="profile_email">Email</label>
                            <input
                              id="profile_email"
                              type="email"
                              defaultValue={userProfile?.email || user?.email || ''}
                              readOnly
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="profile_phone">Phone</label>
                            <input
                              id="profile_phone"
                              type="tel"
                              value={profileFormData.phone}
                              onChange={handleProfileChange}
                              placeholder="Enter your phone number"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          {/* Temporarily hiding DOB field until database schema is updated */}
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-400" htmlFor="profile_dob">
                              Date of Birth
                              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming Soon</span>
                            </label>
                            <input
                              id="profile_dob"
                              type="date"
                              value={profileFormData.dob || ''}
                              onChange={handleProfileChange}
                              placeholder="Select your date of birth"
                              title="Date of Birth"
                              disabled
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none bg-gray-100 text-gray-400 cursor-not-allowed"
                            />
                          </div>
                        </div>

                      <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4">Change Password</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="current_password">Current Password</label>
                            <input
                              id="current_password"
                              type="password"
                              placeholder="Enter your current password"
                              title="Current Password"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="new_password">New Password</label>
                            <input
                              id="new_password"
                              type="password"
                              placeholder="Enter your new password"
                              title="New Password"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="confirm_password">Confirm New Password</label>
                            <input
                              id="confirm_password"
                              type="password"
                              placeholder="Confirm your new password"
                              title="Confirm New Password"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex gap-4">
                        <button 
                          type="submit"
                          disabled={savingProfile}
                          className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
                        >
                          {savingProfile && <Loader2 size={18} className="animate-spin" />}
                          Save Changes
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            // Reset form data to current profile values
                            if (userProfile) {
                              setProfileFormData({
                                full_name: userProfile.full_name,
                                phone: userProfile.phone,
                                dob: userProfile.dob
                              });
                            }
                          }}
                          className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                    </>
                  )}
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
                                Placed on {new Date(order.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
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
                              <p className="text-gray-600">{order.items_count} {order.items_count === 1 ? 'item' : 'items'}</p>
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
                      <h3 className="text-xl font-semibold mb-2 address-form-heading" tabIndex={-1}>
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Fields marked with <span className="text-red-500" aria-hidden="true">*</span> <span className="sr-only">asterisk</span> are required
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Address type field removed - not in database schema */}
                        
                        <fieldset className="border-0 p-0 m-0">
                          <legend className="sr-only">Contact Information</legend>
                          <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="full_name">
                              Full Name <span className="text-red-500" aria-hidden="true">*</span>
                            </label>
                            <input
                              type="text"
                              id="full_name"
                              name="full_name"
                              placeholder="Enter full name"
                              value={addressFormData.full_name}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              aria-required="true"
                              aria-invalid={toAriaBoolean(!!formErrors['full_name'])}
                              required
                            />
                            {formErrors['full_name'] && (
                              <p className="text-xs text-red-500 mt-1" id="full_name-error" role="alert">
                                {formErrors['full_name']}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="phone">
                              Phone Number <span className="text-red-500" aria-hidden="true">*</span>
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              placeholder="Enter phone number"
                              value={addressFormData.phone}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              aria-required="true"
                              aria-invalid={toAriaBoolean(!!formErrors['phone'])}
                              aria-describedby="phone-hint"
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1" id="phone-hint">
                              Format: XXX-XXX-XXXX (include country code for international numbers)
                            </p>
                            {formErrors['phone'] && (
                              <p className="text-xs text-red-500 mt-1" id="phone-error" role="alert">
                                {formErrors['phone']}
                              </p>
                            )}
                          </div>
                        </fieldset>
                        
                        <fieldset className="border-0 p-0 m-0">
                          <legend className="sr-only">Street Address</legend>
                          <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="address_line1">
                              Address Line 1 <span className="text-red-500" aria-hidden="true">*</span>
                            </label>
                            <input
                              type="text"
                              id="address_line1"
                              name="address_line1"
                              placeholder="Street address, apartment, suite, etc"
                              value={addressFormData.address_line1}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              aria-required="true"
                              aria-invalid={toAriaBoolean(!!formErrors['address_line1'])}
                              required
                            />
                            {formErrors['address_line1'] && (
                              <p className="text-xs text-red-500 mt-1" id="address_line1-error" role="alert">
                                {formErrors['address_line1']}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="address_line2">
                              Address Line 2 <span className="text-gray-500">(Optional)</span>
                            </label>
                            <input
                              type="text"
                              id="address_line2"
                              name="address_line2"
                              placeholder="Apartment, suite, unit, etc (optional)"
                              value={addressFormData.address_line2}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              aria-required="false"
                            />
                          </div>
                        </fieldset>
                        
                        <fieldset className="border-0 p-0 m-0">
                          <legend className="sr-only">Location Information</legend>
                          <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="city">
                              City <span className="text-red-500" aria-hidden="true">*</span>
                            </label>
                            <input
                              type="text"
                              id="city"
                              name="city"
                              placeholder="Enter city"
                              value={addressFormData.city}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              aria-required="true"
                              aria-invalid={toAriaBoolean(!!formErrors['city'])}
                              required
                            />
                            {formErrors['city'] && (
                              <p className="text-xs text-red-500 mt-1" id="city-error" role="alert">
                                {formErrors['city']}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="state">
                              State/Province <span className="text-red-500" aria-hidden="true">*</span>
                            </label>
                            <input
                              type="text"
                              id="state"
                              name="state"
                              placeholder="Enter state or province"
                              value={addressFormData.state}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              aria-required="true"
                              required
                            />
                            {formErrors['state'] && (
                              <p className="text-xs text-red-500 mt-1" id="state-error" role="alert">
                                {formErrors['state']}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="postal_code">
                              Postal/ZIP Code <span className="text-red-500" aria-hidden="true">*</span>
                            </label>
                            <input
                              type="text"
                              id="postal_code"
                              name="postal_code"
                              placeholder="Enter postal or ZIP code"
                              value={addressFormData.postal_code}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              aria-required="true"
                              required
                            />
                            {formErrors['postal_code'] && (
                              <p className="text-xs text-red-500 mt-1" id="postal_code-error" role="alert">
                                {formErrors['postal_code']}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="country">
                              Country <span className="text-red-500" aria-hidden="true">*</span>
                            </label>
                            <input
                              type="text"
                              id="country"
                              name="country"
                              placeholder="Enter country"
                              value={addressFormData.country}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              aria-required="true"
                              required
                            />
                            {formErrors['country'] && (
                              <p className="text-xs text-red-500 mt-1" id="country-error" role="alert">
                                {formErrors['country']}
                              </p>
                            )}
                          </div>
                        </fieldset>
                      </div>
                      
                      <div className="flex items-center mb-6" role="group" aria-labelledby="default-address-label">
                        <input
                          type="checkbox"
                          id="is_default"
                          name="is_default"
                          checked={addressFormData.is_default}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-teal-600 bg-gray-100 rounded border-gray-300 focus:ring-teal-500"
                          aria-describedby="default-address-hint"
                        />
                        <div className="ml-2">
                          <label htmlFor="is_default" className="text-sm font-medium" id="default-address-label">
                            Set as default address
                          </label>
                          <p id="default-address-hint" className="text-xs text-gray-500">
                            This address will be used as your default shipping address
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handleSaveAddress}
                          className={`px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                          aria-label={editingAddress ? 'Update address information' : 'Save new address'}
                          aria-busy={toAriaBoolean(isSubmitting)}
                          disabled={isSubmitting}
                          type="button"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>{editingAddress ? 'Updating...' : 'Saving...'}</span>
                            </span>
                          ) : (
                            editingAddress ? 'Update Address' : 'Save Address'
                          )}
                        </button>
                        <button
                          onClick={() => {
                            // Reset form data
                            setAddressFormData({
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
                            setFormErrors({});
                          }}
                          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          aria-label="Clear form fields"
                          type="button"
                          disabled={isSubmitting}
                        >
                          Clear Form
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingAddress(false);
                            setEditingAddress(null);
                            setFormErrors({});
                          }}
                          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          aria-label="Cancel address editing"
                          type="button"
                          disabled={isSubmitting}
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
                        className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2 mx-auto focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                        aria-label="Add a new address to your account"
                        type="button"
                      >
                        <Plus size={20} aria-hidden="true" />
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
                          <h3 className="font-semibold text-lg mb-3">Shipping Address</h3>
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
                              src={(() => {
                                // Try to get product image using helper functions
                                if (item.product?.id) {
                                  // First try to get by product ID
                                  const productImages = getProductImages(item.product.id);
                                  if (productImages.length > 0) {
                                    return productImages[0];
                                  }
                                  
                                  // Then try to get by image path
                                  if (item.product?.images) {
                                    // Parse images if they're stored as a JSON string
                                    let imageArray: string[] = [];
                                    if (typeof item.product.images === 'string') {
                                      try {
                                        imageArray = JSON.parse(item.product.images);
                                      } catch (e) {
                                        console.error('Error parsing product images:', e);
                                        imageArray = [];
                                      }
                                    } else if (Array.isArray(item.product.images)) {
                                      imageArray = item.product.images;
                                    }
                                    
                                    if (imageArray.length > 0) {
                                      const imagePath = getProductImage(imageArray[0]);
                                      if (imagePath) return imagePath;
                                      return imageArray[0];
                                    }
                                  }
                                }
                                // Fallback to placeholder
                                return 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400';
                              })()}
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
                    <div>
                      <h2 className="text-2xl font-serif">My Vouchers</h2>
                      <p className="text-sm text-gray-600 mt-1">Vouchers you've collected</p>
                    </div>
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
                      <h3 className="text-2xl font-serif mb-4">No collected vouchers</h3>
                      <p className="text-gray-600 mb-8">You haven't collected any vouchers yet. Visit our vouchers page to find and collect discounts for your next purchase.</p>
                      <Link
                        to="/vouchers"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                      >
                        Browse & Collect Vouchers
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
                          <div className="relative flex flex-col md:flex-row">
                            <button
                              onClick={() => deleteVoucher(voucher.id)}
                              className="absolute top-2 right-2 p-1 rounded-full bg-white bg-opacity-80 text-red-500 hover:text-red-600 hover:bg-opacity-100 transition-colors"
                              aria-label="Delete voucher"
                              disabled={isSubmitting}
                            >
                              <Trash2 size={18} />
                            </button>
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
                                {voucher.is_used && (
                                  <div className="bg-white text-gray-600 text-xs font-bold px-2 py-1 mt-2 rounded-full uppercase">
                                    Used
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="p-6 md:w-3/4">
                              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-lg">{voucher.code}</h3>
                                  {voucher.is_used && (
                                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">Used</span>
                                  )}
                                </div>
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
                                <button
                                  onClick={() => deleteVoucher(voucher.id)}
                                  className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium ml-auto"
                                  disabled={isSubmitting}
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
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
