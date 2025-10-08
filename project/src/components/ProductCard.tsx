import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist, items: wishlistItems } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [inWishlist, setInWishlist] = useState(isInWishlist(product.id));

  // Update local state when wishlist items change
  useEffect(() => {
    setInWishlist(isInWishlist(product.id));
  }, [wishlistItems, product.id, isInWishlist]);

  const price = product.sale_price || product.base_price;
  const hasDiscount = product.sale_price && product.sale_price < product.base_price;
  const mainImage = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400';

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      if (inWishlist) {
        // Find the wishlist item ID for this product
        const item = (await supabase
          .from('wishlist_items')
          .select('id')
          .eq('product_id', product.id)
          .maybeSingle()).data;

        if (item) {
          // Immediately update local state for responsive UI
          setInWishlist(false);
          
          // Remove from wishlist
          await removeFromWishlist(item.id);
          showToast('Removed from wishlist', 'info');
        }
      } else {
        // Immediately update local state for responsive UI
        setInWishlist(true);
        
        // Add to wishlist
        await addToWishlist(product.id);
        showToast('Added to wishlist!', 'success');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      // Revert local state if operation failed
      setInWishlist(isInWishlist(product.id));
      showToast('Failed to update wishlist', 'error');
    }
  };

  const handleAddToCart = async () => {
    try {
      const { data: variants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
        .gt('stock_quantity', 0)
        .limit(1);

      if (variants && variants.length > 0) {
        await addToCart(product.id, variants[0].id, 1);
        showToast('Added to cart!', 'success');
      } else {
        showToast('Product is out of stock', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add to cart', 'error');
    }
  };

  return (
    <div
      data-cursor="shirt"
      className={`group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
        viewMode === 'list' ? 'flex' : 'flex flex-col'
      }`}
    >
      <Link
        to={`/product/${product.id}`}
        className={`relative overflow-hidden bg-gray-100 flex-shrink-0 ${
          viewMode === 'list' ? 'w-64 h-80' : 'w-full aspect-[3/4]'
        }`}
      >
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.is_new && (
            <span className="px-2.5 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-md">
              NEW
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-md">
              -{Math.round((1 - product.sale_price! / product.base_price) * 100)}%
            </span>
          )}
        </div>

        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:scale-110 transition-all z-10"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <span 
            className={`text-lg ${inWishlist ? 'text-red-500' : 'text-gray-400'}`}
          >
            ❤
          </span>
        </button>
      </Link>

      <div className={`p-5 flex flex-col flex-1 ${viewMode === 'list' ? 'justify-between' : ''}`}>
        <div>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-teal-500 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-teal-600">${price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">${product.base_price.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 active:scale-95 transition-all"
          >
            <ShoppingCart size={18} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;