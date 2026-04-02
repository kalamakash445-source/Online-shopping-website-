import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { Link } from 'react-router-dom';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Pre-fetch some products for quick display
      fetchInitialProducts();
    } else {
      document.body.style.overflow = 'unset';
      setSearchTerm('');
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const fetchInitialProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), limit(10));
      const querySnapshot = await getDocs(q);
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) {
      console.error('Error fetching search products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-xl"
        >
          <div className="container mx-auto px-6 pt-24 md:pt-32">
            <div className="flex justify-end mb-8">
              <button 
                onClick={onClose}
                className="p-4 hover:bg-premium-gray rounded-full transition-colors group"
              >
                <X size={24} className="text-premium-black group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              <div className="relative group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-premium-gold transition-colors" size={32} strokeWidth={1.5} />
                <input 
                  autoFocus
                  type="text"
                  placeholder="SEARCH OUR COLLECTION"
                  className="w-full pl-12 md:pl-16 py-6 bg-transparent border-b-2 border-gray-100 focus:border-premium-gold outline-none text-2xl md:text-5xl font-display font-black tracking-tighter uppercase placeholder:text-gray-100 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
                    {searchTerm ? `Results for "${searchTerm}"` : 'Suggested Acquisitions'}
                  </h3>
                  {loading && <div className="animate-spin h-4 w-4 border-t-2 border-premium-gold rounded-full" />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <Link 
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={onClose}
                        className="flex items-center p-4 rounded-3xl hover:bg-premium-gray transition-all duration-300 group"
                      >
                        <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="ml-6 flex-grow">
                          <p className="text-[8px] font-bold text-premium-gold uppercase tracking-widest mb-1">{product.category}</p>
                          <p className="font-bold text-premium-black tracking-tight">{product.name}</p>
                          <p className="text-sm font-display font-black text-premium-black mt-1">₹{product.price.toLocaleString('en-IN')}</p>
                        </div>
                        <ArrowRight size={18} className="text-gray-200 group-hover:text-premium-gold group-hover:translate-x-2 transition-all" />
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-premium-gray rounded-2xl flex items-center justify-center mx-auto">
                        <Package className="text-gray-300" size={24} />
                      </div>
                      <p className="text-gray-400 font-medium italic">No items found matching your search.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
