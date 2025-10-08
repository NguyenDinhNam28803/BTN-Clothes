import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, TrendingUp, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../components/Toast';

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();
  
  // Flash Sale countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Load products from database
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Fetch new arrivals (is_new = true)
      const { data: newProducts } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('is_new', true)
        .order('created_at', { ascending: false })
        .limit(8);

      // Fetch flash sale products (products with sale_price)
      const { data: saleProducts } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .not('sale_price', 'is', null)
        .order('created_at', { ascending: false })
        .limit(4);

      setNewArrivals(newProducts || []);
      setFlashSaleProducts(saleProducts || []);
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .gt('stock_quantity', 0)
      .limit(1);

    if (variants && variants.length > 0) {
      await addToCart(productId, variants[0].id, 1);
      showToast('Added to cart!', 'success');
    } else {
      showToast('Product is out of stock', 'error');
    }
  };

  const toggleWishlist = async (productId: string) => {
    const inWishlist = isInWishlist(productId);

    if (inWishlist) {
      const item = (await supabase
        .from('wishlist_items')
        .select('id')
        .eq('product_id', productId)
        .maybeSingle()).data;

      if (item) {
        await removeFromWishlist(item.id);
        showToast('Removed from wishlist', 'info');
      }
    } else {
      await addToWishlist(productId);
      showToast('Added to wishlist!', 'success');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('[data-scroll]');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          el.classList.add('animate-fade-in-up');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Flash Sale countdown timer effect
  useEffect(() => {
    // Set end date to 2 days from current date (for demonstration)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 2);
    endDate.setHours(endDate.getHours() + 14);
    endDate.setMinutes(endDate.getMinutes() + 35);
    
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    // Calculate initial time left
    setTimeLeft(calculateTimeLeft());

    // Update time every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 z-0 w-full h-full object-cover"
          style={{ filter: 'blur(2px)' }}
          src="src/Assets/IMG/BTN.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/40 z-10" />

        <div className="relative z-20 text-center text-white px-4">
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 tracking-wider"
            style={{ fontFamily: "'Playfair Display', serif" }}
            data-aos="fade-up"
          >
            Elevate Your Style
          </h1>
          <p className="text-xl md:text-2xl mb-8" data-aos="fade-up" data-aos-delay="200">
            Discover the latest trends in fashion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" data-aos="fade-up" data-aos-delay="400">
            <Link
              to="/shop"
              className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-teal-500 hover:text-white transition-all transform hover:scale-105"
            >
              Shop Now
            </Link>
            <Link
              to="/new-arrivals"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-black transition-all transform hover:scale-105"
            >
              New Collection
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-scroll-down" />
          </div>
        </div>
      </section>

      <section
        className="py-20 relative"
        data-scroll
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #14b8a6 100%)',
            backgroundSize: '100% 100%',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-serif mb-4">Featured Categories</h2>
            <p className="text-gray-600 text-lg">Explore our curated collections</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Men',
                image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=500',
                link: '/men',
              },
              {
                title: 'Women',
                image: 'https://images.pexels.com/photos/972995/pexels-photo-972995.jpeg?auto=compress&cs=tinysrgb&w=500',
                link: '/women',
              },
              {
                title: 'Kids',
                image: 'https://images.pexels.com/photos/1620653/pexels-photo-1620653.jpeg?auto=compress&cs=tinysrgb&w=500',
                link: '/kids',
              },
              {
                title: 'Accessories',
                image: 'https://images.pexels.com/photos/322207/pexels-photo-322207.jpeg?auto=compress&cs=tinysrgb&w=500',
                link: '/accessories',
              },
            ].map((category, index) => (
              <Link
                key={index}
                to={category.link}
                data-cursor="pointer"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
                className="group relative h-96 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-3xl font-serif mb-2">{category.title}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Explore</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="text-teal-500" />
              <h2 className="text-4xl md:text-5xl font-serif">New Arrivals</h2>
              <Sparkles className="text-teal-500" />
            </div>
            <p className="text-gray-600 text-lg">Fresh styles just in</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))
            ) : newArrivals.length > 0 ? (
              newArrivals.map((product, index) => {
                const price = product.sale_price || product.base_price;
                const hasDiscount = product.sale_price && product.sale_price < product.base_price;
                const mainImage = Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400';

                return (
                  <div
                    key={product.id}
                    data-cursor="shirt"
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                    className="group cursor-pointer"
                  >
                    <Link to={`/product/${product.id}`} className="relative overflow-hidden rounded-2xl mb-4 bg-gray-100 aspect-[3/4] block">
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product.id);
                          }}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-teal-500 hover:text-white transition-colors"
                        >
                          <ShoppingBag size={20} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product.id);
                          }}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <span className={isInWishlist(product.id) ? 'text-red-500' : ''}>
                            ❤
                          </span>
                        </button>
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          NEW
                        </span>
                      </div>
                    </Link>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-teal-500 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">${price.toFixed(2)}</span>
                      {hasDiscount && (
                        <span className="text-gray-400 line-through">${product.base_price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No new arrivals available</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-600 transition-colors"
            >
              View All Products
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="py-20 relative"
        data-scroll
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #f59e0b 100%)',
            backgroundSize: '100% 100%',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="text-red-500" size={32} />
              <h2 className="text-4xl md:text-5xl font-serif">Flash Sale</h2>
              <div className="text-3xl">🔥</div>
            </div>
            <p className="text-gray-600 text-lg mb-6">Limited time offers</p>

            <div className="flex justify-center gap-4" data-cursor="sale">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds },
              ].map((time, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-lg p-4 shadow-lg min-w-[80px] transition-transform hover:scale-105 ${index === 3 ? 'animate-pulse-custom' : ''}`}
                >
                  <div className="text-3xl font-bold text-red-500">
                    {String(time.value).padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-600">{time.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))
            ) : flashSaleProducts.length > 0 ? (
              flashSaleProducts.map((product) => {
                const price = product.sale_price || product.base_price;
                const hasDiscount = product.sale_price && product.sale_price < product.base_price;
                const discountPercent = hasDiscount 
                  ? Math.round((1 - product.sale_price! / product.base_price) * 100)
                  : 0;
                const mainImage = Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400';

                return (
                  <div
                    key={product.id}
                    data-cursor="sale"
                    className="group cursor-pointer"
                  >
                    <Link to={`/product/${product.id}`} className="relative overflow-hidden rounded-2xl mb-4 bg-gray-100 aspect-[3/4] block">
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-2 bg-red-500 text-white text-lg font-bold rounded-full">
                          -{discountPercent}%
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Limited Stock</span>
                            <span className="text-xs text-red-500 font-semibold">Hurry!</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full w-[35%]" />
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-red-500">${price.toFixed(2)}</span>
                      {hasDiscount && (
                        <span className="text-gray-400 line-through">${product.base_price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No flash sale products available</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900 text-white" data-scroll>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-400">On orders over $50</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>
              <p className="text-gray-400">30-day return policy</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-400">Handpicked products</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
