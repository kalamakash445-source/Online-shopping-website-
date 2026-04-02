import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, LayoutDashboard, Search } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { UserProfile } from '../types';
import SearchOverlay from './SearchOverlay';

export default function Navbar({ user }: { user: UserProfile | null }) {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] glass border-b border-gray-100/50">
      <div className="container mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-premium-black rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <Package className="text-white" size={16} />
          </div>
          <span className="text-lg md:text-2xl font-display font-black tracking-tighter text-premium-black uppercase">
            Bazaar<span className="text-premium-gold">.</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-10 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
          <Link to="/" className="hover:text-premium-black transition-colors">Collection</Link>
          <Link to="/track" className="hover:text-premium-black transition-colors">Track</Link>
          <Link to="/cart" className="hover:text-premium-black transition-colors">Cart</Link>
          {user?.role === 'admin' && <Link to="/admin" className="hover:text-premium-black transition-colors">Dashboard</Link>}
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-premium-black hover:scale-110 transition-transform"
            title="Search"
          >
            <Search size={20} md:size={22} strokeWidth={1.5} />
          </button>
          <Link to="/cart" className="relative p-2 text-premium-black hover:scale-110 transition-transform">
            <ShoppingCart size={20} md:size={22} strokeWidth={1.5} />
          </Link>

          {user ? (
            <div className="flex items-center space-x-3 md:space-x-4 pl-3 md:pl-4 border-l border-gray-200">
              <div className="flex items-center space-x-2 md:space-x-3 group cursor-pointer">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt={user.displayName} 
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-transparent group-hover:border-premium-gold transition-all duration-300"
                />
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-premium-black leading-none">{user.displayName}</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter mt-1">{user.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={18} md:size={20} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="bg-premium-black text-white px-6 md:px-8 py-2 md:py-3 rounded-full text-[8px] md:text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-premium-gold transition-all duration-500 shadow-xl shadow-black/10"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
}
