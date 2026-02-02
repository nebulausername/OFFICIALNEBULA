import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { api } from '@/api';
import { Heart, ShoppingCart, Menu, User, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import MainDrawer from '../drawer/MainDrawer';
import ShopCategoriesDrawer from '../drawer/ShopCategoriesDrawer';
import ProfileDrawer from '../drawer/ProfileDrawer';
import { useWishlist } from '../wishlist/WishlistContext';
import { LanguageSwitcherPopover } from '../i18n/LanguageSwitcher';
import { useI18n } from '../i18n/I18nProvider';

export default function PremiumHeader() {
  const location = useLocation();
  const { count: wishlistCount } = useWishlist();
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isMainDrawerOpen, setIsMainDrawerOpen] = useState(false);
  const [isShopDrawerOpen, setIsShopDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
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
      const userData = await api.auth.me();
      setUser(userData);

      const cartItems = await api.entities.StarCartItem.filter({ user_id: userData.id });
      setCartCount(cartItems.length);
    } catch (error) {
      // User not logged in
    }
  };

  useEffect(() => {
    if (isMainDrawerOpen || isShopDrawerOpen || isProfileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMainDrawerOpen, isShopDrawerOpen, isProfileDrawerOpen]);

  const handleOpenShopCategories = () => {
    setIsShopDrawerOpen(true);
  };

  const handleOpenProfile = () => {
    setIsProfileDrawerOpen(true);
  };

  const handleCloseAll = () => {
    setIsMainDrawerOpen(false);
    setIsShopDrawerOpen(false);
    setIsProfileDrawerOpen(false);
  };

  const handleBackToMain = () => {
    setIsShopDrawerOpen(false);
    setIsProfileDrawerOpen(false);
  };

  const IconButton = ({ icon: Icon, label, count, to, onClick = () => { } }) => (
    <Link to={to} onClick={onClick}>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative rounded-xl flex items-center justify-center smooth-transition focus-ring"
        style={{
          width: '44px',
          height: '44px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
        aria-label={label}
      >
        <Icon className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.92)' }} />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 px-1.5 text-[0.7rem] font-black rounded-full flex items-center justify-center"
            style={{
              background: '#D6B25E',
              color: '#000',
              boxShadow: '0 2px 8px rgba(214, 178, 94, 0.4)'
            }}
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 ${isScrolled
          ? 'h-16 bg-background/80 backdrop-blur-xl shadow-2xl shadow-black/50'
          : 'h-20 bg-transparent backdrop-blur-lg'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo + Shop Link */}
            <div className="flex items-center gap-4">
              {/* Brand Logo - Goes to Home */}
              <Link to={createPageUrl('Home')} className="flex items-center gap-3 group focus-ring rounded-2xl">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center p-2 relative overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 0 15px rgba(0,0,0,0.2)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                    alt="Nebula Supply"
                    className="w-full h-full object-contain drop-shadow-md relative z-10"
                  />
                </motion.div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-lg font-black tracking-tighter leading-none" style={{ color: '#FFFFFF' }}>
                    NEBULA
                  </span>
                  <span className="text-[0.65rem] font-bold tracking-widest text-[#D6B25E] uppercase">
                    Premium Supply
                  </span>
                </div>
              </Link>

              {/* Shop Link - Goes to Products Page */}
              <Link to={createPageUrl('Products')}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"
                  style={{
                    background: location.pathname.includes('Products')
                      ? 'rgba(214, 178, 94, 0.15)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: location.pathname.includes('Products')
                      ? '1px solid rgba(214, 178, 94, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: location.pathname.includes('Products')
                      ? '0 0 20px rgba(214, 178, 94, 0.1)'
                      : 'none'
                  }}
                >
                  <ShoppingCart
                    className="w-4 h-4"
                    style={{
                      color: location.pathname.includes('Products') ? '#D6B25E' : 'rgba(255, 255, 255, 0.6)'
                    }}
                  />
                  <span
                    className="text-sm font-bold hidden md:block"
                    style={{
                      color: location.pathname.includes('Products') ? '#D6B25E' : 'rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    SHOP
                  </span>
                </motion.div>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: t('nav.home'), to: 'Home' },
                { label: t('nav.shop'), to: 'Products' },
                { label: t('nav.profile'), to: 'Profile' }
              ].map(item => (
                <Link key={item.to} to={createPageUrl(item.to)} className="relative group py-2">
                  <span className={`text-sm font-bold transition-colors duration-300 ${location.pathname.includes(item.to) ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                    }`}>
                    {item.label}
                  </span>
                  <motion.span
                    className="absolute bottom-0 left-0 h-[2px] rounded-full"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{
                      width: location.pathname.includes(item.to) ? '100%' : '0%',
                      opacity: location.pathname.includes(item.to) ? 1 : 0
                    }}
                    whileHover={{ width: '100%', opacity: 1 }}
                    style={{
                      background: 'linear-gradient(90deg, transparent, #D6B25E, transparent)'
                    }}
                  />
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
              {/* Language Switcher - Desktop */}
              <div className="hidden md:block">
                <LanguageSwitcherPopover />
              </div>

              {user?.is_vip && (
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(214, 178, 94, 0.2)',
                      '0 0 20px rgba(214, 178, 94, 0.4)',
                      '0 0 10px rgba(214, 178, 94, 0.2)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D6B25E]/30 bg-[#D6B25E]/10"
                >
                  <Crown className="w-3.5 h-3.5 text-[#D6B25E]" />
                  <span className="text-[10px] font-black tracking-wider text-[#D6B25E]">VIP</span>
                </motion.div>
              )}

              <div className="h-6 w-[1px] bg-white/10 mx-1 hidden md:block" />

              <IconButton
                icon={Heart}
                label={t('nav.wishlist')}
                count={wishlistCount}
                to={createPageUrl('Wishlist')}
              />

              <IconButton
                icon={User}
                label={t('nav.profile')}
                count={0}
                to={createPageUrl('Profile')}
              />

              <IconButton
                icon={ShoppingCart}
                label={t('nav.cart')}
                count={cartCount}
                to={createPageUrl('Cart')}
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMainDrawerOpen(true)}
                className="rounded-xl flex items-center justify-center md:hidden focus-ring ml-2"
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)'
                }}
                aria-label="Menu öffnen"
              >
                <Menu className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.92)' }} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Drawer System */}
      <MainDrawer
        isOpen={isMainDrawerOpen}
        onClose={handleCloseAll}
        user={user}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onOpenShopCategories={handleOpenShopCategories}
        onOpenProfile={handleOpenProfile}
      />

      <ShopCategoriesDrawer
        isOpen={isShopDrawerOpen}
        onClose={handleCloseAll}
        onBack={handleBackToMain}
      />

      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={handleCloseAll}
        onBack={handleBackToMain}
        user={user}
      />


      {/* Spacer */}
      <div className="h-16 md:h-20" />
    </>
  );
}