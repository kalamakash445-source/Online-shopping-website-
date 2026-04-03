import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, LayoutDashboard, Search, Package } from 'lucide-react';
import { UserProfile } from '../types';
import SearchOverlay from './SearchOverlay';

export default function BottomNav({ user }: { user: UserProfile | null }) {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 py-3 pb-6 flex items-center justify-between">
        <Link to="/" className={`flex flex-col items-center space-y-1 ${isActive('/') ? 'text-premium-gold' : 'text-gray-400'}`}>
          <Home size={20} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </Link>
        
        <button 
          onClick={() => setIsSearchOpen(true)}
          className={`flex flex-col items-center space-y-1 ${isSearchOpen ? 'text-premium-gold' : 'text-gray-400'}`}
        >
          <Search size={20} strokeWidth={isSearchOpen ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Search</span>
        </button>

        <Link to="/cart" className={`flex flex-col items-center space-y-1 ${isActive('/cart') ? 'text-premium-gold' : 'text-gray-400'}`}>
          <ShoppingBag size={20} strokeWidth={isActive('/cart') ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Bag</span>
        </Link>

        <Link to="/track" className={`flex flex-col items-center space-y-1 ${isActive('/track') ? 'text-premium-gold' : 'text-gray-400'}`}>
          <Package size={20} strokeWidth={isActive('/track') ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Track</span>
        </Link>

        {user?.role === 'admin' && (
          <Link to="/admin" className={`flex flex-col items-center space-y-1 ${isActive('/admin') ? 'text-premium-gold' : 'text-gray-400'}`}>
            <LayoutDashboard size={20} strokeWidth={isActive('/admin') ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Admin</span>
          </Link>
        )}

        <Link to={user ? "/profile" : "/login"} className={`flex flex-col items-center space-y-1 ${isActive('/login') || isActive('/profile') ? 'text-premium-gold' : 'text-gray-400'}`}>
          <User size={20} strokeWidth={isActive('/login') || isActive('/profile') ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{user ? 'You' : 'Login'}</span>
        </Link>
      </div>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
