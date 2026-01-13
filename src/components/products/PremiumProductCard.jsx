import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Heart, Eye, MapPin, Clock, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

// Separate Image component with proper error handling
function ProductImage({ src, alt }) {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || imgError) {
    return (
      <div className="w-full h-full flex items-center justify-center"
        style={{ background: 'var(--bg3)' }}
      >
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ 
            background: 'rgba(214, 178, 94, 0.1)',
            border: '1px solid rgba(214, 178, 94, 0.2)'
          }}
        >
          <Package className="w-8 h-8" style={{ color: 'var(--gold)', opacity: 0.6 }} />
        </div>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--bg2)' }}>
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
        </div>
      )}
      <motion.img
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.4 }}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setImgError(true)}
      />
    </>
  );
}

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
        whileHover={{ y: -6, scale: 1.01 }}
        className="group smooth-transition relative overflow-hidden rounded-2xl"
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-subtle)'
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-t-2xl"
          style={{ background: 'var(--bg3)' }}
        >
          <ProductImage 
            src={product.cover_image} 
            alt={product.name}
          />
          
          {/* Gradient Overlay - always visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          

          
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
        <div className="p-5 space-y-3" style={{ background: 'var(--bg2)' }}>
          {/* Product Name */}
          <h3 className="font-bold text-base line-clamp-2 leading-snug min-h-[2.5rem] smooth-transition group-hover:text-gold" 
            style={{ color: '#FFFFFF' }}>
            {product.name}
          </h3>
          
          {/* Price & SKU Row */}
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-2xl font-black" style={{ color: '#F2D27C' }}>
              {product.price}€
            </div>
            <div className="text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg"
              style={{
                color: '#D6B25E',
                background: 'rgba(214, 178, 94, 0.15)',
                border: '1px solid rgba(214, 178, 94, 0.3)'
              }}
            >
              {product.sku}
            </div>
          </div>
          
          {/* Delivery Info */}
          <div className="space-y-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(214, 178, 94, 0.15)' }}
              >
                <MapPin className="w-3 h-3" style={{ color: '#D6B25E' }} />
              </div>
              <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>🇨🇳 Lieferbar aus China</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <Clock className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.6)' }} />
              </div>
              <span className="font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>8–17 Tage Lieferzeit</span>
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 smooth-transition pointer-events-none" 
          style={{ boxShadow: 'var(--shadow-glow)' }}
        />
      </motion.div>
    </Link>
  );
}