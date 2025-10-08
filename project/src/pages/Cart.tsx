import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    items: cartItems, 
    updateQuantity: updateCartQuantity,
    removeFromCart: removeCartItem
  } = useCart();

  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [searchParams] = useSearchParams();
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate order values
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.sale_price || item.product?.base_price || 0;
    const adjustment = item.variant?.price_adjustment || 0;
    return sum + (price + adjustment) * item.quantity;
  }, 0);
  
  // Calculate discount based on applied voucher
  let discount = 0;
  let shippingDiscount = false;
  
  if (voucherApplied) {
    // Apply discount based on voucher type
    const vouchers = {
      'WELCOME20': { discount: 20, type: 'percentage' },
      'SAVE50': { discount: 50, type: 'fixed' },
      'FREESHIP': { discount: 0, type: 'shipping' },
      'FLASH30': { discount: 30, type: 'percentage' }
    };
    
    const voucher = vouchers[voucherCode as keyof typeof vouchers];
    
    if (voucher) {
      if (voucher.type === 'percentage') {
        discount = subtotal * (voucher.discount / 100);
      } else if (voucher.type === 'fixed') {
        discount = Math.min(voucher.discount, subtotal); // Don't discount more than subtotal
      } else if (voucher.type === 'shipping') {
        shippingDiscount = true;
      }
    }
  }
  
  const shipping = (subtotal > 100 || shippingDiscount) ? 0 : 10;
  const total = subtotal - discount;

  // Function to apply voucher code
  const applyVoucherCode = useCallback((code: string) => {
    setIsUpdating(true);
    
    // Simple voucher validation and application
    const vouchers = {
      'WELCOME20': { discount: 20, type: 'percentage' },
      'SAVE50': { discount: 50, type: 'fixed' },
      'FREESHIP': { discount: 0, type: 'shipping' },
      'FLASH30': { discount: 30, type: 'percentage' }
    };

    const voucher = vouchers[code as keyof typeof vouchers];
    
    if (voucher) {
      setVoucherApplied(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('activeVoucher', code);
    } else {
      setVoucherApplied(false);
    }
    
    setIsUpdating(false);
  }, []);

  // Check for voucher in URL or localStorage when component mounts
  useEffect(() => {
    // First check if there's a voucher in URL
    const voucherFromURL = searchParams.get('voucher');
    
    // Then check localStorage
    const storedVoucher = localStorage.getItem('activeVoucher');
    
    // Apply voucher if available
    if (voucherFromURL) {
      setVoucherCode(voucherFromURL);
      applyVoucherCode(voucherFromURL);
    } else if (storedVoucher) {
      setVoucherCode(storedVoucher);
      applyVoucherCode(storedVoucher);
    }
  }, [searchParams, applyVoucherCode]);

  const updateQuantity = async (id: string, delta: number) => {
    // Tìm item hiện tại để biết số lượng mới
    const currentItem = cartItems.find(item => item.id === id);
    if (currentItem) {
      const newQuantity = Math.max(1, currentItem.quantity + delta);
      
      // Cập nhật thông qua context
      await updateCartQuantity(id, newQuantity);
    }
  };

  const removeItem = async (id: string) => {
    // Xóa thông qua context
    await removeCartItem(id);
  };
  
  // Apply voucher when button is clicked
  const handleApplyVoucher = () => {
    if (voucherCode.trim() !== '') {
      applyVoucherCode(voucherCode);
    }
  };
  
  // Xử lý khi người dùng điền thông tin thanh toán và chuyển đến checkout
  const handleCheckout = () => {
    // Kiểm tra đăng nhập trước khi chuyển đến trang thanh toán
    if (!user) {
      // Lưu URL hiện tại để quay lại sau khi đăng nhập
      localStorage.setItem('returnUrl', '/checkout');
      // Chuyển hướng đến trang đăng nhập
      navigate('/login');
      return;
    }
    
    // Lưu thông tin đơn hàng vào localStorage
    localStorage.setItem('orderSummary', JSON.stringify({
      subtotal,
      shipping,
      discount,
      total
    }));
    
    // Chuyển đến trang checkout
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-3xl font-serif mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything yet</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-600 transition-colors"
          >
            Start Shopping
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div
        className="absolute inset-0 z-0 bg-gradient-radial from-white via-white to-teal-100"
      />

      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-4xl md:text-5xl font-serif mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {cartItems.map((item) => {
                const productName = item.product?.name || 'Unknown Product';
                const productImage = item.product?.images && item.product.images.length > 0 
                  ? item.product.images[0] 
                  : 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=200';
                const productPrice = (item.product?.sale_price || item.product?.base_price || 0) + 
                  (item.variant?.price_adjustment || 0);
                const variantSize = item.variant?.size || '-';
                const variantColor = item.variant?.color || '-';
                
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-4 p-6 border-b border-gray-200 last:border-b-0"
                  >
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-full sm:w-32 h-32 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{productName}</h3>
                      <div className="text-sm text-gray-600 mb-2">
                        <span>Size: {variantSize}</span>
                        <span className="mx-2">|</span>
                        <span>Color: {variantColor}</span>
                      </div>
                      <div className="text-xl font-bold text-teal-500">
                        ${productPrice.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">
                      <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-white rounded transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-white rounded transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="sm:self-end flex items-center gap-1 text-xs text-red-600 hover:text-red-800 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 mt-6 text-teal-500 hover:text-teal-600 font-medium"
            >
              ← Continue Shopping
            </Link>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-serif mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">
                      -${discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-teal-500">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Voucher Code</label>
                {voucherApplied ? (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-green-700 font-medium">{voucherCode}</span>
                        <span className="ml-2 text-xs text-green-600">Applied</span>
                      </div>
                      <button
                        onClick={() => {
                          setVoucherApplied(false);
                          setVoucherCode('');
                          localStorage.removeItem('activeVoucher');
                        }}
                        className="text-xs text-gray-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button 
                      onClick={handleApplyVoucher}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>


              <button 
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 py-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
              >
                Proceed to Checkout
                <ArrowRight size={20} />
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                <ShoppingBag size={16} />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}