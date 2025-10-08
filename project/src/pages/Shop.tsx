import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Grid2x2 as Grid, List, SlidersHorizontal, ShoppingCart, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../components/Toast';

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState('featured');
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [activeVoucher, setActiveVoucher] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Xử lý voucher từ URL
  useEffect(() => {
    const voucherFromURL = searchParams.get('voucher');
    if (voucherFromURL) {
      setActiveVoucher(voucherFromURL);
      // Lưu vào localStorage để có thể sử dụng sau này
      localStorage.setItem('activeVoucher', voucherFromURL);
      showToast(`Voucher ${voucherFromURL} đã được kích hoạt. Thêm sản phẩm vào giỏ hàng để sử dụng!`, 'success');
    }
  }, [searchParams, showToast]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase.from('products').select('*').eq('status', 'active'),
        supabase.from('categories').select('id, slug')
      ]);

      if (productsResult.error) throw productsResult.error;

      const categoryMap: Record<string, string> = {};
      categoriesResult.data?.forEach(cat => {
        categoryMap[cat.slug] = cat.id;
      });

      setCategories(categoryMap);
      setAllProducts(productsResult.data || []);
      filterAndSortProducts(productsResult.data || [], selectedCategory, sortBy, searchQuery, priceRange);
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = useCallback((
    productList: Product[],
    category: string,
    sort: string,
    search: string,
    price: number[]
  ) => {
    let filtered = [...productList];

    if (category !== 'all' && categories[category]) {
      filtered = filtered.filter(p => p.category_id === categories[category]);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    filtered = filtered.filter((product) => {
      const productPrice = product.sale_price || product.base_price;
      return productPrice >= price[0] && productPrice <= price[1];
    });

    switch (sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.base_price - b.base_price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.base_price - a.base_price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    setProducts(filtered);
  }, [categories]);

  useEffect(() => {
    if (allProducts.length > 0) {
      filterAndSortProducts(allProducts, selectedCategory, sortBy, searchQuery, priceRange);
    }
  }, [selectedCategory, sortBy, searchQuery, priceRange, allProducts, filterAndSortProducts]);

  useEffect(() => {
    if (allProducts.length > 0) {
      const delayDebounceFn = setTimeout(() => {
        filterAndSortProducts(allProducts, selectedCategory, sortBy, searchQuery, priceRange);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, priceRange, allProducts, filterAndSortProducts, selectedCategory, sortBy]);

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

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #3b82f6 100%)',
          backgroundSize: '100% 100%',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {activeVoucher && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg flex items-center gap-3">
            <Tag className="text-yellow-500" size={20} />
            <div>
              <p className="font-semibold text-yellow-800">
                Voucher <span className="font-mono bg-yellow-200 px-2 py-0.5 rounded">{activeVoucher}</span> đã được kích hoạt!
              </p>
              <p className="text-yellow-700 text-sm">
                Thêm sản phẩm vào giỏ hàng và tiến hành thanh toán để áp dụng voucher này.
              </p>
            </div>
          </div>
        )}
        
        <div className="mb-8" data-aos="fade-up">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Shop All</h1>
          <p className="text-gray-600">Discover our complete collection</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {showFilters && (
            <aside className="lg:w-64 space-y-6" data-aos="fade-right">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-semibold text-lg mb-4">Categories</h3>
                <div className="space-y-2">
                  {['all', 'men', 'women', 'kids', 'accessories'].map((category) => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="rounded-full border-gray-300"
                      />
                      <span className="capitalize">{category === 'all' ? 'All Products' : category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-semibold text-lg mb-4">Price Range</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange([0, 200]);
                  setSearchQuery('');
                }}
                className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All Filters
              </button>
            </aside>
          )}

          <main className="flex-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6" data-aos="fade-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <SlidersHorizontal size={20} />
                    <span>Filters</span>
                  </button>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid' ? 'bg-teal-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      <Grid size={20} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list' ? 'bg-teal-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      <List size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                {loading ? 'Loading...' : `${products.length} products found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-2xl text-gray-600 mb-4">No products found</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange([0, 200]);
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {products.map((product, index) => {
                  const price = product.sale_price || product.base_price;
                  const hasDiscount = product.sale_price && product.sale_price < product.base_price;
                  const mainImage = Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400';

                  return (
                    <div
                      key={product.id}
                      data-aos="fade-up"
                      data-aos-delay={Math.min(index * 50, 300)}
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
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product.id);
                          }}
                          className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:scale-110 transition-all z-10"
                          aria-label="Add to wishlist"
                        >
                          <span className={`text-lg ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'}`}>
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
                              handleAddToCart(product.id);
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
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
