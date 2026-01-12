import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { base44 } from '@/api/base44Client';
import { Heart, ShoppingCart, Menu, X, Home, Package, User, Crown, MessageCircle, MapPin, Clock, Store, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PremiumHeader() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerMode, setDrawerMode] = useState('menu'); // 'menu' or 'categories'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoriesOnly, setCategoriesOnly] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadUserData();
    const saved = localStorage.getItem('categories_only_mode');
    if (saved) setCategoriesOnly(JSON.parse(saved));
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
      setDrawerMode(categoriesOnly ? 'categories' : 'menu');
      setSelectedCategory(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, categoriesOnly]);

  const isShopPage = location.pathname.includes('Product') || location.pathname.includes('Shop');

  const categories = [
    { 
      id: 'sneaker', 
      label: 'SNEAKER', 
      icon: '👟',
      children: [
        { 
          id: 'nike', 
          label: 'NIKE', 
          children: ['AirMax 95', 'AirMax DN', 'SHOX TL', 'AIR FORCE', 'Dunk SB'] 
        },
        { 
          id: 'airjordan', 
          label: 'AIR JORDAN', 
          children: ['AIR JORDAN 1 HIGH', 'AIR JORDAN 1 LOW', 'AIR JORDAN 3', 'AIR JORDAN 4', 'AIR JORDAN 5', 'AIR JORDAN 6'] 
        }
      ]
    },
    { id: 'kleidung', label: 'KLEIDUNG', icon: '👕', children: [] },
    { id: 'taschen', label: 'TASCHEN', icon: '👜', children: [] },
    { id: 'muetzen', label: 'MÜTZEN & CAPS', icon: '🧢', children: [] },
    { id: 'geldboersen', label: 'GELDBÖRSEN', icon: '💰', children: [] },
    { id: 'guertel', label: 'GÜRTEL', icon: '⭕', children: [] },
    { id: 'highheels', label: 'HIGH HEELS', icon: '👠', children: [] }
  ];

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleSubcategoryClick = (categoryId, subcategory) => {
    setIsMenuOpen(false);
    window.location.href = createPageUrl('Products') + `?category=${categoryId}&subcategory=${encodeURIComponent(subcategory)}`;
  };

  const toggleCategoriesOnly = () => {
    const newValue = !categoriesOnly;
    setCategoriesOnly(newValue);
    localStorage.setItem('categories_only_mode', JSON.stringify(newValue));
    if (newValue) setDrawerMode('categories');
  };

  const openShopCategories = () => {
    setDrawerMode('categories');
    setIsMenuOpen(true);
  };

  const IconButton = ({ icon: Icon, label, count, to, onClick }) => (
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'h-16' : 'h-20'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(8, 8, 12, 0.60) 0%, rgba(8, 8, 12, 0.55) 100%)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo + Shop Icon */}
            <div className="flex items-center gap-2">
              <Link to={createPageUrl('Home')}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 focus-ring rounded-2xl"
                >
                  <motion.div
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center p-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(214, 178, 94, 0.35)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)'
                    }}
                  >
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                      alt="Nebula Supply"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  <span className="hidden sm:block text-base md:text-lg font-black tracking-tight" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>
                    NEBULA
                  </span>
                </motion.div>
              </Link>

              {/* Shop Categories Icon (nur im Shop) */}
              {isShopPage && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openShopCategories}
                  className="w-10 h-10 rounded-xl flex items-center justify-center focus-ring"
                  style={{
                    background: 'rgba(214, 178, 94, 0.12)',
                    border: '1px solid rgba(214, 178, 94, 0.30)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)'
                  }}
                  title="Kategorien"
                >
                  <Store className="w-5 h-5" style={{ color: 'rgba(214, 178, 94, 0.9)' }} />
                </motion.button>
              )}
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: 'Home', to: 'Home' },
                { label: 'Shop', to: 'Products' },
                { label: 'Profil', to: 'Profile' }
              ].map(item => (
                <Link key={item.to} to={createPageUrl(item.to)} className="relative group">
                  <span className="text-sm font-bold text-muted group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                  <motion.span
                    className="absolute bottom-[-4px] left-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    style={{ background: 'var(--gold)' }}
                  />
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-2 md:gap-3">
              {user?.is_vip && (
                <motion.div
                  animate={{ 
                    boxShadow: [
                      '0 0 12px rgba(var(--gold-rgb), 0.3)',
                      '0 0 20px rgba(var(--gold-rgb), 0.4)',
                      '0 0 12px rgba(var(--gold-rgb), 0.3)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="hidden md:flex vip-badge"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>VIP</span>
                </motion.div>
              )}
              
              <IconButton 
                icon={Heart} 
                label="Merkliste" 
                count={wishlistCount} 
                to={createPageUrl('Wishlist')} 
              />
              
              <IconButton 
                icon={User} 
                label="Profil" 
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
                className="rounded-xl flex items-center justify-center md:hidden focus-ring"
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
                        alt="Nebula Supply"
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                    <span className="text-2xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                      {drawerMode === 'categories' ? 'Kategorien' : 'NEBULA'}
                    </span>
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

                {/* Tabs (nur im Shop) */}
                {isShopPage && !categoriesOnly && (
                  <div className="relative flex gap-2 p-1 rounded-xl bg-zinc-900/60 border border-white/10">
                    <button
                      onClick={() => { setDrawerMode('menu'); setSelectedCategory(null); }}
                      className={`flex-1 px-4 py-2.5 rounded-lg font-black text-sm transition-all ${
                        drawerMode === 'menu' 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Menü
                    </button>
                    <button
                      onClick={() => { setDrawerMode('categories'); setSelectedCategory(null); }}
                      className={`flex-1 px-4 py-2.5 rounded-lg font-black text-sm transition-all ${
                        drawerMode === 'categories' 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Kategorien
                    </button>
                  </div>
                )}
              </div>

              {/* MENU MODE */}
              {drawerMode === 'menu' && (
                <>
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

              {/* Categories Only Toggle */}
              {isShopPage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 pb-4"
                >
                  <button
                    onClick={toggleCategoriesOnly}
                    className="w-full p-4 bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/10 rounded-2xl transition-all flex items-center justify-between"
                  >
                    <span className="font-black text-white text-sm">Nur Kategorien anzeigen</span>
                    <div className={`w-12 h-6 rounded-full transition-all ${categoriesOnly ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-zinc-700'}`}>
                      <motion.div
                        animate={{ x: categoriesOnly ? 24 : 2 }}
                        className="w-5 h-5 mt-0.5 bg-white rounded-full shadow-lg"
                      />
                    </div>
                  </button>
                </motion.div>
              )}

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
              </>
              )}

              {/* CATEGORIES MODE */}
              {drawerMode === 'categories' && (
              <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {!selectedCategory ? (
                  /* Main Categories List */
                  <motion.div
                    key="main"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar"
                    style={{ maxHeight: 'calc(100vh - 240px)' }}
                  >
                    {categories.map((cat, index) => (
                      <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 4, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => cat.children.length > 0 ? handleCategoryClick(cat) : handleSubcategoryClick(cat.id, cat.label)}
                        className="w-full p-4 bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5 rounded-2xl transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
                            {cat.icon}
                          </div>
                          <span className="font-black text-white text-base">{cat.label}</span>
                        </div>
                        {cat.children.length > 0 && (
                          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  /* Subcategories View */
                  <motion.div
                    key="sub"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col h-full"
                  >
                    {/* Back Button */}
                    <div className="px-4 py-3 border-b border-white/10">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-black text-sm">Zurück</span>
                      </button>
                      <h3 className="text-xl font-black text-white mt-2">{selectedCategory.label}</h3>
                    </div>

                    {/* Subcategories */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-2">
                      {selectedCategory.children.map((sub, index) => (
                        typeof sub === 'string' ? (
                          <motion.button
                            key={sub}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            whileHover={{ x: 4, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSubcategoryClick(selectedCategory.id, sub)}
                            className="w-full p-3.5 bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5 rounded-xl transition-all text-left"
                          >
                            <span className="font-bold text-white text-sm">{sub}</span>
                          </motion.button>
                        ) : (
                          <div key={sub.id}>
                            <div className="text-xs font-black text-zinc-500 uppercase tracking-wider mb-2 mt-4">
                              {sub.label}
                            </div>
                            {sub.children.map((item, i) => (
                              <motion.button
                                key={item}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (index + i) * 0.04 }}
                                whileHover={{ x: 4, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSubcategoryClick(selectedCategory.id, item)}
                                className="w-full p-3.5 mb-2 bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5 rounded-xl transition-all text-left"
                              >
                                <span className="font-bold text-white text-sm">{item}</span>
                              </motion.button>
                            ))}
                          </div>
                        )
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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