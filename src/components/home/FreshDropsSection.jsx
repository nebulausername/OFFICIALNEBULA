import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import { 
  Sparkles, Heart, Check, ChevronLeft, ChevronRight, 
  ShoppingBag, ArrowRight, Truck, Clock, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '../wishlist/WishlistContext';

function DropProductCard({ product, onQuickView }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="flex-shrink-0 w-[280px] md:w-[300px]"
    >
      <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
        <div 
          className="rounded-[20px] overflow-hidden transition-all duration-300"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden">
            {/* Image */}
            {product.cover_image ? (
              <img
                src={product.cover_image}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Package className="w-16 h-16" style={{ color: 'rgba(255,255,255,0.2)' }} />
              </div>
            )}

            {/* Gradient Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.5) 100%)' }}
            />

            {/* Top Left: Wishlist Button */}
            <button
              onClick={handleWishlistClick}
              className="absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center transition-all z-10"
              style={{
                background: inWishlist ? 'rgba(239, 68, 68, 0.9)' : 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <Heart 
                className="w-5 h-5 transition-all" 
                style={{ color: inWishlist ? '#FFF' : 'rgba(255,255,255,0.9)' }}
                fill={inWishlist ? 'currentColor' : 'none'}
              />
            </button>

            {/* Top Right: Availability Badge */}
            <div 
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10"
              style={{
                background: product.in_stock !== false ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${product.in_stock !== false ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
              }}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ background: product.in_stock !== false ? '#22C55E' : '#EF4444' }}
              />
              <span 
                className="text-xs font-bold"
                style={{ color: product.in_stock !== false ? '#86EFAC' : '#FCA5A5' }}
              >
                {product.in_stock !== false ? 'Verfügbar' : 'Ausverkauft'}
              </span>
            </div>

            {/* Bottom: NEW Badge */}
            <div className="absolute bottom-3 left-3">
              <div 
                className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #D6B25E, #F2D27C)',
                  color: '#0B0D12'
                }}
              >
                NEU
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Product Name */}
            <h3 
              className="font-bold text-base line-clamp-2 leading-tight"
              style={{ color: 'rgba(255, 255, 255, 0.92)' }}
            >
              {product.name}
            </h3>

            {/* Price + SKU Row */}
            <div className="flex items-end justify-between">
              <div>
                <div 
                  className="text-2xl font-black"
                  style={{ color: '#F2D27C' }}
                >
                  {(product.price || 0).toFixed(2)}€
                </div>
                {product.sku && (
                  <div 
                    className="text-xs font-medium mt-0.5"
                    style={{ color: 'rgba(255, 255, 255, 0.45)' }}
                  >
                    {product.sku}
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            <div 
              className="flex items-center gap-4 pt-2"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>China</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>8–17 Tage</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function FreshDropsSection({ products = [], loading = false, onQuickView }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16 md:py-24 relative z-10" style={{ background: '#0B0D12' }}>
      {/* Subtle Background Glow - Behind Content Only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[120px] opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(214, 178, 94, 0.2), transparent 70%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 mb-5 rounded-full"
            style={{
              background: 'rgba(214, 178, 94, 0.08)',
              border: '1px solid rgba(214, 178, 94, 0.25)'
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#F2D27C' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F2D27C' }}>
              Fresh Drops
            </span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>

          {/* Title - HIGH CONTRAST */}
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-3 tracking-tight"
            style={{ 
              color: 'rgba(255, 255, 255, 0.96)',
              textShadow: '0 2px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            Brandneu
          </h2>

          {/* Subtitle - READABLE */}
          <p 
            className="text-base md:text-lg font-medium max-w-lg mx-auto mb-6"
            style={{ color: 'rgba(255, 255, 255, 0.75)' }}
          >
            Die <span style={{ color: '#F2D27C' }}>heißesten</span> Drops – limitiert & exklusiv ✨
          </p>

          {/* Mini Chips */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div 
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: 'rgba(196, 181, 253, 0.9)'
              }}
            >
              ⚡ Neu diese Woche
            </div>
            <div 
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(236, 72, 153, 0.15)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                color: 'rgba(251, 207, 232, 0.9)'
              }}
            >
              🔥 Limitierte Stückzahl
            </div>
          </div>
        </motion.div>

        {/* Product Slider */}
        <div className="relative">
          {/* Navigation Arrows - Desktop */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full items-center justify-center transition-all hover:scale-110"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <ChevronLeft className="w-6 h-6" style={{ color: '#FFF' }} />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full items-center justify-center transition-all hover:scale-110"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <ChevronRight className="w-6 h-6" style={{ color: '#FFF' }} />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
            style={{ scrollPaddingLeft: '1rem' }}
          >
            {loading ? (
              // Skeleton Loading
              Array.from({ length: 4 }).map((_, i) => (
                <div 
                  key={i}
                  className="flex-shrink-0 w-[280px] md:w-[300px] rounded-[20px] overflow-hidden"
                  style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                >
                  <div className="aspect-square animate-pulse" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-3/4 rounded animate-pulse" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
                    <div className="h-7 w-1/2 rounded animate-pulse" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
                  </div>
                </div>
              ))
            ) : products.length > 0 ? (
              products.slice(0, 6).map((product, index) => (
                <div key={product.id} className="snap-start">
                  <DropProductCard product={product} onQuickView={onQuickView} />
                </div>
              ))
            ) : (
              <div className="w-full py-12 text-center">
                <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Keine Produkte verfügbar</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
        >
          <Link to={createPageUrl('Products')}>
            <Button 
              className="h-12 px-8 rounded-xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #D6B25E, #F2D27C)',
                color: '#0B0D12'
              }}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Alle Fresh Drops
            </Button>
          </Link>
          <Link to={createPageUrl('Products')}>
            <Button 
              variant="outline"
              className="h-12 px-6 rounded-xl font-semibold"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.85)'
              }}
            >
              Zum Shop
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}