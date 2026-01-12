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
                className="px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-black flex items-center gap-1.5"
                style={{
                  background: 'rgba(100, 230, 150, 0.15)',
                  border: '1px solid rgba(100, 230, 150, 0.3)',
                  color: 'var(--success)',
                  boxShadow: 'var(--shadow-subtle)'
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[rgba(100,230,150,0.85)] animate-pulse" />
                Verfügbar
              </motion.div>
            ) : (
              <div className="px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-black"
                style={{
                  background: 'rgba(255, 100, 120, 0.15)',
                  border: '1px solid rgba(255, 100, 120, 0.3)',
                  color: 'var(--error)',
                  boxShadow: 'var(--shadow-subtle)'
                }}
              >
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
            className="absolute top-3 left-3 w-11 h-11 rounded-full backdrop-blur-xl flex items-center justify-center focus-ring smooth-transition"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-subtle)'
            }}
            aria-label={isWishlisted ? 'Von Merkliste entfernen' : 'Zu Merkliste hinzufügen'}
          >
            <Heart
              className={`w-5 h-5 smooth-transition ${
                isWishlisted ? 'text-gold' : 'text-white'
              }`}
              fill={isWishlisted ? 'var(--gold)' : 'none'}
              style={isWishlisted ? { filter: 'drop-shadow(0 0 8px rgba(var(--gold-rgb), 0.6))' } : {}}
            />
          </motion.button>
          
          {/* Quick View Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            onClick={handleQuickView}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 smooth-transition btn-gold font-black text-sm py-2.5 px-8 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Quick View
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
          {/* Product Name */}
          <h3 className="font-black text-base line-clamp-2 leading-snug min-h-[2.5rem] smooth-transition" style={{ 
            color: 'rgba(255, 255, 255, 0.95)',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)'
          }}>
            {product.name}
          </h3>
          
          {/* Price & SKU Row */}
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-3xl font-black" style={{ 
              color: 'rgba(255, 255, 255, 0.98)',
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)'
            }}>
              {product.price}€
            </div>
            <div className="text-xs font-mono font-black px-2.5 py-1.5 rounded-lg"
              style={{
                color: 'rgba(214, 178, 94, 0.9)',
                background: 'rgba(214, 178, 94, 0.10)',
                border: '1px solid rgba(214, 178, 94, 0.25)'
              }}
            >
              {product.sku}
            </div>
          </div>
          
          {/* Delivery Info */}
          <div className="space-y-2 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(214, 178, 94, 0.15)' }}
              >
                <MapPin className="w-3 h-3" style={{ color: 'rgba(214, 178, 94, 0.9)' }} />
              </div>
              <span className="font-black" style={{ color: 'rgba(255, 255, 255, 0.82)' }}>🇨🇳 Lieferbar aus China</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--surface2)' }}
              >
                <Clock className="w-3 h-3" style={{ color: 'rgba(255, 255, 255, 0.85)' }} />
              </div>
              <span className="font-black" style={{ color: 'rgba(255, 255, 255, 0.82)' }}>8–17 Tage Lieferzeit</span>
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div 
          className="absolute inset-0 rounded-[var(--radius-lg)] opacity-0 group-hover:opacity-100 smooth-transition pointer-events-none" 
          style={{ boxShadow: '0 0 40px rgba(var(--gold-rgb), 0.15)' }}
        />
      </motion.div>
    </Link>
  );
}