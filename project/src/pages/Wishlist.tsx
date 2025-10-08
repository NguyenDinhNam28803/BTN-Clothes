import { Link } from 'react-router-dom';
import { X, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';

export default function Wishlist() {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [isAddingAll, setIsAddingAll] = useState(false);

  const removeItem = (id: string) => {
    removeFromWishlist(id);
  };
  
  const addAllToCart = async () => {
    setIsAddingAll(true);
    
    try {
      // Filter items that are available (status = active)
      const availableItems = items.filter(item => item.product && item.product.status === 'active');
      
      if (availableItems.length === 0) {
        showToast('No available items to add to cart', 'warning');
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
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-3xl font-serif mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-8">Start adding your favorite items</p>
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
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #f43f5e 100%)',
          backgroundSize: '100% 100%',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif mb-2">My Wishlist</h1>
            <p className="text-gray-600">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>
          <button 
            onClick={addAllToCart} 
            disabled={isAddingAll}
            className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              data-cursor="shirt"
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                <img
                  src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                  alt={item.product?.name || 'Product'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <X size={20} />
                </button>
                {item.product && item.product.status !== 'active' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="px-4 py-2 bg-red-500 text-white font-semibold rounded-full">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-teal-500 transition-colors">
                  {item.product?.name || 'Product'}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-bold">
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
                    onClick={async () => {
                      const { data: variants } = await supabase
                        .from('product_variants')
                        .select('*')
                        .eq('product_id', item.product_id)
                        .gt('stock_quantity', 0)
                        .limit(1);
                        
                      if (variants && variants.length > 0) {
                        await addToCart(item.product_id, variants[0].id, 1);
                        showToast('Added to cart!', 'success');
                      } else {
                        showToast('Product is out of stock', 'error');
                      }
                    }} 
                    className="w-full flex items-center justify-center gap-2 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                ) : (
                  <button className="w-full py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed">
                    Notify Me
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-serif mb-4">Share Your Wishlist</h3>
          <p className="text-gray-600 mb-6">
            Share your wishlist with friends and family
          </p>
          <div className="flex gap-4">
            <input
              type="text"
              value="https://btnclothes.com/wishlist/abc123"
              readOnly
              aria-label="Wishlist share link"
              title="Wishlist share link"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
            />
            <button className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors">
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
