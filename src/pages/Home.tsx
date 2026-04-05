import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await api.getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 md:space-y-16 pb-20">
      {/* Editorial Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] min-h-[400px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-premium-black group shadow-2xl shadow-vibrant-pink/20">
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000" 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2s]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-premium-black via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-vibrant-pink/10 via-vibrant-purple/10 to-vibrant-blue/10 mix-blend-overlay"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="vibrant-text-gradient font-bold tracking-[0.3em] uppercase text-[8px] md:text-xs mb-4 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Spring Summer 2026
          </span>
          <h1 className="text-4xl md:text-8xl font-display font-black text-white tracking-tighter leading-[0.9] mb-6 md:mb-8 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Elevate Your <br /> Everyday <span className="vibrant-text-gradient italic">Style</span>
          </h1>
          <p className="text-gray-300 text-sm md:text-xl max-w-sm md:max-w-xl mb-8 md:mb-10 font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000">
            A curated collection of premium essentials designed for the modern lifestyle.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <button className="w-full sm:w-auto vibrant-gradient text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-bold tracking-widest uppercase text-[10px] md:text-xs hover:scale-105 transition-all duration-500 shadow-2xl shadow-vibrant-pink/30">
              Explore Now
            </button>
            <button className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 md:px-10 py-3 md:py-4 rounded-full font-bold tracking-widest uppercase text-[10px] md:text-xs hover:bg-white hover:text-premium-black transition-all duration-500">
              Lookbook
            </button>
          </div>
        </div>
      </div>

      {/* Refined Filters & Search */}
      <div className="max-w-5xl mx-auto px-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 border-b border-gray-100 pb-6 md:pb-8">
          <div className="flex items-center space-x-6 md:space-x-8 overflow-x-auto no-scrollbar pb-2 md:pb-0 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-300 relative py-2 ${
                  selectedCategory === cat ? 'text-premium-black' : 'text-gray-400 hover:text-vibrant-pink'
                }`}
              >
                {cat}
                {selectedCategory === cat && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 vibrant-gradient animate-in fade-in zoom-in duration-300"></div>
                )}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-vibrant-purple transition-colors" size={14} />
            <input
              type="text"
              placeholder="SEARCH COLLECTION"
              className="w-full pl-6 md:pl-8 pr-4 py-2 bg-transparent border-none focus:ring-0 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase placeholder:text-gray-300 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <motion.div 
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-16"
      >
        {filteredProducts.map(product => (
          <motion.div
            key={product.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } }
            }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      {/* Track Your Order Section */}
      <div className="bg-premium-gray rounded-[2.5rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-vibrant-pink/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-vibrant-blue/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <p className="vibrant-text-gradient font-bold tracking-[0.3em] uppercase text-[10px]">Order Management</p>
          <h2 className="text-4xl md:text-6xl font-display font-black text-premium-black tracking-tighter leading-none">
            Track Your <span className="vibrant-text-gradient italic">Acquisition</span>
          </h2>
          <p className="text-gray-500 font-medium text-sm md:text-lg">
            Monitor the journey of your curated essentials in real-time. Simply enter your Reference ID to see the current status of your delivery.
          </p>
          <div className="pt-4">
            <a 
              href="/track" 
              className="inline-flex items-center space-x-4 vibrant-gradient text-white px-10 py-5 rounded-full font-bold tracking-widest uppercase text-xs hover:scale-105 transition-all duration-500 shadow-2xl shadow-vibrant-purple/20"
            >
              <span>Track Now</span>
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <Search size={12} />
              </div>
            </a>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-40">
          <p className="text-gray-300 font-display text-3xl font-light tracking-tight">
            No items found in this selection.
          </p>
        </div>
      )}
    </div>
  );
}
