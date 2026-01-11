import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Heart, Eye, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
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

  return (
    <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="premium-card group smooth-transition relative overflow-hidden"
      >
        {/* Image Container */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-[var(--radius-lg)] bg-[hsl(var(--panel))]">
          {product.cover_image ? (
            <motion.img
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.4 }}
              src={product.cover_image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[hsl(var(--border))] opacity-40" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 smooth-transition" />
          
          {/* Availability Badge */}
          <div className="absolute top-3 right-3">
            {product.in_stock ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-md text-white text-xs font-black flex items-center gap-1.5 shadow-lg"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Verfügbar
              </motion.div>
            ) : (
              <div className="px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur-md text-white text-xs font-black shadow-lg">
                Ausverkauft
              </div>
            )}
          </div>
          
          {/* Wishlist Button */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleWishlist}
            disabled={isPending}
            className="absolute top-3 left-3 w-11 h-11 rounded-full backdrop-blur-xl bg-black/40 flex items-center justify-center focus-ring smooth-transition hover:bg-black/60 shadow-lg"
            aria-label={isWishlisted ? 'Von Merkliste entfernen' : 'Zu Merkliste hinzufügen'}
          >
            <Heart
              className={`w-5 h-5 smooth-transition ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
            />
          </motion.button>
          
          {/* Quick View Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            onClick={handleQuickView}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 smooth-transition bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-sm py-2.5 px-8 rounded-xl shadow-2xl flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Quick View
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 bg-gradient-to-b from-zinc-900/50 to-zinc-900/80">
          {/* Product Name */}
          <h3 className="font-bold text-base text-white line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-gradient-primary smooth-transition">
            {product.name}
          </h3>
          
          {/* Price & SKU Row */}
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {product.price}€
            </div>
            <div className="text-xs font-mono text-zinc-400 bg-zinc-800/50 px-2.5 py-1.5 rounded-lg border border-zinc-700/50">
              {product.sku}
            </div>
          </div>
          
          {/* Delivery Info */}
          <div className="space-y-2 pt-3 border-t border-zinc-800/50">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-5 h-5 rounded-md bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3 h-3 text-red-400" />
              </div>
              <span className="font-semibold text-zinc-300">🇨🇳 Lieferbar aus China</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-3 h-3 text-blue-400" />
              </div>
              <span className="font-semibold text-zinc-300">8–17 Tage Lieferzeit</span>
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-[var(--radius-lg)] opacity-0 group-hover:opacity-100 smooth-transition pointer-events-none glow-accent" />
      </motion.div>
    </Link>
  );
}