import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { getProductImage, getProductImages } from '../data/productImages';

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
  
  // Get product image from the image mapping
  let mainImage;
  
  // Ensure images is an array
  let imageArray: string[] = [];
  if (typeof product.images === 'string') {
    try {
      imageArray = JSON.parse(product.images);
    } catch (e) {
      console.error('Error parsing product images:', e);
    }
  } else if (Array.isArray(product.images)) {
    imageArray = product.images;
  }
  
  if (imageArray.length > 0) {
    // Try to get the image from the product ID first
    const productImages = getProductImages(product.id);
    if (productImages.length > 0) {
      mainImage = productImages[0];
    } else {
      // If not found by ID, try to get by image path
      mainImage = getProductImage(imageArray[0]) || 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400';
    }
  } else {
    mainImage = 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400';
  }

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
      className={`group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 ${
        viewMode === 'list' ? 'flex' : 'flex flex-col'
      }`}
    >
      <Link
        to={`/product/${product.id}`}
        className={`relative overflow-hidden bg-off-white flex-shrink-0 ${
          viewMode === 'list' ? 'w-64 h-80' : 'w-full aspect-[4/5]'
        }`}
      >
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.is_new && (
            <span className="px-4 py-1.5 bg-sage-green text-white text-xs font-medium rounded-md">
              NEW
            </span>
          )}
          {hasDiscount && (
            <span className="px-4 py-1.5 bg-red-500 text-white text-xs font-medium rounded-md">
              -{Math.round((1 - product.sale_price! / product.base_price) * 100)}%
            </span>
          )}
        </div>

        <button
          onClick={toggleWishlist}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-all z-10"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`w-5 h-5 ${inWishlist ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-gray-500'}`} 
            viewBox="0 0 24 24" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-gray-800/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
      </Link>

      <div className={`p-4 flex flex-col flex-1 ${viewMode === 'list' ? 'justify-between' : ''}`}>
        <div>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-medium text-lg mb-1 group-hover:text-olive-gold transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm mb-3 line-clamp-1 font-light">
            {product.description}
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-semibold text-gray-900">${price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">${product.base_price.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-olive-gold text-white text-sm font-medium rounded-none hover:bg-olive-gold/90 transition-all"
          >
            <ShoppingCart size={16} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;