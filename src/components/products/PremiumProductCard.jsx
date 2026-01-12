import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Heart, Eye, MapPin, Clock, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function PremiumProductCard({ product, onQuickView }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  useEffect(() => {
    checkWishlist();
    loadDeliveryInfo();
  }, [product.id]);

  const checkWishlist = async () => {
    try {
      const user = await base44.auth.me();
      const items = await base44.entities.WishlistItem.filter({
        user_id: user.id,
        product_id: product.id
      });
      setIsWishlisted(items.length > 0);
    } catch (error) {
      // User not logged in or error
    }
  };

  const loadDeliveryInfo = () => {
    const saved = localStorage.getItem('delivery_location');
    if (saved) {
      setDeliveryInfo(JSON.parse(saved));
    } else {
      setDeliveryInfo({ city: 'Berlin', eta_min: 1, eta_max: 3 });
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isPending) return;
    
    setIsPending(true);
    const previousState = isWishlisted;
    setIsWishlisted(!isWishlisted);

    try {
      const user = await base44.auth.me();
      
      if (previousState) {
        const items = await base44.entities.WishlistItem.filter({
          user_id: user.id,
          product_id: product.id
        });
        if (items.length > 0) {
          await base44.entities.WishlistItem.delete(items[0].id);
        }
      } else {
        await base44.entities.WishlistItem.create({
          user_id: user.id,
          product_id: product.id
        });
      }
    } catch (error) {
      setIsWishlisted(previousState);
      console.error('Wishlist error:', error);
    } finally {
      setIsPending(false);
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    onQuickView?.(product);
  };

  const getEtaText = () => {
    if (!deliveryInfo) return '';
    if (deliveryInfo.eta_min >= 8) {
      return `${deliveryInfo.eta_min}–${deliveryInfo.eta_max} Tage`;
    }
    return `${deliveryInfo.eta_min}–${deliveryInfo.eta_max} Werktage`;
  };

  const [showAddedFeedback, setShowAddedFeedback] = useState(false);

  return (
    <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6 }}
        className="group relative overflow-hidden rounded-3xl transition-all duration-500"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-3xl">
          {/* Shimmer Effect on Hover */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10 pointer-events-none"
          />
          
          {product.cover_image ? (
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              src={product.cover_image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
              <div className="w-20 h-20 rounded-full bg-white/5" />
            </div>
          )}
          
          {/* Top Gradient */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
          
          {/* Bottom Gradient */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
          
          {/* Availability Badge - Top Right */}
          <div className="absolute top-4 right-4 z-20">
            <AnimatePresence mode="wait">
              {product.in_stock ? (
                <motion.div
                  key="available"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="px-3 py-1.5 rounded-full backdrop-blur-xl text-xs font-black flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.25) 0%, rgba(22,163,74,0.15) 100%)',
                    border: '1px solid rgba(34,197,94,0.4)',
                    color: '#4ade80',
                    boxShadow: '0 4px 15px rgba(34,197,94,0.2)'
                  }}
                >
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-green-400"
                  />
                  Verfügbar
                </motion.div>
              ) : (
                <motion.div
                  key="unavailable"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1.5 rounded-full backdrop-blur-xl text-xs font-bold"
                  style={{
                    background: 'rgba(239,68,68,0.2)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171'
                  }}
                >
                  Ausverkauft
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Wishlist Button - Top Left */}
          <motion.button
            whileHover={{ scale: 1.15, rotate: isWishlisted ? 0 : 15 }}
            whileTap={{ scale: 0.85 }}
            onClick={toggleWishlist}
            disabled={isPending}
            className="absolute top-4 left-4 z-20 w-12 h-12 rounded-2xl backdrop-blur-xl flex items-center justify-center transition-all duration-300"
            style={{
              background: isWishlisted 
                ? 'linear-gradient(135deg, rgba(236,72,153,0.3) 0%, rgba(219,39,119,0.2) 100%)'
                : 'rgba(255,255,255,0.1)',
              border: isWishlisted 
                ? '1px solid rgba(236,72,153,0.5)'
                : '1px solid rgba(255,255,255,0.15)',
              boxShadow: isWishlisted 
                ? '0 4px 20px rgba(236,72,153,0.3)'
                : '0 4px 15px rgba(0,0,0,0.2)'
            }}
            aria-label={isWishlisted ? 'Von Merkliste entfernen' : 'Zu Merkliste hinzufügen'}
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 ${
                isWishlisted ? 'text-pink-400' : 'text-white/80'
              }`}
              fill={isWishlisted ? '#f472b6' : 'none'}
            />
          </motion.button>
          
          {/* Quick View Button - Bottom Center */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleQuickView}
              className="h-11 px-6 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                color: '#0a0a0f',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
              }}
            >
              <Eye className="w-4 h-4" />
              Quick View
            </motion.button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* SKU Badge - Top */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-md tracking-wider"
              style={{
                color: 'rgba(139,92,246,0.9)',
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.2)'
              }}
            >
              {product.sku}
            </span>
          </div>
          
          {/* Product Name */}
          <h3 className="font-bold text-[15px] leading-tight line-clamp-2 min-h-[40px] text-white/95 group-hover:text-white transition-colors">
            {product.name}
          </h3>
          
          {/* Price Row */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium text-white/40 mb-0.5">Preis</p>
              <div className="text-2xl font-black text-white tracking-tight">
                {product.price}
                <span className="text-base font-bold text-white/60 ml-0.5">€</span>
              </div>
            </div>
            
            {/* Quick Add Indicator */}
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.15) 100%)',
                border: '1px solid rgba(139,92,246,0.3)'
              }}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
            </motion.div>
          </div>
          
          {/* Delivery Info - Compact */}
          <div className="pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🇨🇳</span>
                <span className="font-medium text-white/50">China</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-white/40" />
                <span className="font-medium text-white/50">8-17 Tage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <motion.div 
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
          style={{ 
            boxShadow: '0 0 60px rgba(139,92,246,0.15), inset 0 0 60px rgba(139,92,246,0.05)',
            border: '1px solid rgba(139,92,246,0.2)'
          }}
        />
      </motion.div>
    </Link>
  );
}