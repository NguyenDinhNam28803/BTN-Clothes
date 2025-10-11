import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, TrendingUp, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../components/Toast';
import ProductCard from '../components/ProductCard';

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
        .limit(9);

      // Fetch flash sale products (products with sale_price)
      const { data: saleProducts } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .not('sale_price', 'is', null)
        .order('created_at', { ascending: false })
        .limit(3);

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
    <div className="min-h-screen w-screen max-w-[100vw] overflow-x-hidden">
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 z-0 w-full h-full object-cover shared-element-transition"
          style={{ objectFit: 'cover', transform: 'scale(1.05)' }}
          src="/src/Assets/IMG/BTN.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep-navy/60 to-black/40 z-10" />

        <div className="relative z-20 text-center text-white px-4 max-w-4xl">
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-display mb-8 tracking-wider leading-tight fade-shift-transition slide-up-enter slide-up-enter-active"
            data-aos="fade-up"
          >
            Elevate Your Style
          </h1>
          <p className="text-xl md:text-2xl mb-12 font-light fade-shift-transition slide-up-enter slide-up-enter-active" data-aos="fade-up" data-aos-delay="200">
            Discover timeless elegance in our curated collection
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center fade-shift-transition" data-aos="fade-up" data-aos-delay="400">
            <Link
              to="/shop"
              className="px-10 py-4 bg-olive-gold text-white font-medium text-sm uppercase tracking-wider rounded-none hover:bg-white hover:text-deep-navy transition-all duration-300 transform hover:scale-102 shadow-lg slide-transition slide-left-enter slide-left-enter-active"
            >
              Shop Now
            </Link>
            <Link
              to="/new-arrivals"
              className="px-10 py-4 border border-white text-white font-medium text-sm uppercase tracking-wider rounded-none hover:border-olive-gold hover:bg-transparent hover:text-olive-gold transition-all duration-300 transform hover:scale-102 slide-transition slide-right-enter slide-right-enter-active"
            >
              New Collection
            </Link>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-7 h-12 border border-white/70 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-scroll-down" />
          </div>
        </div>
      </section>

      <section
        className="py-24 relative w-full bg-luxury-section"
        data-scroll
      >
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-display mb-6 tracking-wide text-deep-navy">Featured Collections</h2>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">Discover our curated selection of timeless elegance</p>
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
                className="group relative h-96 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 shared-element-container"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 shared-element-transition"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white fade-transition">
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

      <section className="py-24 bg-luxury-lines w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20" data-aos="fade-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="text-sage-green" size={24} strokeWidth={1.5} />
              <h2 className="text-4xl md:text-5xl font-display tracking-wide text-deep-navy">New Arrivals</h2>
              <Sparkles className="text-sage-green" size={24} strokeWidth={1.5} />
            </div>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">Discover our latest curated collection</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))
            ) : newArrivals.length > 0 ? (
              newArrivals.map((product, index) => (
                <div 
                  key={product.id}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                >
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No new arrivals available</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-olive-gold text-white font-semibold rounded-full hover:bg-deep-navy transition-colors slide-transition"
            >
              View All Products
              <ArrowRight size={20} className="slide-transition" />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="py-24 relative w-full bg-luxury-dots"
        data-scroll
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="text-muted-rust" size={28} strokeWidth={1.5} />
              <h2 className="text-4xl md:text-5xl font-display tracking-wide text-deep-navy">Limited Offers</h2>
              <Sparkles className="text-muted-rust" size={28} strokeWidth={1.5} />
            </div>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto mb-8">Exclusive pieces available for a limited time</p>

            <div className="flex justify-center gap-6" data-cursor="sale">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds },
              ].map((time, index) => (
                <div 
                  key={index} 
                  className={`bg-white/90 backdrop-blur-sm border border-olive-gold/20 rounded-md p-6 shadow-sm min-w-[90px] transition-transform hover:scale-102 luxury-hover shared-element-transition ${index === 3 ? 'animate-pulse-custom' : ''}`}
                >
                  <div className="text-3xl font-serif font-normal text-muted-rust mb-1 fade-transition">
                    {String(time.value).padStart(2, '0')}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-deep-navy/70 font-medium fade-shift-transition">
                    {time.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))
            ) : flashSaleProducts.length > 0 ? (
              flashSaleProducts.map((product) => (
                <div
                  key={product.id}
                  data-cursor="sale"
                >
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No flash sale products available</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 bg-deep-navy bg-luxury-marble text-white w-full" data-scroll>
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display mb-6 tracking-wide fade-transition slide-up-enter slide-up-enter-active">The BTN Experience</h2>
            <p className="text-gray-300 text-lg font-light max-w-2xl mx-auto fade-shift-transition">Discover why discerning clients choose our collections</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center luxury-parallax fade-transition">
              <div className="w-20 h-20 bg-olive-gold/90 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shared-element-transition">
                <ShoppingBag size={24} strokeWidth={1.5} className="text-white fade-transition" />
              </div>
              <h3 className="text-xl font-serif mb-3 fade-shift-transition">Swift Delivery</h3>
              <p className="text-gray-300 font-light fade-shift-transition">Premium express shipping on all orders</p>
            </div>
            <div className="text-center luxury-parallax fade-transition">
              <div className="w-20 h-20 bg-olive-gold/90 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shared-element-transition">
                <ArrowRight size={24} strokeWidth={1.5} className="text-white fade-transition" />
              </div>
              <h3 className="text-xl font-serif mb-3 fade-shift-transition">Hassle-Free Returns</h3>
              <p className="text-gray-300 font-light fade-shift-transition">30-day satisfaction guarantee</p>
            </div>
            <div className="text-center luxury-parallax fade-transition">
              <div className="w-20 h-20 bg-olive-gold/90 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shared-element-transition">
                <Sparkles size={24} strokeWidth={1.5} className="text-white fade-transition" />
              </div>
              <h3 className="text-xl font-serif mb-3 fade-shift-transition">Artisanal Quality</h3>
              <p className="text-gray-300 font-light fade-shift-transition">Curated premium materials</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
