import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Grid2x2 as Grid, List, SlidersHorizontal, ShoppingCart, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../components/Toast';
import { getProducts } from '../lib/products';
import { getProductImage } from '../data/productImages';
import { Product } from '../types';

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
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Bắt đầu tải dữ liệu sản phẩm...');
      
      // Thử truy vấn trực tiếp để kiểm tra kết nối
      const { data: directProducts, error: directError } = await supabase
        .from('products')
        .select('count(*)')
        .eq('status', 'active');
        
      if (directError) {
        console.error('Lỗi truy vấn trực tiếp:', directError);
      } else {
        console.log('Kết nối trực tiếp thành công. Số lượng sản phẩm:', directProducts);
      }
      
      // Sử dụng hàm getProducts để lấy tất cả sản phẩm
      const products = await getProducts();
      console.log('Sản phẩm đã tải:', products?.length || 0);
      
      // Lấy danh mục từ Supabase
      const categoriesResult = await supabase.from('categories').select('id, slug');
      console.log('Danh mục đã tải:', categoriesResult.data?.length || 0);
      
      if (!products || products.length === 0) {
        console.warn('Không có sản phẩm nào được tìm thấy');
        throw new Error('Không thể lấy dữ liệu sản phẩm');
      }

      const categoryMap: Record<string, string> = {};
      categoriesResult.data?.forEach(cat => {
        categoryMap[cat.slug] = cat.id;
      });

      setCategories(categoryMap);
      
      // Chuyển đổi hình ảnh sản phẩm để đảm bảo đường dẫn chính xác
      const productsWithProcessedImages = products.map(product => {
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
        
        const processedImages = imageArray.map(imagePath => {
          const image = getProductImage(imagePath);
          return image || imagePath;
        });
        
        return {
          ...product,
          images: processedImages,
          sale_price: product.sale_price || undefined
        } as Product;
      });
      
      console.log('Sản phẩm đã xử lý:', productsWithProcessedImages.length);
      setAllProducts(productsWithProcessedImages);
      filterAndSortProducts(productsWithProcessedImages, selectedCategory, sortBy, searchQuery, priceRange);
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('Không thể tải sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortBy, searchQuery, priceRange, showToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  useEffect(() => {
    // Cuộn lên đầu trang khi searchParams thay đổi
    window.scrollTo(0, 0);
    
    if (searchParams.get('focusSearch') === 'true' && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    
    if (searchParams.get('reset') === 'true') {
      setSelectedCategory('all');
      setPriceRange([0, 200]);
      setSearchQuery('');
      setSortBy('featured');
      return;
    }
    
    const categoryFromURL = searchParams.get('category');
    if (categoryFromURL && ['all', 'men', 'women', 'kids', 'accessories'].includes(categoryFromURL)) {
      setSelectedCategory(categoryFromURL);
    }
  }, [searchParams]);
  
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
        filtered.sort((a, b) => {
          // Nếu một trong hai created_at không tồn tại, đặt nó xuống cuối
          if (!a.created_at) return 1;
          if (!b.created_at) return -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
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
    <div className="min-h-screen pt-24 pb-16 bg-shop-pattern">
      <div
        className="absolute inset-0 z-0 opacity-50"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(245, 243, 238, 0.9) 0%, rgba(245, 243, 238, 0.7) 100%)',
          backgroundSize: '100% 100%',
        }}
      />

      <div className="container mx-auto px-4 z-10">
        {activeVoucher && (
          <div className="bg-discount-badge text-white p-4 mb-6 rounded-lg flex items-center gap-3 shadow-lg">
            <Tag className="text-white" size={20} />
            <div>
              <p className="font-medium font-montserrat tracking-wide">
                Voucher <span className="font-cormorant bg-white/10 backdrop-blur-sm px-3 py-1 rounded">{activeVoucher}</span> đã được kích hoạt!
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

        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          {showFilters && (
            <aside className="lg:w-64 fixed top-28 lg:self-start w-full flex-shrink-0 space-y-6 bg-shop-sidebar p-2 rounded-2xl max-h-[calc(100vh-8rem)] overflow-y-auto" style={{position: 'sticky'}} data-aos="fade-right">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-olive-gold/10">
                <h3 className="font-cormorant font-medium text-xl mb-4 text-deep-navy tracking-wide">Categories</h3>
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

              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-olive-gold/10">
                <h3 className="font-cormorant font-medium text-xl mb-4 text-deep-navy tracking-wide">Price Range</h3>
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
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6 border border-olive-gold/10 bg-shop-header" data-aos="fade-up">
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
                    ref={searchInputRef}
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
                className={`grid gap-4 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}
              >
                {products.map((product, index) => {
                  const price = product.sale_price || product.base_price;
                  const hasDiscount = product.sale_price && product.sale_price < product.base_price;
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
                  
                  const mainImage = imageArray.length > 0
                    ? imageArray[0]
                    : 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400';

                  return (
                    <div
                      key={product.id}
                      data-aos="fade-up"
                      data-aos-delay={Math.min(index * 50, 300)}
                      data-cursor="shirt"
                      className={`group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
                        viewMode === 'list' ? 'flex' : 'flex flex-col'
                      } slide-transition`}
                    >
                      <Link
                        to={`/product/${product.id}`}
                        className={`relative overflow-hidden bg-gray-100 flex-shrink-0 shared-element-container ${
                          viewMode === 'list' ? 'w-64 h-80' : 'w-full aspect-[4/5]'
                        }`}
                      >
                        <img
                          src={mainImage}
                          alt={product.name}
                          className="w-full h-full object-cover shared-element-transition image-zoom-effect"
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
                          className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:scale-110 transition-all z-10 fade-transition"
                          aria-label="Add to wishlist"
                        >
                          <span className={`text-lg ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'}`}>
                            ❤
                          </span>
                        </button>
                      </Link>

                      <div className={`p-3 flex flex-col flex-1 ${viewMode === 'list' ? 'justify-between' : ''} fade-shift-transition`}>
                        <div>
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-semibold text-base mb-1 line-clamp-1 group-hover:text-olive-gold transition-colors duration-300">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-gray-600 text-xs mb-2 line-clamp-1">
                            {product.description}
                          </p>
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-lg font-bold text-teal-600">${price.toFixed(2)}</span>
                            {hasDiscount && (
                              <span className="text-xs text-gray-400 line-through">${product.base_price.toFixed(2)}</span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product.id);
                            }}
                            className="w-full flex items-center justify-center gap-1 py-1.5 text-sm bg-olive-gold text-white font-medium rounded-lg hover:bg-olive-gold/90 active:scale-95 transition-all duration-300 fade-shift-transition"
                          >
                            <ShoppingCart size={16} />
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
