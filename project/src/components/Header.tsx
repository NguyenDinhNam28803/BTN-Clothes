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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full m-0 p-0 ${
        isScrolled || !hasHeroImage 
          ? 'bg-off-white shadow-sm py-4' 
          : 'bg-transparent py-8'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className={`text-3xl font-display tracking-wider transition-colors ${
              isScrolled || !hasHeroImage ? 'text-deep-navy' : 'text-white'
            }`}
          >
            BTN Clothes
          </Link>

          <nav className="hidden md:flex items-center gap-12 justify-center flex-1">
            <Link
              to="/shop?reset=true"
              className={`font-sans text-sm uppercase tracking-wider transition-colors hover:text-olive-gold ${
                isScrolled || !hasHeroImage ? 'text-deep-navy' : 'text-white'
              }`}
            >
              Shop
            </Link>
            <Link
              to="/shop?category=men"
              className={`font-sans text-sm uppercase tracking-wider transition-colors hover:text-olive-gold ${
                isScrolled || !hasHeroImage ? 'text-deep-navy' : 'text-white'
              }`}
            >
              Men
            </Link>
            <Link
              to="/shop?category=women"
              className={`font-sans text-sm uppercase tracking-wider transition-colors hover:text-olive-gold ${
                isScrolled || !hasHeroImage ? 'text-deep-navy' : 'text-white'
              }`}
            >
              Women
            </Link>
            <Link
              to="/sale"
              className={`font-sans text-sm uppercase tracking-wider transition-colors hover:text-olive-gold ${
                isScrolled || !hasHeroImage ? 'text-muted-rust' : 'text-muted-rust/90'
              }`}
            >
              Sale
            </Link>
            <Link
              to="/vouchers"
              className={`font-sans text-sm uppercase tracking-wider transition-colors hover:text-olive-gold ${
                isScrolled || !hasHeroImage ? 'text-deep-navy' : 'text-white'
              }`}
            >
              Vouchers
            </Link>
          </nav>

          <div className="flex items-center gap-6">
            <button
              onClick={handleSearch}
              className={`p-2 transition-colors hover:text-olive-gold ${
                isScrolled || !hasHeroImage ? 'text-deep-navy' : 'text-white'
              }`}
              aria-label="Search"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link
              to="/wishlist"
              className={`p-2 transition-colors hover:text-olive-gold relative ${
                isScrolled || !hasHeroImage ? 'text-deep-navy' : 'text-white'
              }`}
              aria-label="Wishlist"
            >
              <Heart size={20} strokeWidth={1.5} />
              {getWishlistCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-muted-rust text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {getWishlistCount()}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className={`p-2 transition-colors hover:text-olive-gold relative ${
                isScrolled || !hasHeroImage ? 'text-deep-navy' : 'text-white'
              }`}
              aria-label="Cart"
            >
              <ShoppingCart size={20} strokeWidth={1.5} />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-olive-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative group">
                <button
                  className={`p-2 transition-colors hover:text-olive-gold ${
                    isScrolled || !hasHeroImage ? 'text-deep-navy' : 'text-white'
                  }`}
                  aria-label="Account"
                >
                  <User size={20} strokeWidth={1.5} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-52 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <Link
                    to="/account"
                    className="block px-6 py-3.5 text-deep-navy hover:text-olive-gold hover:bg-soft-beige rounded-t-md font-sans text-sm"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-6 py-3.5 text-muted-rust hover:text-muted-rust hover:bg-soft-beige rounded-b-md flex items-center gap-2 font-sans text-sm"
                  >
                    <LogOut size={15} strokeWidth={1.5} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className={`p-2 transition-colors hover:text-olive-gold ${
                  isScrolled || !hasHeroImage ? 'text-deep-navy' : 'text-white'
                }`}
                aria-label="Login"
              >
                <User size={20} strokeWidth={1.5} />
              </Link>
            )}

            <button
              className={`md:hidden p-2 ${isScrolled || !hasHeroImage ? 'text-deep-navy' : 'text-white'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="md:hidden mt-5 pb-5 border-t border-gray-100/30 pt-5">
            <div className="flex flex-col gap-5">
              <Link 
                to="/shop?reset=true" 
                className={`font-sans text-sm uppercase tracking-wider transition-colors hover:text-olive-gold ${
                  isScrolled || !hasHeroImage ? 'text-deep-navy' : 'text-white'
                }`}
              >
                Shop
              </Link>
              <Link 
                to="/shop?category=men" 
                className={`font-sans text-sm uppercase tracking-wider transition-colors hover:text-olive-gold ${
                  isScrolled || !hasHeroImage ? 'text-deep-navy' : 'text-white'
                }`}
              >
                Men
              </Link>
              <Link 
                to="/shop?category=women" 
                className={`font-sans text-sm uppercase tracking-wider transition-colors hover:text-olive-gold ${
                  isScrolled || !hasHeroImage ? 'text-deep-navy' : 'text-white'
                }`}
              >
                Women
              </Link>
              <Link 
                to="/sale" 
                className={`font-sans text-sm uppercase tracking-wider transition-colors hover:text-olive-gold ${
                  isScrolled || !hasHeroImage ? 'text-muted-rust' : 'text-muted-rust/90'
                }`}
              >
                Sale
              </Link>
              <Link 
                to="/vouchers" 
                className={`font-sans text-sm uppercase tracking-wider transition-colors hover:text-olive-gold ${
                  isScrolled || !hasHeroImage ? 'text-deep-navy' : 'text-white'
                }`}
              >
                Vouchers
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
