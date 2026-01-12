import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Home, 
  Package, 
  Heart, 
  ShoppingBag,
  HelpCircle,
  Crown,
  LogOut,
  MapPin,
  Clock,
  ChevronRight,
  Sparkles,
  Grid3x3,
  UserCircle2,
  Shield
} from 'lucide-react';

export default function MainDrawer({ 
  isOpen, 
  onClose, 
  user, 
  cartCount, 
  wishlistCount, 
  onOpenShopCategories,
  onOpenProfile 
}) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchEnd - touchStart;
    const isDownSwipe = distance > 80;
    if (isDownSwipe) {
      onClose();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const mainActions = [
    { 
      id: 'shop',
      label: 'Shop Kategorien', 
      icon: Grid3x3, 
      subtitle: 'Alle Produkte durchsuchen',
      gradient: 'from-purple-500 to-pink-500',
      onClick: () => {
        onOpenShopCategories();
      }
    },
    { 
      id: 'profile',
      label: 'Profil & Einstellungen', 
      icon: UserCircle2, 
      subtitle: 'Konto verwalten',
      gradient: 'from-blue-500 to-cyan-500',
      onClick: () => {
        onOpenProfile();
      }
    }
  ];

  const navItems = [
    { label: 'Home', icon: Home, to: 'Home', gradient: 'from-purple-500 to-pink-500' },
    { label: 'Shop', icon: Package, to: 'Products', gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Merkliste', icon: Heart, to: 'Wishlist', count: wishlistCount, gradient: 'from-red-500 to-pink-500' },
    { label: 'Warenkorb', icon: ShoppingBag, to: 'Cart', count: cartCount, gradient: 'from-green-500 to-emerald-500' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60]"
          />

          {/* Drawer - Mobile: Bottom Sheet, Desktop: Side */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="fixed bottom-0 left-0 right-0 md:top-0 md:left-0 md:bottom-0 md:right-auto md:w-[460px] lg:w-[520px] z-[61] overflow-hidden shadow-2xl flex flex-col md:rounded-none"
            style={{
              background: 'linear-gradient(180deg, rgba(8, 8, 12, 0.98), rgba(5, 5, 8, 0.98))',
              backdropFilter: 'blur(50px)',
              WebkitBackdropFilter: 'blur(50px)',
              borderTop: '1px solid rgba(214, 178, 94, 0.2)',
              borderRight: '1px solid rgba(214, 178, 94, 0.15)',
              maxHeight: '85vh',
              borderRadius: '32px 32px 0 0'
            }}
          >
            {/* Swipe Handle (Mobile) */}
            <div className="md:hidden flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* Header - Sticky */}
            <div className="sticky top-0 z-20 px-5 py-4 border-b border-white/10"
              style={{
                background: 'linear-gradient(180deg, rgba(8, 8, 12, 0.98), rgba(5, 5, 8, 0.95))',
                backdropFilter: 'blur(24px)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      filter: [
                        'drop-shadow(0 0 12px rgba(214, 178, 94, 0.4))',
                        'drop-shadow(0 0 20px rgba(214, 178, 94, 0.6))',
                        'drop-shadow(0 0 12px rgba(214, 178, 94, 0.4))',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 rounded-xl bg-white/8 border border-gold/25 flex items-center justify-center p-2"
                  >
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                      alt="Nebula Supply"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>NEBULA</h2>
                    <p className="text-sm font-bold text-gold">Premium Supply</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  <X className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.92)' }} />
                </motion.button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-5 space-y-6">
                {/* ACTION LAUNCHER - Top Priority */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-gold" />
                    <h3 className="text-base font-black uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                      Schnellzugriff
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {mainActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <motion.button
                          key={action.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08 }}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={action.onClick}
                          className="relative min-h-[110px] p-5 rounded-2xl text-left group overflow-hidden transition-all"
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255, 255, 255, 0.10)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-[0.12] transition-opacity duration-300`} />
                          
                          <div className="relative z-10 flex items-start justify-between h-full">
                            <div className="flex-1">
                              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-xl`}>
                                <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                              </div>
                              <h4 className="text-lg md:text-xl font-black mb-1.5 group-hover:text-gold2 transition-colors" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                                {action.label}
                              </h4>
                              <p className="text-sm md:text-base font-semibold" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                                {action.subtitle}
                              </p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-gold group-hover:text-gold2 transition-colors flex-shrink-0 mt-2" strokeWidth={2.5} />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Info - Compact */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-xl p-4 border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(214, 178, 94, 0.15)'
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>DE • CN</p>
                        <p className="text-xs font-semibold" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>Versand aus</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Clock className="w-4 h-4 text-gold flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>1-15 Tage</p>
                        <p className="text-xs font-semibold" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>Lieferzeit</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Navigation */}
                <div className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-wider px-2 mb-3" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                    Navigation
                  </h3>
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.to} to={createPageUrl(item.to)} onClick={onClose}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.04 }}
                          whileHover={{ x: 6, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-between min-h-[62px] px-5 rounded-xl transition-all group"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                              <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-base md:text-lg font-bold group-hover:text-gold2 transition-colors" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>
                              {item.label}
                            </span>
                          </div>
                          {item.count > 0 && (
                            <span className="px-3 py-1.5 rounded-full bg-gold text-black text-sm font-black shadow-lg">
                              {item.count}
                            </span>
                          )}
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>

                {/* VIP Badge */}
                {user?.is_vip && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-xl p-5 border relative overflow-hidden"
                    style={{
                      background: 'rgba(214, 178, 94, 0.08)',
                      border: '1px solid rgba(214, 178, 94, 0.3)',
                      backdropFilter: 'blur(16px)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/10" />
                    <div className="relative flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-xl">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-base font-black text-gold mb-1">VIP MITGLIED</p>
                        <p className="text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Exklusive Vorteile aktiv</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Secondary Actions */}
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-black uppercase tracking-wider px-2 mb-3" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                    Mehr
                  </h3>

                  <Link to={createPageUrl('Support')} onClick={onClose}>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 min-h-[54px] px-5 rounded-xl transition-all group"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      <HelpCircle className="w-5 h-5 text-green-400 flex-shrink-0" strokeWidth={2.5} />
                      <span className="text-base font-bold group-hover:text-green-300 transition-colors" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                        Support & Tickets
                      </span>
                    </motion.div>
                  </Link>

                  {user?.role === 'admin' && (
                    <Link to={createPageUrl('Admin')} onClick={onClose}>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45 }}
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 min-h-[54px] px-5 rounded-xl transition-all group"
                        style={{
                          background: 'rgba(255, 80, 80, 0.08)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255, 80, 80, 0.25)'
                        }}
                      >
                        <Shield className="w-5 h-5 text-red-400 flex-shrink-0" strokeWidth={2.5} />
                        <span className="text-base font-bold group-hover:text-red-300 transition-colors" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                          Admin Dashboard
                        </span>
                      </motion.div>
                    </Link>
                  )}

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const { base44 } = require('@/api/base44Client');
                      base44.auth.logout();
                    }}
                    className="w-full flex items-center justify-center gap-3 min-h-[56px] px-5 rounded-xl transition-all group"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.10)'
                    }}
                  >
                    <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" style={{ color: 'rgba(255, 255, 255, 0.65)' }} strokeWidth={2.5} />
                    <span className="text-base font-bold group-hover:text-red-400 transition-colors" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                      Abmelden
                    </span>
                  </motion.button>
                </div>

                {/* Bottom Padding */}
                <div className="h-4" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}