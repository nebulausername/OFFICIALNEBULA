import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Package, Heart, Eye, ShoppingBag, Flame, Clock, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../../utils';
import SectionHeader from '../antigravity/SectionHeader';

// Drop Product Card — Responsive
const DropProductCard = ({ product, toggleWishlist, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [viewers, setViewers] = useState(Math.floor(Math.random() * 200) + 50);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 10) - 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[320px] group relative snap-start"
    >
      <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
        <div
          className="relative rounded-[20px] sm:rounded-[24px] overflow-hidden h-[380px] sm:h-[420px] md:h-[450px] flex flex-col transition-all duration-500 bg-[#09090b]"
          style={{
            boxShadow: isHovered
              ? '0 0 40px rgba(214, 178, 94, 0.2), 0 15px 50px rgba(0,0,0,0.6)'
              : '0 10px 30px rgba(0,0,0,0.3)',
            border: isHovered ? '1px solid rgba(214, 178, 94, 0.35)' : '1px solid rgba(255,255,255,0.05)'
          }}
        >
          {/* Image Area */}
          <div className="relative h-[60%] sm:h-[65%] w-full overflow-hidden bg-[#0F1115]">
            {product.cover_image ? (
              <img
                src={product.cover_image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out"
                style={{ transform: isHovered ? 'scale(1.08)' : 'scale(1)' }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="w-12 h-12 text-zinc-700" />
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-80" />

            {/* LIVE Viewers Badge */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
              <div className="relative w-2 h-2">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                <div className="absolute inset-0 bg-red-500 rounded-full" />
              </div>
              <span className="text-[10px] sm:text-xs font-mono text-white font-bold">{viewers} watching</span>
            </div>

            {/* NEW Badge */}
            {product.badges?.includes('New') && (
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-gold to-yellow-300 text-black text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(214,178,94,0.5)]">
                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-0.5 mb-0.5" /> New
                </span>
              </div>
            )}

            {/* Quick Actions — Always visible on touch, hover on desktop */}
            <div className="absolute bottom-3 right-3 flex gap-2 z-[5] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleWishlistClick}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-red-400 transition-colors active:scale-90"
              >
                <Heart className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-gold transition-colors active:scale-90"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Info Area */}
          <div className="flex-1 p-4 sm:p-6 relative flex flex-col justify-between">
            {/* Brand */}
            {product.brand && (
              <span className="text-[10px] font-bold text-gold/60 uppercase tracking-[0.2em] mb-1">
                {typeof product.brand === 'object' ? product.brand.name : product.brand}
              </span>
            )}
            <h3 className="text-sm sm:text-base font-bold text-white leading-tight line-clamp-2 mb-auto">
              {product.name}
            </h3>

            {/* Price & Action */}
            <div className="flex items-center justify-between mt-3 sm:mt-4 border-t border-white/5 pt-3 sm:pt-4">
              <span className="text-xl sm:text-2xl font-black text-white">{product.price}€</span>
              <Button size="sm" className="bg-gradient-to-r from-[#F2D27C] to-[#D6B25E] text-black font-bold text-xs uppercase tracking-wider hover:from-white hover:to-white transition-all rounded-xl px-3 sm:px-4 py-2 h-auto shadow-[0_0_15px_rgba(214,178,94,0.3)] active:scale-95">
                {isHovered ? <>Buy Now <ArrowRight className="w-3 h-3 ml-1" /></> : <ShoppingBag className="w-3.5 h-3.5" />}
              </Button>
            </div>

            {/* Neon Bottom Line */}
            <div className={`absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-gold via-yellow-200 to-gold transition-all duration-700 ${isHovered ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
              style={{ boxShadow: '0 0 10px #D6B25E, 0 0 20px rgba(214,178,94,0.3), 0 0 40px rgba(214,178,94,0.1)' }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Countdown Component
const NextDropCountdown = () => {
  const [time, setTime] = useState({ hours: 4, minutes: 23, seconds: 11 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        else return { hours: 4, minutes: 23, seconds: 11 };
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Clock className="w-3.5 h-3.5 text-gold" />
      <span className="text-gold text-xs sm:text-sm font-mono font-bold tracking-wider" style={{ textShadow: '0 0 10px rgba(214,178,94,0.4)' }}>
        {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
      </span>
    </div>
  );
};

export default function FreshDropsSection({ products = [], loading, onQuickView }) {
  const scrollRef = useRef(null);
  const [wishlist, setWishlist] = useState(new Set());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const freshProducts = products.slice(0, 10);

  const toggleWishlist = (id) => {
    setWishlist(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollButtons, { passive: true });
      updateScrollButtons();
      return () => el.removeEventListener('scroll', updateScrollButtons);
    }
  }, [freshProducts]);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const cardWidth = window.innerWidth < 640 ? 276 : window.innerWidth < 768 ? 296 : 336;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #050608 0%, #0A0B0E 50%, #050608 100%)' }}>
      {/* Animated Background Aurora */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] bg-purple-900/10 rounded-full blur-[100px] sm:blur-[150px] animate-aurora-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-amber-900/8 rounded-full blur-[80px] sm:blur-[120px] animate-aurora-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-[2px] bg-gradient-to-r from-gold/80 to-gold/20 shadow-[0_0_10px_#D6B25E]" />
              <span className="text-gold text-xs font-bold uppercase tracking-[0.25em]" style={{ textShadow: '0 0 15px rgba(214,178,94,0.3)' }}>Live</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-1 animate-text-shimmer" style={{ backgroundImage: 'linear-gradient(90deg, #fff, #D6B25E, #fff)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', backgroundSize: '200% auto' }}>
              FRESH DROPS
            </h2>
            <div className="flex items-center gap-3 sm:gap-4 mt-2">
              <span className="text-zinc-400 text-xs sm:text-sm">Next drop in</span>
              <NextDropCountdown />
            </div>
          </div>
          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90 ${canScrollLeft ? 'bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 hover:shadow-[0_0_15px_rgba(214,178,94,0.2)]' : 'bg-white/5 border border-white/10 text-zinc-600 cursor-not-allowed'}`}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90 ${canScrollRight ? 'bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 hover:shadow-[0_0_15px_rgba(214,178,94,0.2)]' : 'bg-white/5 border border-white/10 text-zinc-600 cursor-not-allowed'}`}
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Product Scroll */}
        <div className="relative">
          {/* Scroll fade edges */}
          {canScrollLeft && <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#050608] to-transparent z-10 pointer-events-none" />}
          {canScrollRight && <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#050608] to-transparent z-10 pointer-events-none" />}

          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 snap-x snap-mandatory scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[320px] h-[380px] sm:h-[420px] md:h-[450px] rounded-[20px] sm:rounded-[24px] bg-zinc-900 animate-pulse snap-start" />
              ))
            ) : (
              freshProducts.map((product, i) => (
                <DropProductCard
                  key={product.id || i}
                  product={product}
                  toggleWishlist={toggleWishlist}
                  onQuickView={onQuickView}
                />
              ))
            )}
          </div>
        </div>

        {/* Mobile scroll hint */}
        <div className="flex sm:hidden justify-center mt-4 gap-1">
          <span className="text-zinc-600 text-[10px] uppercase tracking-widest">Swipe →</span>
        </div>

        {/* View All Link */}
        <div className="flex justify-center mt-8 sm:mt-12">
          <Link to="/products?sort=newest" className="group flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full border border-gold/20 bg-gold/5 text-gold text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-gold/10 hover:border-gold/40 transition-all duration-300 hover:shadow-[0_0_25px_rgba(214,178,94,0.15)] active:scale-95">
            Alle Drops ansehen <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}