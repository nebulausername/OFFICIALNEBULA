import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ShoppingBag, Heart, Eye, Zap, Flame, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductCard({ product, onAddToCart, onQuickView }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Determine badge
  const getBadge = () => {
    if (product.tags?.includes('Limited')) return { icon: Flame, text: 'LIMITED', class: 'badge-limited' };
    if (product.tags?.includes('New') || new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      return { icon: Zap, text: 'NEU', class: 'badge-new' };
    }
    return null;
  };

  const badge = getBadge();
  const displayImage = previewImage || product.cover_image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => {
        setIsHovered(false);
        setPreviewImage(null);
      }}
      className="product-card group relative flex flex-col h-full bg-[#09090b] border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500"
    >
      <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`} className="flex-1 flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-zinc-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                  <ShoppingBag className="w-12 h-12 text-zinc-800" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Quick Actions Overlay */}
          <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 transition-opacity duration-300 flex items-center justify-center gap-3 ${isHovered ? 'opacity-100' : ''}`}>
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              onClick={(e) => {
                e.preventDefault();
                onQuickView?.(product);
              }}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-amber-400 transition-colors shadow-lg"
              title="Vorschau"
            >
              <Eye className="w-5 h-5" />
            </motion.button>
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ delay: 0.05 }}
              onClick={(e) => {
                e.preventDefault();
                setIsFavorite(!isFavorite);
              }}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-lg"
              title="Favorit"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
            </motion.button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 inset-x-3 flex justify-between items-start pointer-events-none">
            <div className="flex flex-col gap-2">
              {badge && (
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg ${badge.class === 'badge-limited' ? 'bg-orange-500 text-white' : 'bg-amber-400 text-black'}`}>
                  {badge.text}
                </span>
              )}
            </div>
            {product.in_stock ? (
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Verfügbar" />
            ) : (
              <span className="px-2 py-0.5 rounded bg-red-500/90 text-white text-[10px] font-bold shadow-lg">
                SOLD
              </span>
            )}
          </div>
        </div>

        {/* Info Content */}
        <div className="p-4 flex-1 flex flex-col gap-3">
          <div>
            <div className="flex justify-between items-start gap-2 mb-1">
              <h3 className="font-bold text-sm text-zinc-100 leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors">
                {product.name}
              </h3>
              <span className="text-xs font-mono text-zinc-500 flex-shrink-0 pt-0.5">{product.sku}</span>
            </div>
            {product.description && (
              <p className="text-xs text-zinc-500 line-clamp-1">{product.description}</p>
            )}
          </div>

          {/* Color Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex flex-wrap gap-1.5 min-h-[1.25rem]">
              {product.colors.slice(0, 5).map(color => (
                <button
                  key={color.id}
                  className="w-4 h-4 rounded-full border border-zinc-700/50 hover:scale-125 hover:border-white transition-all shadow-sm"
                  style={{ backgroundColor: color.hex }}
                  onMouseEnter={(e) => {
                    e.preventDefault();
                    if (color.images && color.images.length > 0) {
                      setPreviewImage(color.images[0]);
                    }
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    // Could link to filtered variant detail
                  }}
                  title={color.name}
                />
              ))}
              {product.colors.length > 5 && (
                <span className="text-[10px] text-zinc-600 flex items-center">+{product.colors.length - 5}</span>
              )}
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-zinc-900 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                {product.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })}€
              </span>
              <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                <Truck className="w-3 h-3" />
                <span>DE 1-3 Tage</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.(product);
              }}
              disabled={!product.in_stock}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${product.in_stock
                  ? 'bg-zinc-800 text-white hover:bg-amber-400 hover:text-black hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                  : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                }`}
            >
              <ShoppingBag className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}