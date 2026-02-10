import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import {
  Sparkles, Heart, ChevronLeft, ChevronRight,
  ShoppingBag, ArrowRight, Package, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '../wishlist/WishlistContext';
import TiltCard from '@/components/ui/TiltCard';

// Helper for random viewer count generator
const getRandomViewers = () => Math.floor(Math.random() * 15) + 4;

function DropProductCard({ product, onQuickView }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [currentViewers, setCurrentViewers] = useState(getRandomViewers());
  const inWishlist = isInWishlist(product.id);

  // Live Viewer Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly fluctuate viewers
      setCurrentViewers(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(3, prev + change);
      });
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
      className="flex-shrink-0 w-[280px] md:w-[320px] group relative"
    >
      <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
        <div
          className="relative rounded-[24px] overflow-hidden h-[450px] flex flex-col transition-all duration-500 bg-[#09090b]"
          style={{
            boxShadow: isHovered
              ? '0 0 30px rgba(214, 178, 94, 0.15), 0 10px 40px rgba(0,0,0,0.5)'
              : '0 10px 30px rgba(0,0,0,0.3)',
            border: isHovered ? '1px solid rgba(214, 178, 94, 0.3)' : '1px solid rgba(255,255,255,0.05)'
          }}
        >
          {/* Image Area */}
          <div className="relative h-[65%] w-full overflow-hidden bg-[#0F1115]">
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
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <div className="relative w-2 h-2">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                <div className="absolute inset-0 bg-red-500 rounded-full" />
              </div>
              <span className="text-[10px] font-bold text-white tracking-wide uppercase">
                {currentViewers} Live
              </span>
            </div>

            {/* Quick Actions */}
            <div className={`absolute bottom-4 right-4 flex flex-col gap-3 transition-all duration-300 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <button
                onClick={(e) => { e.preventDefault(); onQuickView?.(product); }}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gold transition-colors shadow-lg"
                title="Quick View"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={handleWishlistClick}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg ${inWishlist ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-red-500'}`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Info Area - Neon Style */}
          <div className="flex-1 p-6 relative flex flex-col justify-between">

            <div>
              {/* Manufacturer / Badges */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                  New Season
                </span>
                {product.stock && product.stock < 5 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 animate-pulse">
                    Low Stock
                  </span>
                )}
              </div>

              <h3 className="font-bold text-xl text-white leading-tight mb-2 group-hover:text-gold transition-colors line-clamp-2">
                {product.name}
              </h3>

              <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                <span>{product.sku || 'N/A'}</span>
                <span className="text-zinc-700">|</span>
                <span>Authentic Supply</span>
              </div>
            </div>

            {/* Price & Action */}
            <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 uppercase">Price</span>
                <span className="text-2xl font-black text-white">{product.price}€</span>
              </div>

              <Button
                size="sm"
                className={`bg-white/10 text-white hover:bg-gold hover:text-black border border-white/10 transition-all rounded-xl h-10 px-4 font-bold ${isHovered ? 'w-auto opacity-100' : 'w-10 px-0 opacity-50'}`}
              >
                {isHovered ? (
                  <>Buy Now <ArrowRight className="w-4 h-4 ml-2" /></>
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </Button>
            </div>

            {/* Neon Glow Line at Bottom */}
            <div className={`absolute bottom-0 left-0 h-[2px] bg-gold transition-all duration-500 ${isHovered ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
              style={{ boxShadow: '0 0 10px #D6B25E, 0 0 20px #D6B25E' }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Custom Countdown Component
const Countdown = () => {
  // Hardcoded next drop time for demo purposes (e.g., 2 days from now)
  // In a real app, this would come from a config/DB
  // For demo, we just make it look cool.
  return (
    <div className="flex items-center gap-4 text-center">
      {['02', '14', '09'].map((num, i) => (
        <div key={i} className="flex gap-1 items-baseline">
          <div className="bg-[#0F1115] border border-white/10 px-3 py-2 rounded-lg min-w-[50px]">
            <span className="text-2xl font-mono text-gold font-bold">{num}</span>
          </div>
          <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">{['d', 'h', 'm'][i]}</span>
          {i < 2 && <span className="text-zinc-700 text-xl font-bold px-1">:</span>}
        </div>
      ))}
    </div>
  )
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
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-24 relative overflow-hidden bg-[#050608]">

      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Glow */}
        <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-900/10 blur-[150px] rounded-full" />
        {/* Bottom Glow */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-gold/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative z-10">

        {/* Header Row */}
        <div className="flex flex-wrap items-end justify-between gap-8 mb-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Live Drop
              </span>
              <span className="text-zinc-500 text-sm font-medium">Next Drop in:</span>
              <Countdown />
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
              FRESH <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200">DROPS</span>
            </h2>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Product Slider */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar
        >
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] md:w-[320px] h-[450px] bg-white/5 rounded-[24px] animate-pulse" />
            ))
          ) : products.length > 0 ? (
            products.slice(0, 10).map((product, i) => (
              <div key={product.id} className="snap-start" style={{ transitionDelay: `${i * 50}ms` }}>
                <DropProductCard product={product} onQuickView={onQuickView} />
              </div>
            ))
          ) : (
            <div className="w-full h-64 flex flex-col items-center justify-center border border-white/10 rounded-2xl bg-white/5">
              <p className="text-zinc-500">Currently no drops live.</p>
              <Button variant="outline" className="mt-4 border-gold text-gold">Check Archive</Button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}