import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import { ChevronRight, Shirt, ShoppingBag, Watch, Users } from 'lucide-react';

// Category-specific icons and colors
const categoryConfig = {
  herren: {
    icon: Shirt,
    gradient: 'from-blue-500/20 to-indigo-500/20',
    iconBg: 'from-blue-500/30 to-indigo-500/30'
  },
  damen: {
    icon: ShoppingBag,
    gradient: 'from-pink-500/20 to-rose-500/20',
    iconBg: 'from-pink-500/30 to-rose-500/30'
  },
  accessoires: {
    icon: Watch,
    gradient: 'from-purple-500/20 to-violet-500/20',
    iconBg: 'from-purple-500/30 to-violet-500/30'
  },
  unisex: {
    icon: Users,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconBg: 'from-emerald-500/30 to-teal-500/30'
  }
};

const getConfig = (name) => {
  const key = name?.toLowerCase() || '';
  if (key.includes('herren') || key.includes('männer') || key.includes('men')) return categoryConfig.herren;
  if (key.includes('damen') || key.includes('frauen') || key.includes('women')) return categoryConfig.damen;
  if (key.includes('accessoire') || key.includes('zubehör')) return categoryConfig.accessoires;
  if (key.includes('unisex') || key.includes('alle')) return categoryConfig.unisex;
  return categoryConfig.unisex;
};

export default function CategoryCard({ department, index, productCount = 0 }) {
  const config = getConfig(department.name);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative"
    >
      <Link
        to={createPageUrl('Products') + `?department=${department.id}`}
        className="relative block rounded-[20px] overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(214, 178, 94, 0.2)'
        }}
      >
        {/* Hover Glow Effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-[20px]"
          style={{ 
            boxShadow: '0 0 40px rgba(214, 178, 94, 0.15), inset 0 0 30px rgba(214, 178, 94, 0.05)',
            border: '1px solid rgba(214, 178, 94, 0.4)'
          }}
        />

        {/* Background Gradient on Hover */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />

        <div className="relative p-5 md:p-6 min-h-[160px] md:min-h-[180px] flex flex-col">
          {/* Top Row: Icon + Chevron */}
          <div className="flex items-start justify-between mb-4">
            {/* Icon Badge */}
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${config.iconBg} relative overflow-hidden`}
              style={{
                border: '1px solid rgba(214, 178, 94, 0.3)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
              }}
            >
              {/* Inner Glow */}
              <div 
                className="absolute inset-0 opacity-50"
                style={{ background: 'radial-gradient(circle at 30% 30%, rgba(214, 178, 94, 0.3), transparent 60%)' }}
              />
              <Icon className="w-7 h-7 md:w-8 md:h-8 relative z-10" style={{ color: '#F2D27C' }} />
            </motion.div>

            {/* Chevron Arrow */}
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
              style={{ 
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
            </div>
          </div>

          {/* Title */}
          <h3 
            className="text-lg md:text-xl font-bold mb-1 transition-colors duration-300 group-hover:text-gold"
            style={{ color: 'rgba(255, 255, 255, 0.92)' }}
          >
            {department.name}
          </h3>

          {/* Subtitle / Product Count */}
          <p 
            className="text-sm font-medium"
            style={{ color: 'rgba(255, 255, 255, 0.55)' }}
          >
            {productCount > 0 ? `${productCount} Produkte` : 'Entdecken'}
          </p>

          {/* Bottom Accent Line */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(214, 178, 94, 0.5), transparent)' }}
          />
        </div>
      </Link>
    </motion.div>
  );
}