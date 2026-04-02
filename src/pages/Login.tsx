import { Navigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { UserProfile } from '../types';
import { LogIn } from 'lucide-react';

export default function Login({ user }: { user: UserProfile | null }) {
  if (user) return <Navigate to="/" />;

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl text-center border border-gray-100">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <LogIn className="text-blue-600" size={32} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Bazaar</h1>
      <p className="text-gray-600 mb-8">Sign in to start shopping and manage your orders.</p>
      
      <button
        onClick={handleLogin}
        className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
        <span>Continue with Google</span>
      </button>
      
      <p className="mt-8 text-xs text-gray-500">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
