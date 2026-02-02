import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, ShoppingBag } from 'lucide-react';

export default function CategoryCard({ department, index, productCount = 0, image, products = [], className = "", featured = false }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Collect valid images: Main Department Image + up to 3 Product Images
  const availableImages = [image, ...products.slice(0, 3).map(p => p.image).filter(Boolean)].filter(Boolean);

  useEffect(() => {
    let interval;
    if (isHovered && availableImages.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % availableImages.length);
      }, 2000);
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, availableImages.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative h-full ${className}`}
    >
      <Link
        to={createPageUrl('Products') + `?department=${department.id}`}
        className="relative block h-full min-h-[220px] rounded-[24px] overflow-hidden transition-all duration-500"
        style={{
          boxShadow: isHovered ? '0 20px 40px -10px rgba(214, 178, 94, 0.2)' : '0 4px 20px -10px rgba(0,0,0,0.5)'
        }}
      >
        {/* Background Image Slideshow */}
        <div className="absolute inset-0 overflow-hidden bg-zinc-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${availableImages[currentImageIndex] || image})` }}
            />
          </AnimatePresence>

          {/* Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent opacity-60" />
        </div>

        {/* Spotlight Effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06), transparent 40%)'
          }}
        />

        {/* Glass Border */}
        <div
          className="absolute inset-0 rounded-[24px] border border-white/10 group-hover:border-gold/30 transition-colors z-20 pointer-events-none duration-500"
        />

        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
          {/* Top Row: Badge */}
          <div className="flex justify-between items-start">
            <div className={`backdrop-blur-md bg-white/10 border border-white/20 px-3 py-1 rounded-full flex items-center gap-2 transition-all duration-300 ${isHovered ? 'bg-gold/20 border-gold/30' : ''}`}>
              <Sparkles className={`w-3 h-3 ${isHovered ? 'text-white' : 'text-gold'}`} />
              <span className="text-[10px] uppercase font-bold tracking-wider text-white">Collection</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {/* Subtitle / Preview Text */}
            <div className="overflow-hidden h-6 mb-1">
              <AnimatePresence mode="popLayout" initial={false}>
                {isHovered && products.length > 0 ? (
                  <motion.div
                    key="preview"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="text-xs font-medium text-gold flex items-center gap-2"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    {products.length} Premium Artikel
                  </motion.div>
                ) : (
                  <motion.div
                    key="count"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className={`font-medium transition-colors ${featured ? 'text-lg text-zinc-300' : 'text-sm text-zinc-400'}`}
                  >
                    {productCount > 0 ? `${productCount} Produkte` : 'Coming Soon'}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Title */}
            <h3 className={`font-black text-white leading-tight group-hover:text-gold transition-colors duration-300 ${featured ? 'text-4xl md:text-5xl' : 'text-2xl'}`}>
              {department.name}
            </h3>

            {/* Shop Now Micro-CTA */}
            <div className={`mt-4 overflow-hidden transition-all duration-500 ${isHovered ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gold transition-colors">
                Jetzt Shoppen
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* Default Indicator (Hidden on Hover) */}
            <div className={`mt-2 transition-all duration-300 ${isHovered ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}