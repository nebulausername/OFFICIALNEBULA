import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { base44 } from '@/api/base44Client';
import { 
  Heart, ShoppingCart, Menu, X, Home, Package, User, Crown, 
  MessageCircle, MapPin, Clock, Store, ChevronRight, ChevronLeft,
  Sparkles, Star, Search, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PremiumHeader() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerMode, setDrawerMode] = useState('menu');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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
      setSelectedCategory(null);
      setSearchQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const categories = [
    { 
      id: 'sneaker', 
      label: 'SNEAKER', 
      icon: '👟',
      gradient: 'from-blue-500 to-cyan-500',
      children: [
        { id: 'nike', label: 'NIKE', children: ['AirMax 95', 'AirMax DN', 'SHOX TL', 'AIR FORCE', 'Dunk SB', 'Cortez', 'Blazer'] },
        { id: 'airjordan', label: 'AIR JORDAN', children: ['AIR JORDAN 1 HIGH', 'AIR JORDAN 1 LOW', 'AIR JORDAN 3', 'AIR JORDAN 4', 'AIR JORDAN 5', 'AIR JORDAN 6', 'AIR JORDAN 11', 'AIR JORDAN 13'] },
        { id: 'adidas', label: 'ADIDAS', children: ['Yeezy Boost 350', 'Yeezy Boost 700', 'Ultraboost', 'Superstar', 'Stan Smith'] },
        { id: 'newbalance', label: 'NEW BALANCE', children: ['550', '574', '990', '2002R', '1906R'] }
      ]
    },
    { 
      id: 'kleidung', 
      label: 'KLEIDUNG', 
      icon: '👕',
      gradient: 'from-purple-500 to-pink-500',
      children: [
        { id: 'tshirts', label: 'T-SHIRTS', children: ['Oversize', 'Slim Fit', 'Regular', 'Vintage'] },
        { id: 'hoodies', label: 'HOODIES & SWEATER', children: ['Hoodies', 'Zip Hoodies', 'Crewneck', 'Sweatshirts'] },
        { id: 'jacken', label: 'JACKEN', children: ['Bomber', 'Denim', 'Puffer', 'Windbreaker'] },
        { id: 'hosen', label: 'HOSEN', children: ['Jeans', 'Jogger', 'Cargo', 'Shorts'] }
      ]
    },
    { 
      id: 'taschen', 
      label: 'TASCHEN', 
      icon: '👜',
      gradient: 'from-amber-500 to-orange-500',
      children: [
        { id: 'rucksaecke', label: 'RUCKSÄCKE', children: ['Backpacks', 'Mini Backpacks', 'Laptop Bags'] },
        { id: 'umhaenge', label: 'UMHÄNGETASCHEN', children: ['Crossbody', 'Messenger', 'Shoulder Bags'] },
        { id: 'luxus', label: 'LUXUS TASCHEN', children: ['Designer', 'Clutch', 'Tote Bags'] }
      ]
    },
    { id: 'muetzen', label: 'MÜTZEN & CAPS', icon: '🧢', gradient: 'from-green-500 to-emerald-500', children: [] },
    { id: 'geldboersen', label: 'GELDBÖRSEN', icon: '💰', gradient: 'from-yellow-500 to-amber-500', children: [] },
    { id: 'guertel', label: 'GÜRTEL', icon: '⭕', gradient: 'from-red-500 to-pink-500', children: [] },
    { id: 'highheels', label: 'HIGH HEELS', icon: '👠', gradient: 'from-pink-500 to-rose-500', children: [] }
  ];

  const handleCategoryClick = (category) => {
    if (category.children.length > 0) {
      setSelectedCategory(category);
    } else {
      setIsMenuOpen(false);
      window.location.href = createPageUrl('Products') + `?category=${category.id}`;
    }
  };

  const handleSubcategoryClick = (categoryId, subcategory) => {
    setIsMenuOpen(false);
    window.location.href = createPageUrl('Products') + `?category=${categoryId}&subcategory=${encodeURIComponent(subcategory)}`;
  };

  const openShopCategories = () => {
    setDrawerMode('categories');
    setIsMenuOpen(true);
  };

  const openMainMenu = () => {
    setDrawerMode('menu');
    setIsMenuOpen(true);
  };

  const filteredCategories = categories.filter(cat => 
    cat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Premium Icon Button Component
  const IconButton = ({ icon: Icon, label, count, to, onClick, isGold }) => {
    const content = (
      <motion.button
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        className={`relative rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isGold 
            ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/40 hover:border-amber-400/60' 
            : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
        }`}
        style={{
          width: '48px',
          height: '48px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: isGold 
            ? '0 4px 20px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)' 
            : '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
        aria-label={label}
      >
        <Icon className={`w-5 h-5 transition-colors ${isGold ? 'text-amber-400' : 'text-white/80 group-hover:text-white'}`} />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 text-[11px] font-black rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#000',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.5)'
            }}
          >
            {count}
          </motion.span>
        )}
      </motion.button>
    );

    if (to) {
      return <Link to={to}>{content}</Link>;
    }
    return content;
  };

  return (
    <>
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'py-2' : 'py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <motion.div
            layout
            className={`relative flex items-center justify-between rounded-2xl transition-all duration-500 ${
              isScrolled ? 'h-16 px-4' : 'h-[72px] px-5'
            }`}
            style={{
              background: isScrolled 
                ? 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(20,20,25,0.9) 100%)'
                : 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(20,20,25,0.7) 100%)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: isScrolled 
                ? '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset'
                : '0 4px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.03) inset'
            }}
          >
            {/* Left Section: Shop Icon + Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Shop Categories Button - IMMER sichtbar */}
              <motion.button
                whileHover={{ scale: 1.08, rotate: 5 }}
                whileTap={{ scale: 0.92 }}
                onClick={openShopCategories}
                className="relative rounded-2xl flex items-center justify-center overflow-hidden group"
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.2) 100%)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 4px 20px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
                title="Kategorien"
              >
                {/* Animated Background */}
                <motion.div
                  animate={{
                    background: [
                      'linear-gradient(0deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))',
                      'linear-gradient(180deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))',
                      'linear-gradient(360deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <Store className="w-5 h-5 relative z-10 text-purple-300 group-hover:text-white transition-colors" />
              </motion.button>

              {/* Logo */}
              <Link to={createPageUrl('Home')}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(214,178,94,0.2)',
                        '0 0 30px rgba(214,178,94,0.4)',
                        '0 0 20px rgba(214,178,94,0.2)'
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-11 h-11 rounded-xl flex items-center justify-center p-2 overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(214,178,94,0.15) 0%, rgba(242,210,124,0.15) 100%)',
                      border: '1px solid rgba(214,178,94,0.4)',
                    }}
                  >
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                      alt="Nebula Supply"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                      NEBULA
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-amber-400/80 -mt-1">
                      SUPPLY
                    </span>
                  </div>
                </motion.div>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {[
                { label: 'Home', to: 'Home', icon: Home },
                { label: 'Shop', to: 'Products', icon: Package },
                { label: 'VIP', to: 'VIP', icon: Crown, isGold: true },
              ].map(item => (
                <Link key={item.to} to={createPageUrl(item.to)}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`relative px-5 py-2.5 rounded-xl group transition-all duration-300 ${
                      item.isGold 
                        ? 'hover:bg-amber-500/10' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <span className={`text-sm font-bold transition-colors flex items-center gap-2 ${
                      item.isGold 
                        ? 'text-amber-400 group-hover:text-amber-300' 
                        : 'text-white/70 group-hover:text-white'
                    }`}>
                      {item.isGold && <Crown className="w-4 h-4" />}
                      {item.label}
                    </span>
                    <motion.span
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all ${
                        item.isGold ? 'bg-amber-400' : 'bg-white'
                      }`}
                      initial={{ width: 0 }}
                      whileHover={{ width: '60%' }}
                    />
                  </motion.div>
                </Link>
              ))}
            </nav>

            {/* Right Section: Icons */}
            <div className="flex items-center gap-2">
              {/* VIP Badge - Desktop only */}
              {user?.is_vip && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full mr-1"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.2) 100%)',
                    border: '1px solid rgba(245,158,11,0.4)',
                    boxShadow: '0 0 20px rgba(245,158,11,0.2)'
                  }}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-black text-amber-400">VIP</span>
                </motion.div>
              )}
              
              {/* Wishlist - Desktop only */}
              <div className="hidden md:block">
                <IconButton 
                  icon={Heart} 
                  label="Merkliste" 
                  count={wishlistCount} 
                  to={createPageUrl('Wishlist')} 
                />
              </div>
              
              {/* Profile */}
              <IconButton 
                icon={User} 
                label="Profil" 
                to={createPageUrl('Profile')} 
              />
              
              {/* Cart */}
              <IconButton 
                icon={ShoppingCart} 
                label="Warenkorb" 
                count={cartCount} 
                to={createPageUrl('Cart')} 
                isGold={cartCount > 0}
              />
              
              {/* Menu Button - Mobile only */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openMainMenu}
                className="lg:hidden rounded-2xl flex items-center justify-center"
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
                aria-label="Menu öffnen"
              >
                <Menu className="w-5 h-5 text-white/90" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Premium Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-50"
              style={{
                background: 'radial-gradient(circle at 80% 20%, rgba(139,92,246,0.1), transparent 50%), rgba(0,0,0,0.9)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
              }}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%', opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 flex flex-col overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)',
                boxShadow: '-20px 0 60px rgba(0,0,0,0.5), -1px 0 0 rgba(255,255,255,0.05)'
              }}
            >
              {/* Drawer Header */}
              <div className="relative px-5 py-5 border-b border-white/5">
                {/* Gradient Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />
                
                <div className="flex items-center justify-between">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(139,92,246,0.3)',
                          '0 0 30px rgba(236,72,153,0.3)',
                          '0 0 20px rgba(139,92,246,0.3)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center p-2.5"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))',
                        border: '1px solid rgba(139,92,246,0.3)'
                      }}
                    >
                      {drawerMode === 'categories' ? (
                        <Store className="w-6 h-6 text-purple-300" />
                      ) : (
                        <Sparkles className="w-6 h-6 text-purple-300" />
                      )}
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-black text-white">
                        {drawerMode === 'categories' ? 'Kategorien' : 'Navigation'}
                      </h2>
                      <p className="text-xs text-white/40 font-medium">
                        {drawerMode === 'categories' ? 'Alle Produkte durchsuchen' : 'Wohin möchtest du?'}
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <X className="w-5 h-5 text-white/80" />
                  </motion.button>
                </div>

                {/* Mode Toggle */}
                <div className="flex gap-2 mt-4 p-1.5 rounded-2xl bg-white/5 border border-white/5">
                  <button
                    onClick={() => { setDrawerMode('menu'); setSelectedCategory(null); }}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      drawerMode === 'menu' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' 
                        : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Menü
                  </button>
                  <button
                    onClick={() => { setDrawerMode('categories'); setSelectedCategory(null); }}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      drawerMode === 'categories' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' 
                        : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    Shop
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  {drawerMode === 'menu' ? (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-4 space-y-3"
                    >
                      {/* User Card */}
                      {user && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-5 rounded-3xl relative overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1))',
                            border: '1px solid rgba(139,92,246,0.2)'
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                              <User className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-white text-lg truncate">{user.full_name}</p>
                              <p className="text-sm text-white/50 truncate">{user.email}</p>
                            </div>
                            {user.is_vip && (
                              <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 shadow-lg">
                                <span className="text-xs font-black text-black">VIP</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <Link to={createPageUrl('Cart')} onClick={() => setIsMenuOpen(false)}>
                          <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 rounded-2xl text-center"
                            style={{
                              background: 'rgba(245,158,11,0.1)',
                              border: '1px solid rgba(245,158,11,0.2)'
                            }}
                          >
                            <ShoppingCart className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                            <p className="text-2xl font-black text-white">{cartCount}</p>
                            <p className="text-xs text-white/50 font-bold">Im Warenkorb</p>
                          </motion.div>
                        </Link>
                        <Link to={createPageUrl('Wishlist')} onClick={() => setIsMenuOpen(false)}>
                          <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 rounded-2xl text-center"
                            style={{
                              background: 'rgba(236,72,153,0.1)',
                              border: '1px solid rgba(236,72,153,0.2)'
                            }}
                          >
                            <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                            <p className="text-2xl font-black text-white">{wishlistCount}</p>
                            <p className="text-xs text-white/50 font-bold">Favoriten</p>
                          </motion.div>
                        </Link>
                      </div>

                      {/* Navigation Items */}
                      <div className="space-y-2 pt-2">
                        {[
                          { icon: Home, label: 'Home', to: 'Home', color: 'blue' },
                          { icon: Package, label: 'Alle Produkte', to: 'Products', color: 'purple' },
                          { icon: User, label: 'Mein Profil', to: 'Profile', color: 'indigo' },
                          { icon: MessageCircle, label: 'Support', to: 'Support', color: 'cyan' },
                          ...(user?.role === 'admin' ? [{ icon: Crown, label: 'Admin Dashboard', to: 'Admin', color: 'red' }] : []),
                        ].map((item, index) => (
                          <motion.div
                            key={item.to}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link to={createPageUrl(item.to)} onClick={() => setIsMenuOpen(false)}>
                              <motion.div
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-4 p-4 rounded-2xl transition-all group"
                                style={{
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px solid rgba(255,255,255,0.05)'
                                }}
                              >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${item.color}-500/20 to-${item.color}-600/20 flex items-center justify-center`}>
                                  <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                                </div>
                                <span className="font-bold text-white/80 group-hover:text-white transition-colors flex-1">
                                  {item.label}
                                </span>
                                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                              </motion.div>
                            </Link>
                          </motion.div>
                        ))}

                        {/* VIP CTA */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Link to={createPageUrl('VIP')} onClick={() => setIsMenuOpen(false)}>
                            <motion.div
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className="p-5 rounded-2xl relative overflow-hidden group"
                              style={{
                                background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))',
                                border: '1px solid rgba(245,158,11,0.3)'
                              }}
                            >
                              <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute top-4 right-4 text-3xl"
                              >
                                👑
                              </motion.div>
                              <Crown className="w-8 h-8 text-amber-400 mb-3" />
                              <h3 className="font-black text-white text-lg mb-1">VIP werden</h3>
                              <p className="text-sm text-white/50">Exklusive Vorteile sichern</p>
                            </motion.div>
                          </Link>
                        </motion.div>
                      </div>

                      {/* Delivery Info */}
                      <div className="mt-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <p className="text-xs text-white/40 font-bold">Versand aus</p>
                            <p className="font-bold text-white">🇨🇳 China</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs text-white/40 font-bold">Lieferzeit</p>
                            <p className="font-bold text-white">8-17 Werktage</p>
                          </div>
                        </div>
                      </div>

                      {/* Logout */}
                      {user && (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => base44.auth.logout()}
                          className="w-full p-4 mt-4 rounded-2xl font-bold text-red-400 transition-all"
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)'
                          }}
                        >
                          Abmelden
                        </motion.button>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="categories"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full flex flex-col"
                    >
                      {/* Search */}
                      {!selectedCategory && (
                        <div className="p-4 border-b border-white/5">
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Kategorie suchen..."
                              className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-medium"
                            />
                          </div>
                        </div>
                      )}

                      {/* Categories List */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        <AnimatePresence mode="wait">
                          {!selectedCategory ? (
                            <motion.div
                              key="main"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="space-y-2"
                            >
                              {filteredCategories.map((cat, index) => (
                                <motion.button
                                  key={cat.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.03 }}
                                  whileHover={{ x: 4, scale: 1.01 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleCategoryClick(cat)}
                                  className="w-full p-4 rounded-2xl flex items-center justify-between group transition-all"
                                  style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                  }}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} bg-opacity-20 flex items-center justify-center text-2xl`}>
                                      {cat.icon}
                                    </div>
                                    <div className="text-left">
                                      <p className="font-black text-white">{cat.label}</p>
                                      {cat.children.length > 0 && (
                                        <p className="text-xs text-white/40 font-medium">{cat.children.length} Unterkategorien</p>
                                      )}
                                    </div>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                                </motion.button>
                              ))}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="sub"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="space-y-3"
                            >
                              {/* Back Button */}
                              <motion.button
                                whileHover={{ x: -4 }}
                                onClick={() => setSelectedCategory(null)}
                                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
                              >
                                <ChevronLeft className="w-5 h-5" />
                                <span className="font-bold">Zurück</span>
                              </motion.button>

                              {/* Category Title */}
                              <div className="flex items-center gap-3 mb-4">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedCategory.gradient} flex items-center justify-center text-3xl`}>
                                  {selectedCategory.icon}
                                </div>
                                <h3 className="text-2xl font-black text-white">{selectedCategory.label}</h3>
                              </div>

                              {/* Subcategories */}
                              {selectedCategory.children.map((sub, index) => (
                                typeof sub === 'string' ? (
                                  <motion.button
                                    key={sub}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSubcategoryClick(selectedCategory.id, sub)}
                                    className="w-full p-4 rounded-xl text-left transition-all"
                                    style={{
                                      background: 'rgba(255,255,255,0.03)',
                                      border: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                  >
                                    <span className="font-bold text-white/80">{sub}</span>
                                  </motion.button>
                                ) : (
                                  <div key={sub.id} className="space-y-2">
                                    <p className="text-xs font-black text-white/40 uppercase tracking-wider pt-3">
                                      {sub.label}
                                    </p>
                                    {sub.children.map((item, i) => (
                                      <motion.button
                                        key={item}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (index + i) * 0.02 }}
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSubcategoryClick(selectedCategory.id, item)}
                                        className="w-full p-3.5 rounded-xl text-left transition-all"
                                        style={{
                                          background: 'rgba(255,255,255,0.02)',
                                          border: '1px solid rgba(255,255,255,0.04)'
                                        }}
                                      >
                                        <span className="font-medium text-white/70">{item}</span>
                                      </motion.button>
                                    ))}
                                  </div>
                                )
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom CTA Bar */}
              <div className="p-4 border-t border-white/5" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <Link to={createPageUrl('Products')} onClick={() => setIsMenuOpen(false)}>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-14 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      boxShadow: '0 8px 30px rgba(139,92,246,0.4)'
                    }}
                  >
                    <Package className="w-5 h-5" />
                    Alle Produkte entdecken
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className={`transition-all duration-500 ${isScrolled ? 'h-20' : 'h-24'}`} />
    </>
  );
}