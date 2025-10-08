import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleSearch = () => {
    navigate('/shop?focusSearch=true');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const pagesWithHero = ['/', '/home'];
  const hasHeroImage = pagesWithHero.includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !hasHeroImage ? 'bg-white shadow-lg py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className={`text-3xl font-serif tracking-wider transition-colors ${
              isScrolled || !hasHeroImage ? 'text-black' : 'text-white'
            }`}
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            BTN Clothes
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/shop"
              className={`font-medium transition-colors hover:text-teal-500 ${
                isScrolled || !hasHeroImage ? 'text-gray-800' : 'text-white'
              }`}
            >
              Shop
            </Link>
            <Link
              to="/shop?category=men"
              className={`font-medium transition-colors hover:text-teal-500 ${
                isScrolled || !hasHeroImage ? 'text-gray-800' : 'text-white'
              }`}
            >
              Men
            </Link>
            <Link
              to="/shop?category=women"
              className={`font-medium transition-colors hover:text-teal-500 ${
                isScrolled || !hasHeroImage ? 'text-gray-800' : 'text-white'
              }`}
            >
              Women
            </Link>
            <Link
              to="/sale"
              className={`font-medium transition-colors hover:text-teal-500 ${
                isScrolled || !hasHeroImage ? 'text-red-600' : 'text-red-400'
              }`}
            >
              Sale
            </Link>
            <Link
              to="/vouchers"
              className={`font-medium transition-colors hover:text-teal-500 ${
                isScrolled || !hasHeroImage ? 'text-gray-800' : 'text-white'
              }`}
            >
              Vouchers
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSearch}
              className={`p-2 transition-colors hover:text-teal-500 ${
                isScrolled || !hasHeroImage ? 'text-gray-800' : 'text-white'
              }`}
              aria-label="Search"
            >
              <Search size={24} />
            </button>
            <Link
              to="/wishlist"
              className={`p-2 transition-colors hover:text-teal-500 relative ${
                isScrolled || !hasHeroImage ? 'text-gray-800' : 'text-white'
              }`}
              aria-label="Wishlist"
            >
              <Heart size={24} />
              {getWishlistCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {getWishlistCount()}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className={`p-2 transition-colors hover:text-teal-500 relative ${
                isScrolled || !hasHeroImage ? 'text-gray-800' : 'text-white'
              }`}
              aria-label="Cart"
            >
              <ShoppingCart size={24} />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative group">
                <button
                  className={`p-2 transition-colors hover:text-teal-500 ${
                    isScrolled || !hasHeroImage ? 'text-gray-800' : 'text-white'
                  }`}
                  aria-label="Account"
                >
                  <User size={24} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    to="/account"
                    className="block px-4 py-3 text-gray-800 hover:bg-gray-50 rounded-t-lg"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-50 rounded-b-lg flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className={`p-2 transition-colors hover:text-teal-500 ${
                  isScrolled || !hasHeroImage ? 'text-gray-800' : 'text-white'
                }`}
                aria-label="Login"
              >
                <User size={24} />
              </Link>
            )}

            <button
              className={`md:hidden p-2 ${isScrolled || !hasHeroImage ? 'text-gray-800' : 'text-white'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
            <div className="flex flex-col gap-4">
              <Link to="/shop" className={`font-medium ${isScrolled || !hasHeroImage ? 'text-gray-800' : 'text-white'}`}>
                Shop
              </Link>
              <Link to="/shop?category=men" className={`font-medium ${isScrolled || !hasHeroImage ? 'text-gray-800' : 'text-white'}`}>
                Men
              </Link>
              <Link to="/shop?category=women" className={`font-medium ${isScrolled || !hasHeroImage ? 'text-gray-800' : 'text-white'}`}>
                Women
              </Link>
              <Link to="/sale" className={`font-medium ${isScrolled || !hasHeroImage ? 'text-red-600' : 'text-red-400'}`}>
                Sale
              </Link>
              <Link to="/vouchers" className={`font-medium ${isScrolled || !hasHeroImage ? 'text-gray-800' : 'text-white'}`}>
                Vouchers
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
