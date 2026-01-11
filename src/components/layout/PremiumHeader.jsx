import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { base44 } from '@/api/base44Client';
import { Heart, ShoppingCart, Menu, X, Home, Package, User, Crown, MessageCircle, Bell } from 'lucide-react';
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-10 h-10 glass-panel rounded-full flex items-center justify-center hover:bg-[var(--glass-hover)] smooth-transition focus-ring"
        aria-label={label}
      >
        <Icon className="w-5 h-5 text-[hsl(var(--text))]" />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent2))] text-white text-[10px] font-black rounded-full flex items-center justify-center"
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
        className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-[var(--glass-border)]"
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
                <div className="vip-badge hidden md:flex">
                  <Crown className="w-3.5 h-3.5" />
                  VIP
                </div>
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
              className="fixed inset-0 overlay-blur z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm glass-panel z-50 overflow-y-auto custom-scrollbar"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent2))] rounded-xl flex items-center justify-center">
                    <span className="text-white font-black text-lg">N</span>
                  </div>
                  <span className="text-xl font-black text-gradient-primary">NEBULA</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-[var(--glass-hover)] flex items-center justify-center smooth-transition focus-ring"
                  aria-label="Menu schließen"
                >
                  <X className="w-6 h-6 text-[hsl(var(--text))]" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="p-6 border-b border-[hsl(var(--border))]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent2))] flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[hsl(var(--text))] truncate">{user.full_name}</div>
                      <div className="text-xs text-[hsl(var(--text-muted))] truncate">{user.email}</div>
                    </div>
                  </div>
                  {user.is_vip && (
                    <div className="vip-badge inline-flex">
                      <Crown className="w-3.5 h-3.5" />
                      VIP Member
                    </div>
                  )}
                </div>
              )}

              {/* Menu Items */}
              <nav className="p-6 space-y-2">
                {[
                  { icon: Home, label: 'Home', to: 'Home' },
                  { icon: Package, label: 'Shop', to: 'Products' },
                  { icon: Heart, label: 'Merkliste', to: 'Wishlist', badge: wishlistCount },
                  { icon: ShoppingCart, label: 'Warenkorb', to: 'Cart', badge: cartCount },
                  { icon: User, label: 'Profil', to: 'Profile' },
                  { icon: Crown, label: 'VIP werden', to: 'VIP', highlight: true },
                  { icon: MessageCircle, label: 'Support', to: 'Support' }
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={createPageUrl(item.to)}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      className={`flex items-center justify-between p-4 rounded-[var(--radius-md)] smooth-transition focus-ring ${
                        item.highlight
                          ? 'bg-gradient-to-r from-[hsl(var(--vip))]/20 to-amber-500/20 border border-[hsl(var(--vip))]/30'
                          : 'hover:bg-[var(--glass-hover)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${item.highlight ? 'text-[hsl(var(--vip))]' : 'text-[hsl(var(--text-muted))];'}`} />
                        <span className={`font-bold ${item.highlight ? 'text-[hsl(var(--vip))]' : 'text-[hsl(var(--text))];'}`}>
                          {item.label}
                        </span>
                      </div>
                      {item.badge > 0 && (
                        <span className="w-6 h-6 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent2))] text-white text-xs font-black rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  </Link>
                ))}
              </nav>

              {/* Logout */}
              {user && (
                <div className="p-6 border-t border-[hsl(var(--border))]">
                  <button
                    onClick={() => base44.auth.logout()}
                    className="w-full btn-secondary text-[hsl(var(--error))] hover:bg-[hsl(var(--error))]/10"
                  >
                    Abmelden
                  </button>
                </div>
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