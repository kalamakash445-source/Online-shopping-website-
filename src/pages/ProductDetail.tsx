import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, CartItem } from '../types';
import { api } from '../api';
import { Star, ShoppingCart, ArrowLeft, ShieldCheck, Truck, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await api.getProduct(id);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-xl">Product not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 hover:underline">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-16 pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-3 text-gray-400 hover:text-premium-black transition-all duration-300 group"
      >
        <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 group-hover:bg-premium-black group-hover:text-white transition-all duration-500">
          <ArrowLeft size={14} md:size={16} />
        </div>
        <span className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] uppercase">Back to Collection</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
        {/* Product Image Gallery */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="lg:col-span-7 space-y-6 md:space-y-8"
        >
          <div className="bg-premium-gray rounded-[2rem] md:rounded-[3rem] overflow-hidden aspect-[4/5] flex items-center justify-center p-8 md:p-12 group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-[2s] ease-out"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-premium-gray rounded-2xl md:rounded-3xl aspect-square overflow-hidden opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                <img src={product.image} alt="Thumbnail" className="w-full h-full object-cover mix-blend-multiply p-2 md:p-4" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
          className="lg:col-span-5 space-y-8 md:space-y-12"
        >
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
              <span className="vibrant-text-gradient font-bold tracking-[0.3em] uppercase text-[8px] md:text-[10px]">
                {product.category}
              </span>
              <div className="flex items-center space-x-1">
                <Star className="text-vibrant-pink fill-vibrant-pink" size={10} md:size={12} />
                <span className="text-[10px] md:text-xs font-bold text-premium-black">{product.rating || 4.5}</span>
                <span className="text-[8px] md:text-[10px] text-gray-400 font-medium tracking-wider uppercase ml-2">(120 Reviews)</span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-6xl font-display font-black text-premium-black tracking-tighter leading-[0.9]">
              {product.name}
            </h1>
            
            <p className="text-gray-500 text-sm md:text-lg leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

          <div className="space-y-8 md:space-y-10">
            <div className="flex items-baseline space-x-4 md:space-x-6">
              <span className="text-3xl md:text-5xl font-display font-black text-premium-black">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-gray-300 line-through text-lg md:text-2xl font-medium">
                ₹{(product.price * 1.2).toLocaleString('en-IN')}
              </span>
              <div className="vibrant-gradient text-white px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-vibrant-pink/20">
                20% OFF
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
              <div className="flex items-center bg-premium-gray rounded-full p-1 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-white rounded-full transition-all duration-300 text-lg font-bold"
                >
                  -
                </button>
                <span className="w-12 md:w-16 text-center font-bold text-base md:text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-white rounded-full transition-all duration-300 text-lg font-bold"
                >
                  +
                </button>
              </div>
              
              <button
                onClick={addToCart}
                className="w-full flex items-center justify-center space-x-4 vibrant-gradient text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-bold tracking-widest uppercase text-[10px] md:text-xs hover:scale-105 transition-all duration-500 shadow-2xl shadow-vibrant-pink/30 active:scale-95"
              >
                <ShoppingCart size={16} md:size={18} strokeWidth={2} />
                <span>Add to Bag</span>
              </button>
            </div>
          </div>

          {/* Features Bento */}
          <div className="grid grid-cols-1 gap-3 md:gap-4 pt-8 md:pt-12 border-t border-gray-100">
            <div className="flex items-center justify-between p-4 md:p-6 bg-premium-gray rounded-2xl md:rounded-3xl">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-white rounded-xl md:rounded-2xl shadow-sm">
                  <ShieldCheck className="text-vibrant-blue" size={16} md:size={20} />
                </div>
                <div>
                  <p className="text-[8px] md:text-[10px] font-bold tracking-widest uppercase text-premium-black">Warranty</p>
                  <p className="text-[10px] md:text-xs text-gray-400 font-medium">1 Year International</p>
                </div>
              </div>
              <Check className="text-vibrant-green" size={14} md:size={16} />
            </div>
            
            <div className="flex items-center justify-between p-4 md:p-6 bg-premium-gray rounded-2xl md:rounded-3xl">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-white rounded-xl md:rounded-2xl shadow-sm">
                  <Truck className="text-vibrant-purple" size={16} md:size={20} />
                </div>
                <div>
                  <p className="text-[8px] md:text-[10px] font-bold tracking-widest uppercase text-premium-black">Shipping</p>
                  <p className="text-[10px] md:text-xs text-gray-400 font-medium">Complimentary Express</p>
                </div>
              </div>
              <Check className="text-vibrant-green" size={14} md:size={16} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
