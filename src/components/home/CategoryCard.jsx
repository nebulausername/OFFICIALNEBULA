import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';

export default function CategoryCard({ department, index, productCount = 0, image, className = "", featured = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative h-full"
    >
      <Link
        to={createPageUrl('Products') + `?department=${department.id}`}
        className="relative block h-full min-h-[220px] rounded-[24px] overflow-hidden transition-all duration-500"
        style={{
          boxShadow: '0 4px 20px -10px rgba(0,0,0,0.5)'
        }}
      >
        {/* Background Image with Zoom */}
        {image ? (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 bg-gradient-to-br from-zinc-800 to-zinc-900"
              style={{ backgroundImage: `url(${image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 group-hover:from-zinc-700 group-hover:to-zinc-800 transition-colors duration-300" />
        )}

        {/* Spotlight Effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06), transparent 40%)'
          }}
        />

        {/* Glass Border */}
        <div
          className="absolute inset-0 rounded-[24px] border border-white/10 group-hover:border-white/20 transition-colors z-20 pointer-events-none"
        />

        <div className="relative z-10 p-6 h-full flex flex-col justify-end">
          {/* Top Row: Badge */}
          <div className="absolute top-6 left-6">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 px-3 py-1 rounded-full flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-white">Collection</span>
            </div>
          </div>

          <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            {/* Title */}
            <h3 className={`font-black mb-1 text-white leading-tight group-hover:text-yellow-400 transition-colors ${featured ? 'text-4xl md:text-5xl' : 'text-2xl'}`}>
              {department.name}
            </h3>

            {/* Subtitle / Product Count */}
            <div className="flex items-center justify-between">
              <p className={`font-medium text-zinc-300 group-hover:text-white transition-colors ${featured ? 'text-lg' : 'text-sm'}`}>
                {productCount > 0 ? `${productCount} Produkte` : 'Jetzt entdecken'}
              </p>

              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-all duration-300">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}