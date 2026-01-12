import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Package, Heart, ShoppingCart, User, Crown, Store, Settings, ChevronRight, MapPin, Clock } from 'lucide-react';

export default function MainDrawer({ 
  isOpen, 
  onClose, 
  user, 
  cartCount, 
  wishlistCount,
  onOpenShopCategories,
  onOpenProfile
}) {
  const [dragStartY, setDragStartY] = React.useState(0);
  const [dragOffsetY, setDragOffsetY] = React.useState(0);

  const handleTouchStart = (e) => {
    setDragStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const offset = currentY - dragStartY;
    if (offset > 0) {
      setDragOffsetY(offset);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffsetY > 100) {
      onClose();
    }
    setDragOffsetY(0);
  };

  const menuItems = [
    { icon: Home, label: 'Home', to: 'Home', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Package, label: 'Shop', to: 'Products', gradient: 'from-purple-500 to-pink-500' },
    { icon: Heart, label: 'Merkliste', to: 'Wishlist', badge: wishlistCount, gradient: 'from-pink-500 to-rose-500' },
    { icon: ShoppingCart, label: 'Warenkorb', to: 'Cart', badge: cartCount, gradient: 'from-green-500 to-emerald-500' }
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
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60]"
          />

          {/* Main Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0, y: dragOffsetY }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="fixed top-0 right-0 bottom-0 w-[90%] max-w-md bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-l-2 border-purple-500/30 z-[60] overflow-hidden shadow-2xl flex flex-col"
            style={{
              background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.98), rgba(5, 5, 8, 0.98))',
              backdropFilter: 'blur(40px)'
            }}
          >
            {/* Swipe Handle (Mobile) */}
            <div className="md:hidden flex justify-center py-2 px-4 border-b border-white/5">
              <div className="w-12 h-1.5 rounded-full bg-zinc-700" />
            </div>

            {/* Header */}
            <div className="relative p-6 border-b border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-2xl" />
              
              <div className="relative flex items-center justify-between mb-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    animate={{
                      filter: [
                        'drop-shadow(0 0 16px rgba(168, 85, 247, 0.5))',
                        'drop-shadow(0 0 24px rgba(236, 72, 153, 0.5))',
                        'drop-shadow(0 0 16px rgba(168, 85, 247, 0.5))',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center p-2"
                  >
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                      alt="Nebula"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  <span className="text-2xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    NEBULA
                  </span>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-11 h-11 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center transition-all border border-white/10"
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Compact Delivery Info */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="m-4 p-4 rounded-2xl glass-panel"
              >
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="text-xs text-zinc-400 font-bold">Versand aus</div>
                    <div className="text-sm font-black text-white">🇨🇳 China</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-xs text-zinc-400 font-bold">Lieferzeit</div>
                    <div className="text-sm font-black text-white">8-17 Tage</div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Nav */}
              <nav className="px-4 py-4 space-y-2">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={createPageUrl(item.to)} onClick={onClose}>
                      <motion.div
                        whileHover={{ x: 4, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-between p-4 rounded-xl glass-panel-hover min-h-[64px]"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-black text-white text-base">{item.label}</span>
                        </div>
                        {item.badge > 0 && (
                          <span className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-500 text-zinc-900 text-sm font-black rounded-full flex items-center justify-center shadow-lg">
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Launcher Buttons */}
              <div className="px-4 py-6 space-y-3 border-t border-white/10 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.button
                    whileHover={{ x: 4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenShopCategories}
                    className="w-full p-5 rounded-2xl glass-panel-hover border-2 border-gold/30 min-h-[72px]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-xl">
                          <Store className="w-6 h-6 text-zinc-900" strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                          <div className="font-black text-white text-lg">Shop Kategorien</div>
                          <div className="text-xs text-gold font-bold">Alle Produkte durchstöbern</div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gold" strokeWidth={3} />
                    </div>
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    whileHover={{ x: 4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenProfile}
                    className="w-full p-5 rounded-2xl glass-panel-hover border-2 border-purple-500/30 min-h-[72px]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                          <Settings className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                          <div className="font-black text-white text-lg">Profil & Einstellungen</div>
                          <div className="text-xs text-purple-400 font-bold">Konto verwalten</div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-purple-400" strokeWidth={3} />
                    </div>
                  </motion.button>
                </motion.div>
              </div>

              {/* User VIP Status */}
              {user?.is_vip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/40"
                >
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    <div>
                      <div className="font-black text-white">VIP Member</div>
                      <div className="text-xs text-yellow-400 font-bold">Premium Support & Benefits</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}