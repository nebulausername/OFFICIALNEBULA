import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

export default function ShopMegaMenu({ isOpen, onClose, categories = [], brands = [] }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Group categories by type for mega menu columns
  const columns = [
    { 
      title: 'Sneaker', 
      items: ['Nike', 'Air Jordan', 'Adidas', 'Puma', 'New Balance'],
      icon: '👟'
    },
    { 
      title: 'Kleidung', 
      items: ['Moncler', 'Stüssy', 'Supreme', 'Palm Angels', 'Essentials'],
      icon: '👕'
    },
    { 
      title: 'Taschen', 
      items: ['Louis Vuitton', 'Gucci', 'Prada', 'Dior', 'Balenciaga'],
      icon: '👜'
    },
    { 
      title: 'Accessoires', 
      items: ['Mützen & Caps', 'Geldbörsen', 'Gürtel', 'Uhren', 'Schmuck'],
      icon: '⌚'
    },
    { 
      title: 'Premium', 
      items: ['High Heels', 'Designer', 'Limitiert', 'VIP Drops', 'Sale'],
      icon: '💎',
      isSpecial: true
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          />

          {/* Mega Menu */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 -translate-x-1/2 top-20 z-50 w-full max-w-[1100px] mx-4"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(15, 18, 26, 0.98)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" style={{ color: '#D6B25E' }} />
                  <span className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Alle Kategorien</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                  style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                  <X className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                </button>
              </div>

              {/* Content Grid */}
              <div className="p-8 grid grid-cols-5 gap-8 max-h-[480px] overflow-y-auto custom-scrollbar">
                {columns.map((column, idx) => (
                  <div key={idx} className="space-y-4">
                    {/* Column Header */}
                    <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid rgba(214, 178, 94, 0.2)' }}>
                      <span className="text-xl">{column.icon}</span>
                      <h3 
                        className="text-sm font-bold uppercase tracking-wider"
                        style={{ color: column.isSpecial ? '#F2D27C' : '#D6B25E' }}
                      >
                        {column.title}
                      </h3>
                    </div>

                    {/* Links */}
                    <div className="space-y-1">
                      {column.items.map((item, itemIdx) => (
                        <Link
                          key={itemIdx}
                          to={createPageUrl('Products') + `?search=${encodeURIComponent(item)}`}
                          onClick={onClose}
                          className="block py-2 px-2 -mx-2 rounded-lg transition-all group"
                          style={{ color: 'rgba(255, 255, 255, 0.85)' }}
                        >
                          <span className="text-[15px] font-medium group-hover:text-gold transition-colors relative">
                            {item}
                            {itemIdx === 0 && column.isSpecial && (
                              <span 
                                className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded"
                                style={{ 
                                  background: 'rgba(214, 178, 94, 0.2)', 
                                  color: '#F2D27C',
                                  border: '1px solid rgba(214, 178, 94, 0.3)'
                                }}
                              >
                                NEW
                              </span>
                            )}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div 
                className="px-8 py-4 flex items-center justify-between"
                style={{ background: 'rgba(214, 178, 94, 0.05)', borderTop: '1px solid rgba(214, 178, 94, 0.15)' }}
              >
                <span className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Entdecke alle Premium-Produkte
                </span>
                <Link 
                  to={createPageUrl('Products')}
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #D6B25E, #F2D27C)',
                    color: '#0B0D12'
                  }}
                >
                  Alle Produkte →
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}