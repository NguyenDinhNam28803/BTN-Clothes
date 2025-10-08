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

  return (
    <SmoothScroll>
      <div className="w-full min-h-screen overflow-x-hidden">
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

function App() {
  const [isLoading, setIsLoading] = useState(() => {
    // Kiểm tra ngay từ đầu
    return !sessionStorage.getItem('hasVisited');
  });

  

  const handleLoadComplete = () => {
    sessionStorage.setItem('hasVisited', 'true');
    setIsLoading(false);
  };

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              {isLoading ? (
                <LoadingScreen onLoadComplete={handleLoadComplete} />
              ) : (
                <AppContent />
              )}
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
