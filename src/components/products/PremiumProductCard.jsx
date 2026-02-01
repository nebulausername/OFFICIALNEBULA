import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Eye, MapPin, Clock, Package, Timer } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import WishlistButton from '../wishlist/WishlistButton';
import { useI18n } from '../i18n/I18nProvider';
import { useProductModal } from '@/contexts/ProductModalContext';

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
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
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
      const difference = new Date(targetDate).getTime() - now.getTime();

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

export default function PremiumProductCard({ product }) {
  const navigate = useNavigate();
  const { t, formatCurrency } = useI18n();
  const { openProduct } = useProductModal();

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Daily Drop Logic
  const isDrop = product.drop_date && new Date(product.drop_date) > new Date();

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDrop) return; // Disable for drops

    if (product.colors?.length > 0 || product.sizes?.length > 0) {
      openProduct(product, 'quick');
    } else {
      openProduct(product, 'quick');
    }
  };

  return (
    <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`} className={isDrop ? 'pointer-events-none' : ''}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          perspective: 1000,
          rotateX: isDrop ? 0 : rotateX,
          rotateY: isDrop ? 0 : rotateY,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative h-full"
      >
        <div
          className="relative overflow-hidden rounded-2xl h-full transition-shadow duration-300"
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          {/* Hover Glow Border */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
            style={{ border: '1px solid rgba(var(--gold-rgb), 0.3)', boxShadow: 'inset 0 0 20px rgba(var(--gold-rgb), 0.1)' }}
          />

          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden rounded-t-2xl z-10"
            style={{ background: 'var(--bg3)' }}
          >
            <ProductImage
              src={product.cover_image}
              alt={product.name}
            />

            {/* Active Drop Countdown Overlay */}
            {isDrop && <DropCountdown targetDate={product.drop_date} />}

            {/* Gradient Overlay - always visible for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />

            {/* Availability Badge */}
            {!isDrop && (
              <div className="absolute top-3 end-3 z-20">
                {product.in_stock !== false ? (
                  <div className="badge-available glass-panel backdrop-blur-md">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-400" />
                    <span>Vorrat</span>
                  </div>
                ) : (
                  <div className="badge-unavailable glass-panel backdrop-blur-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>Ausverkauft</span>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Button */}
            <div className="absolute top-3 start-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <WishlistButton productId={product.id} size="sm" variant="glass" />
            </div>

            {/* Quick View Button - Floating */}
            {!isDrop && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0, scale: 1.05 }}
                onClick={handleQuickView}
                className="absolute bottom-4 left-4 right-4 h-10 opacity-0 group-hover:opacity-100 transition-all duration-300 btn-gold flex items-center justify-center gap-2 text-sm z-20 shadow-lg"
              >
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                <Eye className="w-4 h-4 relative z-10" />
                <span className="relative z-10 font-bold">{t('shop.quickView')}</span>
              </motion.button>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 relative z-10 bg-[#0E1015]">
            {/* Product Name */}
            <h3 className="font-bold text-sm md:text-base line-clamp-2 leading-tight min-h-[2.5rem] group-hover:text-gold transition-colors duration-300"
              style={{ color: '#FFFFFF' }}>
              {product.name}
            </h3>

            {/* Price & Actions */}
            <div className="flex items-end justify-between gap-2">
              <div className="flex flex-col">
                <div className="text-xl font-black tracking-tight" style={{ color: isDrop ? '#9CA3AF' : '#F2D27C' }}>
                  {formatCurrency(product.price)}
                </div>
                {product.min_order_quantity > 1 && (
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                    Ab {product.min_order_quantity} Stk
                  </span>
                )}
              </div>

              {!isDrop && (
                <div className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-white/5 text-zinc-400 border border-white/10 group-hover:border-gold/20 group-hover:text-gold/80 transition-colors">
                  {product.sku}
                </div>
              )}
            </div>

            {/* Delivery Info (Compact) */}
            {!isDrop && (
              <div className="pt-2 border-t border-white/5 flex items-center gap-3 text-[10px] text-zinc-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-600" />
                  <span>8-17 Tage</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-zinc-600" />
                  <span>Global</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}