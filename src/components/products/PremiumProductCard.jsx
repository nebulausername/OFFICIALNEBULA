import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Eye, MapPin, Clock, Package, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

function DropCountdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = new Date(targetDate) - now;

      if (difference <= 0) {
        clearInterval(interval);
        // refresh page or trigger callback?
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
      <div className="text-white font-black uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
        <Timer className="w-4 h-4 text-purple-400 animate-pulse" />
        Dropping In
      </div>
      <div className="flex gap-2 text-center">
        {timeLeft.days > 0 && (
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white">{timeLeft.days}</span>
            <span className="text-[10px] text-zinc-400 uppercase">Tage</span>
          </div>
        )}
        {timeLeft.days > 0 && <span className="text-2xl font-bold text-zinc-600">:</span>}
        <div className="flex flex-col">
          <span className="text-2xl font-black text-white">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-zinc-400 uppercase">Std</span>
        </div>
        <span className="text-2xl font-bold text-zinc-600">:</span>
        <div className="flex flex-col">
          <span className="text-2xl font-black text-white">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-zinc-400 uppercase">Min</span>
        </div>
        <span className="text-2xl font-bold text-zinc-600">:</span>
        <div className="flex flex-col">
          <span className="text-2xl font-black text-white w-8">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-zinc-400 uppercase">Sek</span>
        </div>
      </div>
    </div>
  );
}

export default function PremiumProductCard({ product, onQuickView }) {
  const navigate = useNavigate();
  const { t, formatCurrency } = useI18n();

  // Daily Drop Logic
  const isDrop = product.drop_date && new Date(product.drop_date) > new Date();

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDrop) return; // Disable for drops

    if (product.colors?.length > 0 || product.sizes?.length > 0) {
      onQuickView?.(product);
    } else {
      navigate(createPageUrl('ProductDetail') + `?id=${product.id}`);
    }
  };

  return (
    <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`} className={isDrop ? 'pointer-events-none' : ''}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={!isDrop ? { y: -6, scale: 1.01 } : {}}
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

          {/* Active Drop Countdown Overlay */}
          {isDrop && <DropCountdown targetDate={product.drop_date} />}

          {/* Gradient Overlay - always visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />


          {/* Availability Badge - Hide if Drop */}
          {!isDrop && (
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
          )}

          {/* Wishlist Button - Hide for drops? Maybe keep it. */}
          <div className="absolute top-3 start-3 z-10">
            <WishlistButton productId={product.id} size="md" variant="glass" />
          </div>

          {/* Quick View Button - Hide for drops */}
          {!isDrop && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              onClick={handleQuickView}
              className="absolute bottom-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 opacity-0 group-hover:opacity-100 smooth-transition btn-gold font-black text-sm py-2.5 px-8 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {t('shop.quickView')}
            </motion.button>
          )}
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
            <div className="text-2xl font-black" style={{ color: isDrop ? '#9CA3AF' : '#F2D27C', filter: isDrop ? 'grayscale(1)' : 'none' }}>
              {formatCurrency(product.price)}
            </div>
            {!isDrop && (
              <div className="text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg"
                style={{
                  color: '#D6B25E',
                  background: 'rgba(214, 178, 94, 0.15)',
                  border: '1px solid rgba(214, 178, 94, 0.3)'
                }}
              >
                {product.sku}
              </div>
            )}
            {isDrop && (
              <div className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                COMING SOON
              </div>
            )}
          </div>

          {/* Delivery Info - Hide for drops */}
          {!isDrop && (
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
          )}
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