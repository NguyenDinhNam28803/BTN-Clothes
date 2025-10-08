import { Copy, Tag, Calendar, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function Vouchers() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [collectedVouchers, setCollectedVouchers] = useState<number[]>([]);
  const navigate = useNavigate();
  const { getCartCount } = useCart();

  const initialVouchers = [
    {
      id: 1,
      code: 'WELCOME20',
      title: 'Welcome Gift',
      description: '20% off your first order',
      discount: '20% OFF',
      minOrder: 50,
      validUntil: '2024-12-31',
      type: 'percentage',
      collected: false,
    },
    {
      id: 2,
      code: 'FREESHIP',
      title: 'Free Shipping',
      description: 'Free shipping on all orders',
      discount: 'FREE SHIP',
      minOrder: 30,
      validUntil: '2024-11-30',
      type: 'shipping',
      collected: false,
    },
    {
      id: 3,
      code: 'SAVE50',
      title: '$50 Off',
      description: '$50 discount on orders over $200',
      discount: '$50 OFF',
      minOrder: 200,
      validUntil: '2024-12-15',
      type: 'fixed',
      collected: false,
    },
    {
      id: 4,
      code: 'FLASH30',
      title: 'Flash Sale',
      description: '30% off all items',
      discount: '30% OFF',
      minOrder: 0,
      validUntil: '2024-10-31',
      type: 'percentage',
      collected: false,
    },
  ];
  
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [activeTab, setActiveTab] = useState('All Vouchers');
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');

  // Load collected vouchers from localStorage
  useEffect(() => {
    const savedVouchers = localStorage.getItem('collectedVouchers');
    if (savedVouchers) {
      try {
        const ids = JSON.parse(savedVouchers);
        setCollectedVouchers(ids);
        
        // Update vouchers with collected state
        setVouchers(prev => prev.map(voucher => ({
          ...voucher,
          collected: ids.includes(voucher.id)
        })));
      } catch (err) {
        console.error('Error parsing saved vouchers:', err);
      }
    }
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    showNotification('Voucher copied to clipboard!');
  };
  
  const collectVoucher = (id: number) => {
    // Update vouchers
    setVouchers(prev => prev.map(voucher => 
      voucher.id === id ? { ...voucher, collected: true } : voucher
    ));
    
    // Save to localStorage
    const updatedCollected = [...collectedVouchers, id];
    setCollectedVouchers(updatedCollected);
    localStorage.setItem('collectedVouchers', JSON.stringify(updatedCollected));
    
    showNotification('Voucher collected successfully!');
  };
  
  const applyVoucher = (code: string) => {
    // Save the voucher code to localStorage so it can be accessed across pages
    localStorage.setItem('activeVoucher', code);
    
    // Check if there are items in cart
    const cartItemCount = getCartCount();
    
    if (cartItemCount > 0) {
      // If there are items in cart, redirect to cart page
      showNotification('Voucher applied! Redirecting to cart...');
      setTimeout(() => {
        navigate(`/cart?voucher=${code}`);
      }, 1500);
    } else {
      // If cart is empty, redirect to shop page
      showNotification('Voucher applied! Redirecting to shop...');
      setTimeout(() => {
        navigate(`/shop?voucher=${code}`);
      }, 1500);
    }
  };
  
  const showNotification = (msg: string) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };
  
  const filterVouchers = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #f59e0b 100%)',
          backgroundSize: '100% 100%',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Tag className="text-yellow-500" size={40} />
            <h1 className="text-4xl md:text-5xl font-serif">Vouchers & Deals</h1>
          </div>
          <p className="text-gray-600 text-lg">Save more with our exclusive vouchers</p>
        </div>

        {/* Success notification */}
        {showMessage && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            {message}
          </div>
        )}
        
        <div className="mb-12">
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {['All Vouchers', 'Collected', 'Percentage Off', 'Free Shipping', 'Fixed Amount'].map((tab) => (
              <button
                key={tab}
                onClick={() => filterVouchers(tab)}
                className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? 'bg-teal-500 text-white' 
                    : 'bg-white hover:bg-teal-500 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {vouchers
            .filter(voucher => {
              if (activeTab === 'All Vouchers') return true;
              if (activeTab === 'Collected') return voucher.collected;
              if (activeTab === 'Percentage Off') return voucher.type === 'percentage';
              if (activeTab === 'Free Shipping') return voucher.type === 'shipping';
              if (activeTab === 'Fixed Amount') return voucher.type === 'fixed';
              return true;
            })
            .map((voucher) => (
              <div
                key={voucher.id}
                data-cursor="sale"
                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all ${voucher.collected ? 'border-2 border-green-500' : ''}`}
              >
                <div className="flex">
                  <div
                    className={`w-32 flex items-center justify-center text-white font-bold text-2xl ${
                      voucher.type === 'percentage'
                        ? 'bg-gradient-to-br from-red-500 to-pink-500'
                        : voucher.type === 'shipping'
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-br from-purple-500 to-indigo-500'
                    }`}
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 85% 50%, 100% 100%, 0 100%)',
                    }}
                  >
                    <span className="transform -rotate-12">{voucher.discount}</span>
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{voucher.title}</h3>
                        <p className="text-gray-600 text-sm">{voucher.description}</p>
                      </div>
                      {voucher.collected && (
                        <CheckCircle className="text-green-500" size={24} />
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Tag size={16} />
                        <span>Min. ${voucher.minOrder}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>Until {voucher.validUntil}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                        <code className="flex-1 font-mono font-bold">{voucher.code}</code>
                        <button
                          onClick={() => handleCopy(voucher.code)}
                          className="p-1 hover:text-teal-500 transition-colors"
                          aria-label="Copy code"
                        >
                          {copiedCode === voucher.code ? (
                            <CheckCircle size={20} className="text-green-500" />
                          ) : (
                            <Copy size={20} />
                          )}
                        </button>
                      </div>
                      {!voucher.collected && (
                        <button 
                          onClick={() => collectVoucher(voucher.id)}
                          className="px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                        >
                          Collect
                        </button>
                      )}
                    </div>

                    {voucher.collected && (
                      <button 
                        onClick={() => applyVoucher(voucher.code)}
                        className="w-full mt-2 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Use Now
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t">
                  <button className="text-sm text-teal-500 hover:text-teal-600 font-medium">
                    View Terms & Conditions →
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-2xl font-serif mb-4">Want More Vouchers?</h2>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter and be the first to know about new vouchers and exclusive deals
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
