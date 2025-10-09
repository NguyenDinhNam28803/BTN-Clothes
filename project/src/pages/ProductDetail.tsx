import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Share2, ChevronRight, Minus, Plus, Star, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, ProductVariant, Review } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { getProductImage, getProductImages } from '../data/productImages';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const loadProductData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (productError) throw productError;
        if (!productData) {
          showToast('Product not found', 'error');
          navigate('/shop');
          return;
        }

        setProduct(productData);

        // Fetch variants
        const { data: variantsData } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', id)
          .order('size', { ascending: true });

        setVariants(variantsData || []);
        if (variantsData && variantsData.length > 0) {
          setSelectedVariant(variantsData[0]);
        }

        // Fetch reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        setReviews(reviewsData || []);

        // Fetch related products (same category)
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', productData.category_id)
          .eq('status', 'active')
          .neq('id', id)
          .limit(4);

        setRelatedProducts(relatedData || []);
      } catch (error) {
        console.error('Error loading product:', error);
        showToast('Failed to load product', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadProductData();
    }
  }, [id, navigate, showToast]);

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) {
      showToast('Please select a variant', 'error');
      return;
    }

    if (selectedVariant.stock_quantity < quantity) {
      showToast('Not enough stock available', 'error');
      return;
    }

    try {
      await addToCart(product.id, selectedVariant.id, quantity);
      showToast('Added to cart!', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add to cart', 'error');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const toggleWishlist = async () => {
    if (!product) return;

    const inWishlist = isInWishlist(product.id);

    try {
      if (inWishlist) {
        const item = (await supabase
          .from('wishlist_items')
          .select('id')
          .eq('product_id', product.id)
          .maybeSingle()).data;

        if (item) {
          await removeFromWishlist(item.id);
          showToast('Removed from wishlist', 'info');
        }
      } else {
        await addToWishlist(product.id);
        showToast('Added to wishlist!', 'success');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showToast('Failed to update wishlist', 'error');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showToast('Please login to submit a review', 'error');
      return;
    }

    if (!product) return;

    if (!reviewTitle.trim() || !reviewComment.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: product.id,
        user_id: user.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        is_approved: false, // Requires admin approval
      });

      if (error) throw error;

      showToast('Review submitted! It will appear after approval.', 'success');
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const uniqueSizes = [...new Set(variants.map(v => v.size))];
  const uniqueColors = [...new Set(variants.map(v => v.color))];
  
  // Get proper images using the helper functions
  let processedImages: string[] = [];
  if (product) {
    // First try to get images from product ID
    const productIdImages = getProductImages(product.id);
    if (productIdImages.length > 0) {
      processedImages = productIdImages;
    } else {
      // Parse images if they're stored as a JSON string
      let imageArray: string[] = [];
      if (typeof product.images === 'string') {
        try {
          imageArray = JSON.parse(product.images);
        } catch (e) {
          console.error('Error parsing product images:', e);
          imageArray = [];
        }
      } else if (Array.isArray(product.images)) {
        imageArray = product.images;
      }
      
      // Then try to map image paths to actual imported images
      if (imageArray.length > 0) {
        processedImages = imageArray.map(
          imgPath => getProductImage(imgPath) || imgPath
        ).filter(Boolean) as string[];
      }
    }
  }
  
  const images = processedImages.length > 0 
    ? processedImages 
    : [];
  const price = product?.sale_price || product?.base_price || 0;
  const hasDiscount = product?.sale_price && product.sale_price < product.base_price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.sale_price! / product.base_price) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-3">Product not found</p>
          <Link to="/shop" className="text-teal-500 hover:text-teal-600 text-sm">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-8 bg-gray-50 compact-product-detail">
      <div className="container max-w-5xl mx-auto px-2">
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-3 fade-shift-transition">
          <Link to="/" className="hover:text-olive-gold transition-colors duration-300">Home</Link>
          <ChevronRight size={10} />
          <Link to="/shop" className="hover:text-olive-gold transition-colors duration-300">Shop</Link>
          <ChevronRight size={10} />
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div
              data-cursor="zoom"
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden shared-element-container"
            >
              <img
                src={images[selectedImage] || 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={product.name}
                className="w-full h-full object-cover shared-element-transition"
              />
              {hasDiscount && (
                <div className="absolute top-2 left-2 fade-transition">
                  <span className="px-2 py-1 bg-olive-gold text-white text-xs font-bold rounded-none">
                    -{discountPercent}% OFF
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 rounded-md overflow-hidden border transition-all duration-300 slide-transition ${
                      selectedImage === index ? 'border-olive-gold' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover fade-transition" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-xl font-serif mb-2">{product.name}</h1>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={16} 
                    fill={star <= Number(getAverageRating()) ? "#fbbf24" : "none"} 
                    className={star <= Number(getAverageRating()) ? "text-yellow-400" : "text-gray-300"} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">({reviews.length} reviews)</span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-bold text-olive-gold">${price.toFixed(2)}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">${product.base_price.toFixed(2)}</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 mb-3 leading-relaxed text-sm">
              {product.description.length > 200 
                ? `${product.description.substring(0, 200)}...` 
                : product.description}
            </p>

            <div className="mb-3">
              {selectedVariant && selectedVariant.stock_quantity > 0 ? (
                <div className="flex items-center gap-1 mb-1">
                  <Check size={16} className="text-green-500" />
                  <span className="text-green-600 text-xs font-medium">In Stock - Ready to Ship</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-red-600 text-xs font-medium">Out of Stock</span>
                </div>
              )}
              <p className="text-xs text-gray-600">SKU: {selectedVariant?.sku || 'N/A'}</p>
            </div>

            {uniqueSizes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold">Size: {selectedVariant?.size}</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => {
                    const sizeVariants = variants.filter(v => v.size === size);
                    const hasStock = sizeVariants.some(v => v.stock_quantity > 0);
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          const variant = sizeVariants.find(v => v.stock_quantity > 0) || sizeVariants[0];
                          setSelectedVariant(variant);
                        }}
                        disabled={!hasStock}
                        title={`Size ${size}${!hasStock ? ' - Out of stock' : ''}`}
                        className={`py-2 px-3 border rounded-md text-sm font-medium transition-all duration-300 slide-transition ${
                          selectedVariant?.size === size
                            ? 'border-olive-gold bg-olive-gold/5 text-olive-gold'
                            : hasStock
                            ? 'border-gray-300 hover:border-gray-400'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {uniqueColors.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-semibold mb-2 block">Color: {selectedVariant?.color}</label>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((color) => {
                    const colorVariants = variants.filter(v => v.color === color);
                    const hasStock = colorVariants.some(v => v.stock_quantity > 0);
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          const variant = colorVariants.find(v => v.stock_quantity > 0) || colorVariants[0];
                          setSelectedVariant(variant);
                        }}
                        disabled={!hasStock}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-300 slide-transition color-${color.toLowerCase().replace(/[^a-z0-9]/g, '-')} ${
                          selectedVariant?.color === color
                            ? 'border-olive-gold scale-105'
                            : hasStock
                            ? 'border-gray-300 hover:border-gray-400'
                            : 'border-gray-200 opacity-50 cursor-not-allowed'
                        }`}
                        title={color}
                        data-color={color.toLowerCase()}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm font-semibold mb-2 block">Quantity</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-gray-100 rounded-md p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 hover:bg-white rounded transition-colors"
                    title="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariant?.stock_quantity || 999, quantity + 1))}
                    className="p-1 hover:bg-white rounded transition-colors"
                    title="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-xs text-gray-600">{selectedVariant?.stock_quantity || 0} available</span>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock_quantity < 1}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-olive-gold text-white text-xs font-medium rounded-md hover:bg-olive-gold/90 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed fade-shift-transition"
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>
              <button
                onClick={toggleWishlist}
                title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                className={`p-1.5 border rounded-md transition-all duration-300 fade-transition ${
                  isInWishlist(product.id)
                    ? 'border-red-500 bg-red-50 text-red-500'
                    : 'border-gray-300 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart size={18} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
              </button>
              <button 
                title="Share product"
                className="p-1.5 border border-gray-300 rounded-md hover:border-gray-400 transition-all duration-300 fade-transition"
              >
                <Share2 size={18} />
              </button>
            </div>

            <button 
              onClick={handleBuyNow}
              disabled={!selectedVariant || selectedVariant.stock_quantity < 1}
              className="w-full py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
                  🚚
                </div>
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-gray-600 text-xs">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  🔄
                </div>
                <div>
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-gray-600 text-xs">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Authentic Product</p>
                  <p className="text-gray-600 text-xs">100% genuine guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 mb-3 border-b">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors relative ${
                  activeTab === tab
                    ? 'text-olive-gold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-olive-gold" />
                )}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-2">Product Description</h3>
              <p className="text-gray-600 text-sm mb-3 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Specifications</h3>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Material', '100% Premium Cotton'],
                    ['Fit', 'Regular'],
                    ['Collar', 'Classic'],
                    ['Sleeve Length', 'Long Sleeve'],
                    ['Care Instructions', 'Machine wash cold, tumble dry low'],
                    ['Country of Origin', 'Vietnam'],
                    ['Weight', '250g'],
                  ].map(([key, value], index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{key}</td>
                      <td className="py-2 text-gray-600">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Customer Reviews</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={16} 
                          fill={star <= Number(getAverageRating()) ? "#fbbf24" : "none"} 
                          className={star <= Number(getAverageRating()) ? "text-yellow-400" : "text-gray-300"} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">
                      {reviews.length > 0 ? `${getAverageRating()} out of 5 (${reviews.length} reviews)` : 'No reviews yet'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Form */}
              <div className="bg-gray-50 rounded-md p-2.5 mb-3">
                <h4 className="text-sm font-semibold mb-2">Write a Review</h4>
                {user ? (
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="transition-transform hover:scale-110"
                            title={`${star} star${star > 1 ? 's' : ''}`}
                          >
                            <Star
                              size={20}
                              fill={star <= reviewRating ? "#fbbf24" : "none"}
                              className={star <= reviewRating ? "text-yellow-400" : "text-gray-300"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Title</label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Sum up your review"
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-olive-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Comment</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this product"
                        rows={3}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-olive-gold"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-3 py-1 text-xs bg-olive-gold text-white font-medium rounded-md hover:bg-olive-gold/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-gray-600">
                    Please <Link to="/login" className="text-olive-gold hover:underline">log in</Link> to write a review.
                  </p>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-md p-2.5">
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <div className="flex items-center gap-0.5 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                size={12} 
                                fill={star <= review.rating ? "#fbbf24" : "none"} 
                                className={star <= review.rating ? "text-yellow-400" : "text-gray-300"} 
                              />
                            ))}
                          </div>
                          <h4 className="font-medium text-sm">{review.title}</h4>
                          <p className="text-xs text-gray-600">Verified Buyer</p>
                        </div>
                        <span className="text-xs text-gray-600">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-600">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-serif mb-3">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedProducts.map((item) => (
              <div key={item.id} data-cursor="shirt">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
