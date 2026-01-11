import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { base44 } from '@/api/base44Client';
import { Heart, ShoppingCart, Menu, X, Home, Package, User, Crown, MessageCircle, Bell, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PremiumHeader() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      const [cartItems, wishlistItems] = await Promise.all([
        base44.entities.StarCartItem.filter({ user_id: userData.id }),
        base44.entities.WishlistItem.filter({ user_id: userData.id })
      ]);
      
      setCartCount(cartItems.length);
      setWishlistCount(wishlistItems.length);
    } catch (error) {
      // User not logged in
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const IconButton = ({ icon: Icon, label, count, to, onClick }) => (
    <Link to={to} onClick={onClick}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center hover:from-purple-500/30 hover:to-pink-500/30 smooth-transition focus-ring border border-purple-500/30"
        aria-label={label}
      >
        <Icon className="w-5 h-5 text-purple-300" />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg"
          >
            {count}
          </motion.span>
        )}
      </motion.button>
    </Link>
  );

  return (
    <>
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/40 border-b border-white/10 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(168, 85, 247, 0.5)',
                      '0 0 30px rgba(236, 72, 153, 0.5)',
                      '0 0 20px rgba(168, 85, 247, 0.5)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl"
                >
                  <span className="text-white font-black text-2xl">N</span>
                </motion.div>
                <span className="hidden sm:block text-2xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  NEBULA
                </span>
              </motion.div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to={createPageUrl('Home')} className="text-base font-black text-white hover:text-purple-400 smooth-transition relative group">
                Home
                <motion.span
                  className="absolute bottom-[-4px] left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full smooth-transition"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                />
              </Link>
              <Link to={createPageUrl('Products')} className="text-base font-black text-white hover:text-purple-400 smooth-transition relative group">
                Shop
                <motion.span
                  className="absolute bottom-[-4px] left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full smooth-transition"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                />
              </Link>
              <Link to={createPageUrl('Profile')} className="text-base font-black text-white hover:text-purple-400 smooth-transition relative group">
                Profil
                <motion.span
                  className="absolute bottom-[-4px] left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full smooth-transition"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                />
              </Link>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-2 md:gap-3">
              {user?.is_vip && (
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 10px rgba(251, 191, 36, 0.3)',
                      '0 0 20px rgba(251, 191, 36, 0.5)',
                      '0 0 10px rgba(251, 191, 36, 0.3)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="hidden md:flex px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 items-center gap-1.5 shadow-lg"
                >
                  <Crown className="w-4 h-4 text-zinc-900" />
                  <span className="text-xs font-black text-zinc-900">VIP</span>
                </motion.div>
              )}
              
              <IconButton 
                icon={Heart} 
                label="Merkliste" 
                count={wishlistCount} 
                to={createPageUrl('Wishlist')} 
              />
              
              <IconButton 
                icon={Bell} 
                label="Benachrichtigungen" 
                count={0} 
                to={createPageUrl('Profile')} 
              />
              
              <IconButton 
                icon={ShoppingCart} 
                label="Warenkorb" 
                count={cartCount} 
                to={createPageUrl('Cart')} 
              />
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 glass-panel rounded-full flex items-center justify-center hover:bg-[var(--glass-hover)] smooth-transition md:hidden focus-ring"
                aria-label="Menu öffnen"
              >
                <Menu className="w-5 h-5 text-[hsl(var(--text))]" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="fixed top-0 right-0 bottom-0 w-[90%] max-w-md bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-l-2 border-purple-500/30 z-50 overflow-y-auto custom-scrollbar shadow-2xl shadow-purple-500/20"
            >
              {/* Header */}
              <div className="relative p-6 border-b border-white/10">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-2xl" />
                
                <div className="relative flex items-center justify-between">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(168, 85, 247, 0.6)',
                          '0 0 30px rgba(236, 72, 153, 0.6)',
                          '0 0 20px rgba(168, 85, 247, 0.6)',
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl"
                    >
                      <span className="text-white font-black text-2xl">N</span>
                    </motion.div>
                    <span className="text-2xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">NEBULA</span>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="w-11 h-11 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center transition-all border border-white/10"
                    aria-label="Menu schließen"
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Delivery Info Bar */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="m-4 p-4 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 border border-white/10 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-zinc-400 font-semibold">Versand aus</div>
                    <div className="text-sm font-black text-white">🇨🇳 China</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-zinc-400 font-semibold">Lieferzeit</div>
                    <div className="text-sm font-black text-white">8-17 Tage</div>
                  </div>
                </div>
              </motion.div>

              {/* User Info */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl"
                    >
                      <User className="w-7 h-7 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-white truncate">{user.full_name}</div>
                      <div className="text-xs text-zinc-400 truncate">{user.email}</div>
                    </div>
                  </div>
                  {user.is_vip && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 shadow-lg"
                    >
                      <Crown className="w-4 h-4 text-zinc-900" />
                      <span className="text-xs font-black text-zinc-900">VIP MEMBER</span>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Menu Items */}
              <nav className="px-4 py-6 space-y-2">
                {[
                  { icon: Home, label: 'Home', to: 'Home', gradient: 'from-blue-500 to-cyan-500' },
                  { icon: Package, label: 'Shop', to: 'Products', gradient: 'from-purple-500 to-pink-500' },
                  { icon: Heart, label: 'Merkliste', to: 'Wishlist', badge: wishlistCount, gradient: 'from-pink-500 to-rose-500' },
                  { icon: ShoppingCart, label: 'Warenkorb', to: 'Cart', badge: cartCount, gradient: 'from-green-500 to-emerald-500' },
                  { icon: User, label: 'Profil', to: 'Profile', gradient: 'from-indigo-500 to-purple-500' },
                  { icon: Crown, label: 'VIP werden', to: 'VIP', highlight: true, gradient: 'from-yellow-500 to-amber-500' },
                  { icon: MessageCircle, label: 'Support', to: 'Support', gradient: 'from-orange-500 to-red-500' }
                ].map((item, index) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Link
                      to={createPageUrl(item.to)}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <motion.div
                        whileHover={{ x: 6, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex items-center justify-between p-4 rounded-2xl transition-all overflow-hidden group ${
                          item.highlight
                            ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/40'
                            : 'bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5'
                        }`}
                      >
                        {/* Hover Glow */}
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                        />
                        
                        <div className="relative flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className={`font-black text-base ${item.highlight ? 'text-yellow-400' : 'text-white'}`}>
                            {item.label}
                          </span>
                        </div>
                        
                        {item.badge > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`relative w-7 h-7 bg-gradient-to-br ${item.gradient} text-white text-xs font-black rounded-full flex items-center justify-center shadow-xl`}
                          >
                            {item.badge}
                          </motion.span>
                        )}
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Logout */}
              {user && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="p-4 mt-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => base44.auth.logout()}
                    className="w-full p-4 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-500/30 rounded-2xl font-black text-red-400 transition-all"
                  >
                    Abmelden
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16 md:h-20" />
    </>
  );
}