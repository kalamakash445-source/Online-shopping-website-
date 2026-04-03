import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
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
import BottomNav from './components/BottomNav';
import { Package, Instagram, Twitter, Facebook } from 'lucide-react';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Sync with local backend
          const syncedUser = await api.login({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL || '',
          });
          setUser(syncedUser);
        } else {
          api.logout();
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // We still keep the loading state for the initial auth check, 
  // but we won't redirect to login anymore.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-12 w-12 border-t-2 border-premium-gold rounded-full" />
      </div>
    );
  }

  const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
    if (adminOnly && (!user || user.role !== 'admin')) return <Navigate to="/" />;
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-premium-gold/30">
        <Navbar user={user} />
        <main className="flex-grow container mx-auto px-6 pt-24 pb-32 md:pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout user={user} />} />
            <Route path="/track" element={<OrderTracking />} />
            <Route path="/track/:id" element={<OrderTracking />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <BottomNav user={user} />
        <footer className="bg-premium-black text-white py-20 hidden md:block">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
              <div className="col-span-1 md:col-span-2 space-y-6">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <Package className="text-premium-black" size={16} />
                  </div>
                  <span className="text-xl font-display font-black tracking-tighter uppercase">
                    Bazaar<span className="text-premium-gold">.</span>
                  </span>
                </Link>
                <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                  Redefining the modern shopping experience with a curated selection of premium essentials for the discerning individual.
                </p>
                <div className="flex items-center space-x-4 pt-4">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-premium-gold hover:text-premium-black transition-all duration-300">
                    <Instagram size={18} />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-premium-gold hover:text-premium-black transition-all duration-300">
                    <Twitter size={18} />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-premium-gold hover:text-premium-black transition-all duration-300">
                    <Facebook size={18} />
                  </a>
                </div>
              </div>
              
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-premium-gold">Shop</h4>
                <ul className="space-y-4 text-sm text-gray-400">
                  <li><Link to="/" className="hover:text-white transition-colors">New Arrivals</Link></li>
                  <li><Link to="/" className="hover:text-white transition-colors">Best Sellers</Link></li>
                  <li><Link to="/" className="hover:text-white transition-colors">Collections</Link></li>
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-premium-gold">Support</h4>
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
