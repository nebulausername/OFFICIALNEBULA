import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import {
  Sparkles, Heart, ChevronLeft, ChevronRight,
  ShoppingBag, ArrowRight, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '../wishlist/WishlistContext';

function DropProductCard({ product, onQuickView }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const inWishlist = isInWishlist(product.id);

  const displayImage = previewImage || product.cover_image;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => {
        setIsHovered(false);
        setPreviewImage(null);
      }}
      className="flex-shrink-0 w-[280px] md:w-[300px] group"
    >
      <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
        <div
          className="glass-panel-hover rounded-[24px] overflow-hidden h-full flex flex-col bg-[#09090b] border border-zinc-800/50 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500"
        >
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-zinc-900">
            {/* Image with Fade Transition */}
            <div className="w-full h-full relative">
              {product.cover_image ? (
                <img
                  src={product.cover_image}
                  alt={product.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${!previewImage ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center absolute inset-0">
                  <Package className="w-16 h-16 text-zinc-800" />
                </div>
              )}

              {previewImage && (
                <img
                  src={previewImage}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover animate-fadeIn"
                />
              )}
            </div>

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)' }}
            />

            {/* Badges & Actions Container (Clean Layout) */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
              {/* Top Row */}
              <div className="flex justify-between items-start pointer-events-auto">
                {/* Left: Badges */}
                <div className="flex flex-col gap-2">
                  <span
                    className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-400 text-black shadow-lg backdrop-blur-md"
                  >
                    NEU
                  </span>
                </div>

                {/* Right: Availability */}
                {product.in_stock ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Verfügbar" />
                ) : (
                  <span className="px-2 py-0.5 rounded bg-red-500/90 text-white text-[10px] font-bold shadow-lg">SOLD</span>
                )}
              </div>
            </div>

            {/* Quick Actions (Center Hover) */}
            <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <motion.button
                initial={{ scale: 0.8 }}
                animate={isHovered ? { scale: 1 } : { scale: 0.8 }}
                onClick={(e) => {
                  e.preventDefault();
                  onQuickView?.(product);
                }}
                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-amber-400 transition-colors shadow-xl"
              >
                <ShoppingBag className="w-5 h-5" />
              </motion.button>
              <motion.button
                initial={{ scale: 0.8 }}
                animate={isHovered ? { scale: 1 } : { scale: 0.8 }}
                onClick={handleWishlistClick}
                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-xl"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current text-red-500' : ''}`} />
              </motion.button>
            </div>
          </div>

          {/* Info Section */}
          <div className="p-5 flex-1 flex flex-col gap-3 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex justify-between items-start gap-2 mb-1">
                <h3 className="font-bold text-base text-zinc-100 leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors">
                  {product.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="font-mono">{product.sku}</span>
                <span>•</span>
                <span className="text-green-400">Sofort lieferbar</span>
              </div>
            </div>

            {/* Color Preview Dots */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex flex-wrap gap-1.5 h-4">
                {product.colors.map(color => (
                  <button
                    key={color.id}
                    className="w-3 h-3 rounded-full border border-zinc-700/50 hover:scale-125 hover:border-white transition-all"
                    style={{ backgroundColor: color.hex }}
                    onMouseEnter={(e) => {
                      e.preventDefault();
                      if (color.images && color.images.length > 0) {
                        setPreviewImage(color.images[0]);
                      }
                    }}
                    onClick={(e) => e.preventDefault()}
                  />
                ))}
              </div>
            )}

            <div className="mt-auto pt-4 flex items-center justify-between">
              <span className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                {product.price}€
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="hover:bg-amber-400 hover:text-black rounded-lg transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  // onAddToCart logic? Or link
                }}
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
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
                <motion.div
                  key={product.id}
                  className="snap-start"
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: "easeOut"
                  }}
                >
                  <DropProductCard product={product} onQuickView={onQuickView} />
                </motion.div>
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