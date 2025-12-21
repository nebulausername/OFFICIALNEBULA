import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ShoppingBag, Star, Heart, Eye, Zap, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductCard({ product, onAddToCart }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Determine badge
  const getBadge = () => {
    if (product.tags?.includes('Limited')) return { icon: Flame, text: 'LIMITED', class: 'badge-limited' };
    if (product.tags?.includes('New') || new Date(product.created_date) > new Date(Date.now() - 7*24*60*60*1000)) {
      return { icon: Zap, text: 'NEU', class: 'badge-new' };
    }
    return null;
  };
  
  const badge = getBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="product-card group glass backdrop-blur border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all"
    >
      <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800">
          {product.cover_image ? (
            <img
              src={product.cover_image}
              alt={product.name}
              className="product-image w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-zinc-700" />
            </div>
          )}
          
          {/* Hover Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center gap-3"
              >
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Eye className="w-5 h-5 text-white" />
                </motion.button>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15 }}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsFavorite(!isFavorite);
                  }}
                  className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Badge Top Left */}
          {badge && (
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="absolute top-3 left-3"
            >
              <div className={`${badge.class} px-3 py-1.5 backdrop-blur border border-white/20 text-white text-xs font-bold rounded-full flex items-center gap-1.5`}>
                <badge.icon className="w-3 h-3" />
                {badge.text}
              </div>
            </motion.div>
          )}

          {/* Stock Badge Top Right */}
          <div className="absolute top-3 right-3">
            {product.in_stock ? (
              <span className="px-3 py-1 glass text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
                Verfügbar
              </span>
            ) : (
              <span className="px-3 py-1 glass text-red-400 text-xs font-semibold rounded-full border border-red-500/30">
                Ausverkauft
              </span>
            )}
          </div>

          {/* SKU Badge Bottom Left */}
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 bg-black/60 backdrop-blur border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold rounded-full">
              {product.sku}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{product.description}</p>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price and Action */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800/50 group-hover:border-purple-500/30 transition-colors">
            <div>
              <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {product.price}€
              </div>
              {product.currency && product.currency !== 'EUR' && (
                <div className="text-xs text-zinc-500">{product.currency}</div>
              )}
            </div>
            
            {product.in_stock && onAddToCart && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(product);
                }}
                className="neon-button relative p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all"
              >
                <ShoppingBag className="w-5 h-5 relative z-10" />
              </motion.button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}