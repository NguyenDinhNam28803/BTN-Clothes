import { Link } from 'react-router-dom';
import { useState } from 'react';
import { X, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [isAddingAll, setIsAddingAll] = useState(false);

  const removeItem = (id: string) => {
    // Add the removing class to trigger animation before actual removal
    const itemElement = document.querySelector(`[data-wishlist-id="${id}"]`);
    if (itemElement) {
      itemElement.classList.add('wishlist-item-removing');
      // Wait for animation to complete before removing from state
      setTimeout(() => {
        removeFromWishlist(id);
      }, 300); // Match the animation duration (0.3s)
    } else {
      removeFromWishlist(id);
    }
  };
  
  const addAllToCart = async () => {
    setIsAddingAll(true);
    
    try {
      // Filter items that are available (status = active)
      const availableItems = items.filter(item => item.product && item.product.status === 'active');
      
      if (availableItems.length === 0) {
        showToast('No available items to add to cart', 'info');
        return;
      }
      
      // For each available product, get a variant and add to cart
      let addedCount = 0;
      for (const item of availableItems) {
        // Get the first available variant for this product
        const { data: variants } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', item.product_id)
          .gt('stock_quantity', 0)
          .limit(1);
          
        if (variants && variants.length > 0) {
          await addToCart(item.product_id, variants[0].id, 1);
          addedCount++;
        }
      }
      
      if (addedCount > 0) {
        showToast(`Added ${addedCount} item${addedCount > 1 ? 's' : ''} to cart!`, 'success');
      } else {
        showToast('No items could be added to cart', 'error');
      }
    } catch (error) {
      console.error('Error adding items to cart:', error);
      showToast('Failed to add items to cart', 'error');
    } finally {
      setIsAddingAll(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-wishlist-pattern">
        <div 
          className="absolute inset-0 z-0 opacity-80"
          style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(250, 249, 246, 0.95) 0%, rgba(245, 243, 238, 0.85) 100%)',
            backgroundSize: '100% 100%',
          }}
        />
        <div className="text-center relative z-10">
          <Loader2 className="h-12 w-12 animate-spin text-olive-gold mx-auto mb-6" />
          <p className="text-lg font-montserrat text-deep-navy/70 tracking-wide">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-wishlist-pattern">
        <div 
          className="absolute inset-0 z-0 opacity-80"
          style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(250, 249, 246, 0.95) 0%, rgba(245, 243, 238, 0.85) 100%)',
            backgroundSize: '100% 100%',
          }}
        />
        <div className="text-center bg-white bg-opacity-70 backdrop-blur-sm p-12 border border-olive-gold/10 shadow-sm relative z-10 max-w-md">
          <div className="mb-6 text-olive-gold opacity-30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
            </svg>
          </div>
          <h2 className="text-3xl font-cormorant font-light text-deep-navy mb-4">Your Wishlist is Empty</h2>
          <p className="text-deep-navy/60 font-montserrat text-sm mb-10">Discover and save your favorite pieces</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-olive-gold text-white font-montserrat tracking-wider text-xs uppercase rounded-none hover:bg-olive-gold/90 transition-all duration-300"
          >
            Explore Collection
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-wishlist-pattern">
      <div
        className="absolute inset-0 z-0 opacity-80"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(250, 249, 246, 0.95) 0%, rgba(245, 243, 238, 0.85) 100%)',
          backgroundSize: '100% 100%',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 bg-wishlist-header p-8 border-b border-olive-gold/20 slide-transition">
          <div className="fade-shift-transition">
            <h1 className="text-4xl md:text-5xl font-cormorant text-deep-navy font-light tracking-wide mb-4">My Wishlist</h1>
            <p className="font-montserrat text-sm text-deep-navy/70 tracking-wider uppercase">{items.length} {items.length === 1 ? 'item' : 'items'} saved</p>
          </div>
          <button 
            onClick={addAllToCart} 
            disabled={isAddingAll}
            className="mt-6 md:mt-0 px-8 py-3 bg-olive-gold text-white font-montserrat tracking-wider text-sm uppercase rounded-none hover:bg-olive-gold/90 transition-all duration-300 flex items-center gap-2 border border-olive-gold/30 shadow-sm fade-transition"
          >
            {isAddingAll ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart size={20} />
                Add All to Cart
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              data-wishlist-id={item.id}
              className="relative wishlist-item-remove"
            >
              {item.product && (
                <>
                  <ProductCard product={item.product} />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-none shadow-sm border border-olive-gold/20 hover:bg-olive-gold/10 hover:text-deep-navy fade-transition"
                    aria-label="Remove from wishlist"
                  >
                    <X size={18} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white bg-opacity-80 backdrop-blur-sm p-8 border border-olive-gold/10 shadow-sm slide-transition">
          <h3 className="text-2xl font-cormorant font-light mb-3 text-deep-navy fade-shift-transition">Share Your Wishlist</h3>
          <p className="text-deep-navy/60 mb-8 font-montserrat text-sm fade-shift-transition">
            Share your wishlist with friends and family
          </p>
          <div className="flex gap-4 fade-shift-transition">
            <input
              type="text"
              value="https://btnclothes.com/wishlist/abc123"
              readOnly
              aria-label="Wishlist share link"
              title="Wishlist share link"
              className="flex-1 px-4 py-3 border border-olive-gold/20 rounded-none bg-off-white font-montserrat text-sm slide-transition"
            />
            <button className="px-6 py-3 bg-olive-gold text-white font-montserrat tracking-wider text-xs uppercase rounded-none hover:bg-olive-gold/90 transition-all duration-300 slide-transition">
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
