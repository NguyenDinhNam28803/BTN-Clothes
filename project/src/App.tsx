import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ToastProvider } from './components/Toast';
import Header from './components/Header';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import LoadingScreen from './components/LoadingScreen';
import PageTransition from './components/PageTransition';
import TransitionLoader from './components/TransitionLoader';
import SmoothScroll from './components/SmoothScroll';
import LuxuryAnimations from './lib/luxuryAnimations';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import Vouchers from './pages/Vouchers';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Admin from './pages/Admin';

function AppContent() {
  const location = useLocation();
  
  // Log status về kết nối cục bộ
  useEffect(() => {
    console.log("Môi trường Vite:", import.meta.env.MODE);
    console.log("Đang sử dụng Supabase cục bộ (Docker) thay vì biến môi trường");
    console.log("URL: http://127.0.0.1:54321");
  }, []);
  
  // Tự động cuộn lên đầu trang khi điều hướng
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Initialize luxury animations whenever the route changes
  useEffect(() => {
    // Small timeout to ensure DOM elements are fully rendered
    const timer = setTimeout(() => {
      LuxuryAnimations.refreshAnimations();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <SmoothScroll>
      <div className="w-full min-h-screen m-0 p-0 bg-luxury-pattern">
        <CustomCursor />
        <TransitionLoader />
        <Header />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>  
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
            <Route path="/men" element={<PageTransition><Shop /></PageTransition>} />
            <Route path="/women" element={<PageTransition><Shop /></PageTransition>} />
            <Route path="/kids" element={<PageTransition><Shop /></PageTransition>} />
            <Route path="/accessories" element={<PageTransition><Shop /></PageTransition>} />
            <Route path="/sale" element={<PageTransition><Shop /></PageTransition>} />
            <Route path="/product/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
            <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
            <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
            <Route path="/vouchers" element={<PageTransition><Vouchers /></PageTransition>} />
            <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
            <Route path="/account" element={<PageTransition><Account /></PageTransition>} />
            <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Login /></PageTransition>} />
          </Routes>
        </AnimatePresence>
        <Footer />
      </div>
    </SmoothScroll>
  );
}

const hasVisitedBefore = sessionStorage.getItem('hasVisited');

function App() {
  const [isLoading, setIsLoading] = useState(!hasVisitedBefore);
  const handleLoadComplete = () => {
    setIsLoading(false);
    sessionStorage.setItem('hasVisited', 'true');
  };

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <AnimatePresence mode="wait">
                {isLoading && <LoadingScreen onLoadComplete={handleLoadComplete} />}
              </AnimatePresence>
              {!isLoading && <AppContent />}
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
