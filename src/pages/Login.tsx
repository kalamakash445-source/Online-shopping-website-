import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile } from '../types';
import { LogIn, AlertCircle, Loader2, UserPlus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login({ user }: { user: UserProfile | null }) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" />;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Auth failed:', err);
      let message = 'Authentication failed. Please try again.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please check your credentials or sign up if you are new.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center space-x-3 text-gray-400 hover:text-premium-black transition-all duration-300 group self-start max-w-5xl mx-auto w-full px-4"
      >
        <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 group-hover:bg-premium-black group-hover:text-white transition-all duration-500">
          <ArrowLeft size={16} />
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Return</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Left Side: Visual/Brand */}
        <div className="hidden md:block relative bg-premium-black overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1000" 
              alt="Luxury Boutique" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-premium-black via-transparent to-transparent" />
          
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-premium-gold rounded-xl flex items-center justify-center">
                <ShoppingBag className="text-premium-black" size={20} />
              </div>
              <span className="text-2xl font-display font-black tracking-tighter uppercase">
                Bazaar<span className="text-premium-gold">.</span>
              </span>
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-4 tracking-tight">
              Elevate Your <br />
              <span className="text-premium-gold italic">Shopping Experience</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-sm font-light">
              Join our exclusive community and discover a curated world of premium essentials.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-500 font-medium">
              {isSignUp ? 'Start your journey with Bazaar today.' : 'Please enter your details to sign in.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3"
              >
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700 font-medium leading-relaxed">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-premium-gold focus:ring-4 focus:ring-premium-gold/10 transition-all outline-none text-sm font-medium"
                placeholder="name@example.com"
                required
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Password</label>
                {!isSignUp && (
                  <button type="button" className="text-[10px] font-bold text-premium-gold uppercase tracking-widest hover:underline">
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-premium-gold focus:ring-4 focus:ring-premium-gold/10 transition-all outline-none text-sm font-medium"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-premium-black text-white px-8 py-4 rounded-2xl hover:bg-premium-gold hover:text-premium-black transition-all duration-500 font-bold text-xs tracking-[0.2em] uppercase disabled:opacity-50 flex items-center justify-center space-x-2 group shadow-xl shadow-black/5"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 font-medium">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-premium-gold font-bold hover:underline ml-1 uppercase tracking-widest text-[11px]"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
