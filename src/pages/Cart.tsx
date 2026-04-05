import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-40">
        <div className="w-24 h-24 bg-premium-gray rounded-full flex items-center justify-center mx-auto mb-10 vibrant-shadow">
          <ShoppingBag className="text-vibrant-pink" size={32} strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-display font-black text-premium-black mb-6 tracking-tighter">Your collection is empty</h1>
        <p className="text-gray-400 mb-12 text-lg font-medium max-w-md mx-auto">Discover our curated selection of premium essentials and start building your collection.</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-4 vibrant-gradient text-white px-12 py-5 rounded-full font-bold tracking-widest uppercase text-xs hover:scale-105 transition-all duration-500 shadow-2xl shadow-vibrant-pink/20"
        >
          <span>Explore Collection</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 md:space-y-16 pb-20">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center space-x-3 text-gray-400 hover:text-premium-black transition-all duration-300 group"
      >
        <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 group-hover:bg-premium-black group-hover:text-white transition-all duration-500">
          <ArrowLeft size={16} />
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Continue Shopping</span>
      </button>

      <div className="flex items-baseline justify-between border-b border-gray-100 pb-10">
        <h1 className="text-6xl font-display font-black text-premium-black tracking-tighter">Shopping Bag</h1>
        <span className="text-gray-400 font-bold tracking-widest uppercase text-[10px]">{cart.length} Items Selected</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-12">
          <AnimatePresence mode="popLayout">
            {cart.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
                className="group flex flex-col sm:flex-row items-center gap-10 pb-12 border-b border-gray-50 last:border-0"
              >
                <div className="w-48 h-60 bg-premium-gray rounded-[2rem] overflow-hidden flex-shrink-0 p-6 group-hover:scale-105 transition-transform duration-700">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                </div>
                
                <div className="flex-grow space-y-6 w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-vibrant-blue uppercase tracking-[0.2em] mb-2">{item.category}</p>
                      <h3 className="text-2xl font-display font-bold text-premium-black tracking-tight group-hover:vibrant-text-gradient transition-all duration-300">{item.name}</h3>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                      <Trash2 size={20} strokeWidth={1.5} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center bg-premium-gray rounded-full p-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all duration-300">
                        <Minus size={14} />
                      </button>
                      <span className="w-12 text-center font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all duration-300">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-2xl font-display font-black text-premium-black">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
          className="lg:col-span-4"
        >
          <div className="bg-premium-black text-white p-10 rounded-[3rem] sticky top-32 space-y-10 shadow-2xl shadow-vibrant-purple/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-vibrant-pink/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-vibrant-blue/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
            
            <h2 className="text-2xl font-display font-black tracking-tight relative z-10">Summary</h2>
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between text-sm text-gray-400 font-medium">
                <span>Subtotal</span>
                <span className="text-white">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400 font-medium">
                <span>Shipping</span>
                <span className="text-vibrant-green font-bold tracking-widest uppercase text-[10px]">Complimentary</span>
              </div>
              
              <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                <span className="text-lg font-bold tracking-tight">Total</span>
                <span className="text-4xl font-display font-black vibrant-text-gradient">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full vibrant-gradient text-white py-5 rounded-full font-bold tracking-widest uppercase text-xs hover:scale-105 transition-all duration-500 flex items-center justify-center space-x-4 group shadow-xl shadow-vibrant-pink/20 relative z-10"
            >
              <span>Checkout</span>
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </button>
            
            <p className="text-[10px] text-gray-500 text-center font-bold tracking-widest uppercase relative z-10">Secure Checkout Powered by Bazaar</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
