import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Share2, ChevronRight, Minus, Plus, Star, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, ProductVariant, Review } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

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
    if (id) {
      loadProductData();
    }
  }, [id]);

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
  
  const images = product?.images || [];
  const price = product?.sale_price || product?.base_price || 0;
  const hasDiscount = product?.sale_price && product.sale_price < product.base_price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.sale_price! / product.base_price) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-600 mb-4">Product not found</p>
          <Link to="/shop" className="text-teal-500 hover:text-teal-600">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-teal-500">Home</Link>
          <ChevronRight size={16} />
          <Link to="/shop" className="hover:text-teal-500">Shop</Link>
          <ChevronRight size={16} />
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div
              data-cursor="zoom"
              className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden"
            >
              <img
                src={images[selectedImage] || 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {hasDiscount && (
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full">
                    -{discountPercent}% OFF
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-teal-500' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-4xl font-serif mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={20} 
                    fill={star <= Number(getAverageRating()) ? "#fbbf24" : "none"} 
                    className={star <= Number(getAverageRating()) ? "text-yellow-400" : "text-gray-300"} 
                  />
                ))}
              </div>
              <span className="text-gray-600">({reviews.length} reviews)</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold text-teal-500">${price.toFixed(2)}</span>
              {hasDiscount && (
                <>
                  <span className="text-2xl text-gray-400 line-through">${product.base_price.toFixed(2)}</span>
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.description}
            </p>

            <div className="mb-6">
              {selectedVariant && selectedVariant.stock_quantity > 0 ? (
                <div className="flex items-center gap-2 mb-2">
                  <Check size={20} className="text-green-500" />
                  <span className="text-green-600 font-medium">In Stock - Ready to Ship</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </div>
              )}
              <p className="text-sm text-gray-600">SKU: {selectedVariant?.sku || 'N/A'}</p>
            </div>

            {uniqueSizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold">Size: {selectedVariant?.size}</label>
                </div>
                <div className="flex flex-wrap gap-3">
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
                        className={`py-3 px-4 border-2 rounded-lg font-medium transition-all ${
                          selectedVariant?.size === size
                            ? 'border-teal-500 bg-teal-50 text-teal-500'
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
              <div className="mb-6">
                <label className="font-semibold mb-3 block">Color: {selectedVariant?.color}</label>
                <div className="flex gap-3">
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
                        className={`w-12 h-12 rounded-full border-4 transition-all ${
                          selectedVariant?.color === color
                            ? 'border-teal-500 scale-110'
                            : hasStock
                            ? 'border-gray-300 hover:border-gray-400'
                            : 'border-gray-200 opacity-50 cursor-not-allowed'
                        }`}
                        title={color}
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="font-semibold mb-3 block">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 bg-gray-100 rounded-lg p-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-white rounded transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariant?.stock_quantity || 999, quantity + 1))}
                    className="p-2 hover:bg-white rounded transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <span className="text-gray-600">{selectedVariant?.stock_quantity || 0} pieces available</span>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <button 
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock_quantity < 1}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              <button
                onClick={toggleWishlist}
                className={`p-4 border-2 rounded-lg transition-all ${
                  isInWishlist(product.id)
                    ? 'border-red-500 bg-red-50 text-red-500'
                    : 'border-gray-300 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart size={24} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
              </button>
              <button className="p-4 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <Share2 size={24} />
              </button>
            </div>

            <button 
              onClick={handleBuyNow}
              disabled={!selectedVariant || selectedVariant.stock_quantity < 1}
              className="w-full py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  🚚
                </div>
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-gray-600">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  🔄
                </div>
                <div>
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-gray-600">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Authentic Product</p>
                  <p className="text-gray-600">100% genuine guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="flex gap-4 mb-8 border-b">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold capitalize transition-colors relative ${
                  activeTab === tab
                    ? 'text-teal-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
                )}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <h3 className="text-2xl font-semibold mb-4">Product Description</h3>
              <p className="text-gray-600 mb-4 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div>
              <h3 className="text-2xl font-semibold mb-6">Specifications</h3>
              <table className="w-full">
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
                      <td className="py-4 font-semibold">{key}</td>
                      <td className="py-4 text-gray-600">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Customer Reviews</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={20} 
                          fill={star <= Number(getAverageRating()) ? "#fbbf24" : "none"} 
                          className={star <= Number(getAverageRating()) ? "text-yellow-400" : "text-gray-300"} 
                        />
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {reviews.length > 0 ? `${getAverageRating()} out of 5 (${reviews.length} reviews)` : 'No reviews yet'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Form */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h4 className="text-xl font-semibold mb-4">Write a Review</h4>
                {user ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block font-medium mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              size={32}
                              fill={star <= reviewRating ? "#fbbf24" : "none"}
                              className={star <= reviewRating ? "text-yellow-400" : "text-gray-300"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Sum up your review"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-2">Comment</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this product"
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <p className="text-gray-600">
                    Please <Link to="/login" className="text-teal-500 hover:text-teal-600">login</Link> to write a review.
                  </p>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                size={16} 
                                fill={star <= review.rating ? "#fbbf24" : "none"} 
                                className={star <= review.rating ? "text-yellow-400" : "text-gray-300"} 
                              />
                            ))}
                          </div>
                          <h4 className="font-semibold">{review.title}</h4>
                          <p className="text-sm text-gray-600">Verified Buyer</p>
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-3xl font-serif mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                to={`/product/${item.id}`}
                data-cursor="shirt"
                className="group"
              >
                <div className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden mb-4">
                  <img
                    src={item.images[0]}
                    alt={`Related product ${item.name}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-teal-500 transition-colors">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{item.sale_price || item.base_price}</span>
                  <span className="text-gray-400 line-through text-sm">{item.base_price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
