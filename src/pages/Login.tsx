import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile } from '../types';
import { LogIn, AlertCircle, Loader2, UserPlus } from 'lucide-react';

export default function Login({ user }: { user: UserProfile | null }) {
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
        message = 'Invalid email or password. If you haven\'t created an account yet, please Sign Up first. Also, ensure "Email/Password" is enabled in your Firebase Console.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already in use.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl text-center border border-gray-100">
      <div className="w-16 h-16 bg-premium-gray rounded-full flex items-center justify-center mx-auto mb-6">
        {isSignUp ? <UserPlus className="text-premium-gold" size={32} /> : <LogIn className="text-premium-gold" size={32} />}
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </h1>
      <p className="text-gray-600 mb-8">
        {isSignUp ? 'Join Bazaar to start shopping.' : 'Sign in to manage your orders.'}
      </p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-left">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
          <div className="space-y-1">
            <p className="text-sm font-bold text-red-800">Error</p>
            <p className="text-xs text-red-600 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4 mb-6">
        <div className="text-left">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-premium-gold focus:ring-1 focus:ring-premium-gold transition-all outline-none text-sm"
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="text-left">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-premium-gold focus:ring-1 focus:ring-premium-gold transition-all outline-none text-sm"
            placeholder="••••••••"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-premium-black text-white px-6 py-3 rounded-xl hover:bg-premium-gold transition-all font-bold text-xs tracking-widest uppercase disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" size={20} />
          ) : (
            isSignUp ? 'Sign Up' : 'Sign In'
          )}
        </button>
      </form>

      <p className="mt-8 text-sm text-gray-500">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-premium-gold font-bold hover:underline"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
}
