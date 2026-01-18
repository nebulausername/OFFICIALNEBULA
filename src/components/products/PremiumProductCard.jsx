import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Eye, MapPin, Clock, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import WishlistButton from '../wishlist/WishlistButton';
import { useI18n } from '../i18n/I18nProvider';

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
  const navigate = useNavigate();
  const { t, formatCurrency } = useI18n();
  
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.colors?.length > 0 || product.sizes?.length > 0) {
      onQuickView?.(product);
    } else {
      navigate(createPageUrl('ProductDetail') + `?id=${product.id}`);
    }
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
          

          
          {/* Availability Badge - HIGH CONTRAST */}
          <div className="absolute top-3 end-3 z-10">
            {product.in_stock !== false ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3.5 py-2 rounded-full backdrop-blur-xl text-xs font-bold flex items-center gap-2"
                style={{
                  background: 'rgba(52, 211, 153, 0.18)',
                  border: '1px solid rgba(52, 211, 153, 0.35)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'rgb(52, 211, 153)' }} />
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{t('shop.available')}</span>
              </motion.div>
            ) : (
              <div 
                className="px-3.5 py-2 rounded-full backdrop-blur-xl text-xs font-bold flex items-center gap-2"
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: 'rgb(239, 68, 68)' }} />
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{t('shop.soldOut')}</span>
              </div>
            )}
          </div>
          
          {/* Wishlist Button - FLOATING GLASS PREMIUM */}
          <div className="absolute top-3 start-3 z-10">
            <WishlistButton productId={product.id} size="md" variant="glass" />
          </div>
          
          {/* Quick View Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            onClick={handleQuickView}
            className="absolute bottom-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 opacity-0 group-hover:opacity-100 smooth-transition btn-gold font-black text-sm py-2.5 px-8 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {t('shop.quickView')}
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
              {formatCurrency(product.price)}
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