import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PremiumProductCard from '../products/PremiumProductCard';

// Department-spezifische Farben
const getDepartmentGradient = (name) => {
  const deptName = name?.toLowerCase() || '';
  if (deptName.includes('herren') || deptName.includes('männer') || deptName.includes('men')) {
    return {
      gradient: 'from-blue-500/20 via-indigo-500/15 to-purple-500/20',
      glow: 'rgba(59, 130, 246, 0.15)',
      accent: 'rgba(99, 102, 241, 0.2)'
    };
  }
  if (deptName.includes('damen') || deptName.includes('frauen') || deptName.includes('women')) {
    return {
      gradient: 'from-pink-500/20 via-rose-500/15 to-fuchsia-500/20',
      glow: 'rgba(236, 72, 153, 0.15)',
      accent: 'rgba(219, 39, 119, 0.2)'
    };
  }
  if (deptName.includes('unisex') || deptName.includes('alle')) {
    return {
      gradient: 'from-emerald-500/20 via-teal-500/15 to-cyan-500/20',
      glow: 'rgba(16, 185, 129, 0.15)',
      accent: 'rgba(20, 184, 166, 0.2)'
    };
  }
  if (deptName.includes('accessoire')) {
    return {
      gradient: 'from-purple-500/20 via-violet-500/15 to-fuchsia-500/20',
      glow: 'rgba(168, 85, 247, 0.15)',
      accent: 'rgba(139, 92, 246, 0.2)'
    };
  }
  return {
    gradient: 'from-amber-500/20 via-orange-500/15 to-yellow-500/20',
    glow: 'rgba(245, 158, 11, 0.15)',
    accent: 'rgba(251, 146, 60, 0.2)'
  };
};

export default function CategoryProductsSection({ 
  department, 
  products = [], 
  loading = false,
  onQuickView,
  onRetry
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const deptColors = getDepartmentGradient(department?.name);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      
      // Calculate scroll progress
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress((scrollLeft / maxScroll) * 100);
      } else {
        setScrollProgress(0);
      }
    }
  };

  useEffect(() => {
    checkScroll();
    if (scrollRef.current) {
      scrollRef.current.addEventListener('scroll', checkScroll);
      return () => {
        if (scrollRef.current) {
          scrollRef.current.removeEventListener('scroll', checkScroll);
        }
      };
    }
  }, [products]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!department) return null;

  return (
    <section className="py-12 md:py-16 relative z-10 overflow-hidden" style={{ background: '#0B0D12' }}>
      {/* Animated Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/4 w-[600px] h-[400px] rounded-full blur-[120px]"
          style={{ background: `radial-gradient(circle, ${deptColors.glow}, transparent 70%)` }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: `radial-gradient(circle, ${deptColors.accent}, transparent 70%)` }}
        />
      </div>

      {/* Gradient Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${deptColors.gradient} opacity-30 pointer-events-none`}
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Scroll Progress Bar */}
        {products.length > 0 && (
          <div className="mb-4 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ 
                background: `linear-gradient(90deg, ${deptColors.glow}, ${deptColors.accent})`,
                width: `${scrollProgress}%`
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-6 md:mb-8 group"
        >
          <div>
            <motion.h2 
              className="text-3xl md:text-4xl font-black mb-2 tracking-tight"
              whileHover={{ scale: 1.02 }}
              style={{ 
                color: 'rgba(255, 255, 255, 0.96)',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)'
              }}
            >
              {department.name}
            </motion.h2>
            <motion.p 
              className="text-sm md:text-base font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={{ color: 'rgba(255, 255, 255, 0.65)' }}
            >
              {products.length > 0 ? `${products.length} Produkte verfügbar` : 'Entdecke unsere Kollektion'}
            </motion.p>
          </div>
          
          <Link to={createPageUrl('Products') + `?department=${department.id}`}>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Button 
                className="h-11 px-6 rounded-xl font-bold hidden sm:flex items-center gap-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                Alle anzeigen
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Product Slider */}
        <div className="relative">
          {/* Navigation Arrows - Desktop */}
          {canScrollLeft && products.length > 0 && (
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
          {canScrollRight && products.length > 0 && (
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
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
            style={{ scrollPaddingLeft: '1rem' }}
          >
            {loading ? (
              // Skeleton Loading
              Array.from({ length: 4 }).map((_, i) => (
                <div 
                  key={i}
                  className="flex-shrink-0 w-[280px] md:w-[300px] rounded-2xl overflow-hidden"
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
              products.map((product, index) => (
                <motion.div 
                  key={product.id} 
                  className="snap-start flex-shrink-0 w-[280px] md:w-[300px]"
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: "easeOut"
                  }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <PremiumProductCard 
                    product={product} 
                    onQuickView={onQuickView}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="w-full py-12 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ 
                    background: `rgba(214, 178, 94, 0.1)`, 
                    border: `1px solid ${deptColors.accent}`,
                    boxShadow: `0 0 30px ${deptColors.glow}`
                  }}
                >
                  <Sparkles className="w-8 h-8" style={{ color: '#D6B25E' }} />
                </motion.div>
                <h3 
                  className="text-lg font-bold mb-2"
                  style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                >
                  Noch keine Produkte in dieser Kategorie
                </h3>
                <p 
                  className="text-sm mb-2"
                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                >
                  {loading ? 'Lade Produkte...' : 'Bald verfügbar oder versuche es später erneut'}
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div 
                    className="text-xs mb-4 p-3 rounded-lg"
                    style={{ 
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontFamily: 'monospace'
                    }}
                  >
                    <div>Department ID: {department.id}</div>
                    <div>Department Name: {department.name}</div>
                    <div>Products loaded: {products.length}</div>
                    <div>Loading: {loading ? 'Yes' : 'No'}</div>
                    <div className="mt-2 text-xs opacity-75">
                      Check console for detailed debug info
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-center gap-3">
                  {onRetry && !loading && (
                    <Button 
                      onClick={onRetry}
                      className="h-10 px-6 rounded-xl font-semibold"
                      style={{
                        background: 'rgba(214, 178, 94, 0.15)',
                        border: '1px solid rgba(214, 178, 94, 0.3)',
                        color: '#F2D27C'
                      }}
                    >
                      Erneut versuchen
                    </Button>
                  )}
                  <Link to={createPageUrl('Products') + `?department=${department.id}`}>
                    <Button 
                      className="h-10 px-6 rounded-xl font-semibold"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: 'rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      Zum Shop
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mt-6 sm:hidden"
        >
          <Link to={createPageUrl('Products') + `?department=${department.id}`}>
            <Button 
              className="h-11 px-8 rounded-xl font-bold flex items-center gap-2"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              Alle {department.name} Produkte
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
