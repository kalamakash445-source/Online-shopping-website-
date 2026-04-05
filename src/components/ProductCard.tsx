import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col h-full"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-premium-gray rounded-2xl md:rounded-3xl mb-4 md:mb-6">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white/90 backdrop-blur-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full flex items-center space-x-1 shadow-sm">
          <Star className="text-vibrant-pink fill-vibrant-pink" size={8} md:size={10} />
          <span className="text-[8px] md:text-[10px] font-bold text-premium-black">{product.rating || 4.5}</span>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-tr from-vibrant-pink/0 to-vibrant-blue/0 group-hover:from-vibrant-pink/5 group-hover:to-vibrant-blue/5 transition-all duration-700"></div>
        
        <div className="hidden md:block absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <div className="vibrant-gradient py-3 rounded-2xl text-center shadow-xl shadow-vibrant-pink/20">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white">Quick View</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-grow space-y-1 md:space-y-2 px-1 md:px-2">
        <div className="flex-grow">
          <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-0.5 md:mb-1 group-hover:text-vibrant-blue transition-colors">
            {product.category}
          </p>
          <h3 className="text-xs md:text-sm font-bold text-premium-black leading-snug group-hover:vibrant-text-gradient transition-all duration-300 line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="pt-1 md:pt-2">
          <span className="text-sm md:text-lg font-display font-bold text-premium-black">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
