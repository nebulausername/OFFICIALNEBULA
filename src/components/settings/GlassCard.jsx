import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={hover ? { y: -2 } : {}}
      className={`
        glass backdrop-blur-xl 
        bg-white/[0.02] 
        border border-white/[0.08] 
        rounded-[20px] 
        shadow-xl shadow-black/20
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}