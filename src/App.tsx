import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { UserProfile } from './types';
import { api } from './api';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import BottomNav from './components/BottomNav';
import StyleAssistant from './components/StyleAssistant';
import { Package, Instagram, Twitter, Facebook, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AnimatedRoutes({ user }: { user: UserProfile | null }) {
  const location = useLocation();

  const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
    return children;
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="flex-grow"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login user={user} />} />
          <Route path="/checkout" element={<Checkout user={user} />} />
          <Route path="/track" element={<OrderTracking />} />
          <Route path="/track/:id" element={<OrderTracking />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = api.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-6">
        <div className="relative">
          <div className="w-20 h-20 vibrant-gradient rounded-3xl animate-spin shadow-xl shadow-vibrant-pink/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="text-white animate-pulse" size={32} />
          </div>
        </div>
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase vibrant-text-gradient animate-pulse">Loading Experience</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-vibrant-pink/30">
        <Navbar user={user} />
        <main className="flex-grow container mx-auto px-6 pt-24 pb-32 md:pb-20 flex flex-col">
          <AnimatedRoutes user={user} />
        </main>
        <BottomNav user={user} />
        <StyleAssistant />
        <footer className="bg-premium-black text-white py-20 hidden md:block relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-vibrant-pink/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-vibrant-blue/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
              <div className="col-span-1 md:col-span-2 space-y-6">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 vibrant-gradient rounded-lg flex items-center justify-center shadow-lg shadow-vibrant-pink/20">
                    <Package className="text-white" size={16} />
                  </div>
                  <span className="text-xl font-display font-black tracking-tighter uppercase">
                    Bazaar<span className="vibrant-text-gradient">.</span>
                  </span>
                </Link>
                <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                  Redefining the modern shopping experience with a curated selection of premium essentials for the discerning individual.
                </p>
                <div className="flex items-center space-x-4 pt-4">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:vibrant-gradient hover:text-white transition-all duration-500">
                    <Instagram size={18} />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:vibrant-gradient hover:text-white transition-all duration-500">
                    <Twitter size={18} />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:vibrant-gradient hover:text-white transition-all duration-500">
                    <Facebook size={18} />
                  </a>
                </div>
              </div>
              
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase vibrant-text-gradient">Shop</h4>
                <ul className="space-y-4 text-sm text-gray-400">
                  <li><Link to="/" className="hover:text-white transition-colors">New Arrivals</Link></li>
                  <li><Link to="/" className="hover:text-white transition-colors">Best Sellers</Link></li>
                  <li><Link to="/" className="hover:text-white transition-colors">Collections</Link></li>
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase vibrant-text-gradient">Support</h4>
                <ul className="space-y-4 text-sm text-gray-400">
                  <li><Link to="/track" className="hover:text-white transition-colors">Order Tracking</Link></li>
                  <li><Link to="/" className="hover:text-white transition-colors">Shipping</Link></li>
                  <li><Link to="/" className="hover:text-white transition-colors">Returns</Link></li>
                  <li><Link to="/" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">
              <p>&copy; 2026 Bazaar. All rights reserved.</p>
              <div className="flex items-center space-x-8">
                <Link to="/" className="hover:text-white transition-colors">Privacy</Link>
                <Link to="/" className="hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
