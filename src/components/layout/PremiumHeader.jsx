import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { base44 } from '@/api/base44Client';
import { Heart, ShoppingCart, Menu, X, Home, Package, User, Crown, MessageCircle, MapPin, Clock, Store, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [dragStartY, setDragStartY] = useState(0);
  const [dragOffsetY, setDragOffsetY] = useState(0);

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
      gradient: 'from-blue-500 to-cyan-500',
      children: [
        { 
          id: 'nike', 
          label: 'NIKE', 
          children: ['AirMax 95', 'AirMax DN', 'SHOX TL', 'AIR FORCE', 'Dunk SB', 'Cortez', 'Blazer'] 
        },
        { 
          id: 'airjordan', 
          label: 'AIR JORDAN', 
          children: ['AIR JORDAN 1 HIGH', 'AIR JORDAN 1 LOW', 'AIR JORDAN 3', 'AIR JORDAN 4', 'AIR JORDAN 5', 'AIR JORDAN 6', 'AIR JORDAN 11', 'AIR JORDAN 13'] 
        },
        {
          id: 'adidas',
          label: 'ADIDAS',
          children: ['Yeezy Boost 350', 'Yeezy Boost 700', 'Ultraboost', 'Superstar', 'Stan Smith']
        },
        {
          id: 'newbalance',
          label: 'NEW BALANCE',
          children: ['550', '574', '990', '2002R', '1906R']
        }
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
    { 
      id: 'muetzen', 
      label: 'MÜTZEN & CAPS', 
      icon: '🧢',
      gradient: 'from-green-500 to-emerald-500',
      children: [
        { id: 'caps', label: 'CAPS', children: ['Baseball Caps', 'Snapbacks', 'Dad Hats', '5-Panel'] },
        { id: 'beanies', label: 'BEANIES', children: ['Classic', 'Slouchy', 'Cuffed'] }
      ]
    },
    { 
      id: 'geldboersen', 
      label: 'GELDBÖRSEN', 
      icon: '💰',
      gradient: 'from-yellow-500 to-amber-500',
      children: [
        { id: 'herren', label: 'HERREN', children: ['Bifold', 'Trifold', 'Kartenhalter', 'Geldbörsen'] },
        { id: 'damen', label: 'DAMEN', children: ['Clutch Wallets', 'Zip Around', 'Kartenhalter'] }
      ]
    },
    { 
      id: 'guertel', 
      label: 'GÜRTEL', 
      icon: '⭕',
      gradient: 'from-red-500 to-pink-500',
      children: [
        { id: 'designer', label: 'DESIGNER', children: ['Gucci', 'Louis Vuitton', 'Hermès', 'Versace'] },
        { id: 'casual', label: 'CASUAL', children: ['Canvas', 'Leder', 'Textil'] }
      ]
    },
    { 
      id: 'highheels', 
      label: 'HIGH HEELS', 
      icon: '👠',
      gradient: 'from-pink-500 to-rose-500',
      children: [
        { id: 'pumps', label: 'PUMPS', children: ['Classic Pumps', 'Pointed Toe', 'Peep Toe'] },
        { id: 'stiefel', label: 'STIEFEL', children: ['Ankle Boots', 'Knee High', 'Thigh High'] },
        { id: 'sandalen', label: 'SANDALEN', children: ['Heeled Sandals', 'Strappy', 'Platform'] }
      ]
    }
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

  const filteredCategories = categories.filter(cat => 
    cat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      setIsMenuOpen(false);
    }
    setDragOffsetY(0);
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
            <div className="flex items-center gap-2 md:gap-3">
              <Link to={createPageUrl('Home')}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 focus-ring rounded-2xl"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(var(--gold-rgb), 0.2)',
                        '0 0 30px rgba(var(--gold-rgb), 0.3)',
                        '0 0 20px rgba(var(--gold-rgb), 0.2)',
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center p-2 gold-border"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)'
                    }}
                  >
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                      alt="Nebula Supply"
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                  </motion.div>
                  <span className="hidden sm:block text-base md:text-lg font-black tracking-tight bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">
                    NEBULA
                  </span>
                </motion.div>
              </Link>

              {/* Premium Gold Shop Icon - Always Visible */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={openShopCategories}
                className="relative w-11 h-11 rounded-xl flex items-center justify-center focus-ring group overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #E8C76A, #F5D98B)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 20px rgba(var(--gold-rgb), 0.4), 0 0 40px rgba(var(--gold-rgb), 0.2)'
                }}
                title="Shop Kategorien"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                <motion.div
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative z-10"
                >
                  <Store className="w-5 h-5 text-zinc-900 drop-shadow-lg" strokeWidth={2.5} />
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: '#FF3366', boxShadow: '0 0 12px rgba(255, 51, 102, 0.6)' }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </motion.div>
              </motion.button>
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
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 cursor-pointer"
              aria-label="Overlay schließen"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ 
                x: 0,
                y: dragOffsetY 
              }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onKeyDown={(e) => e.key === 'Escape' && setIsMenuOpen(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="fixed top-0 right-0 bottom-0 w-[90%] max-w-md md:max-w-lg lg:max-w-xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-l-2 border-purple-500/30 z-50 overflow-hidden shadow-2xl shadow-purple-500/20 flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation Menu"
            >
              {/* Swipe Handle (Mobile) */}
              <div className="md:hidden flex justify-center py-2 px-4 border-b border-white/5">
                <div className="w-12 h-1.5 rounded-full bg-zinc-700" />
              </div>
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
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {/* Delivery Info Bar */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="m-4 p-5 rounded-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 border border-white/10 backdrop-blur-xl shadow-2xl"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <MapPin className="w-7 h-7 text-red-400" />
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="text-xs text-zinc-400 font-bold uppercase tracking-wide mb-0.5">Versand aus</div>
                        <div className="text-base font-black text-white">🇨🇳 China</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Clock className="w-7 h-7 text-blue-400" />
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="text-xs text-zinc-400 font-bold uppercase tracking-wide mb-0.5">Lieferzeit</div>
                        <div className="text-base font-black text-white">8-17 Tage</div>
                      </div>
                    </div>
                  </motion.div>

              {/* User Info */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mx-4 mb-4 p-5 rounded-3xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-500/25 backdrop-blur-xl shadow-2xl"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <motion.div
                      whileHover={{ scale: 1.08, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
                    >
                      <User className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-white text-lg truncate">{user.full_name}</div>
                      <div className="text-xs text-zinc-400 font-semibold truncate">{user.email}</div>
                    </div>
                  </div>
                  {user.is_vip && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 shadow-xl"
                    >
                      <Crown className="w-4 h-4 text-zinc-900" />
                      <span className="text-xs font-black text-zinc-900 tracking-wide">VIP MEMBER</span>
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
                  ...(user?.role === 'admin' ? [{ icon: Crown, label: 'Admin Dashboard', to: 'Admin', gradient: 'from-red-500 to-orange-500', admin: true }] : []),
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
                        whileHover={{ x: 4, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex items-center justify-between p-5 rounded-2xl transition-all duration-200 overflow-hidden group min-h-[72px] ${
                          item.highlight
                            ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/40 shadow-lg'
                            : 'bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5'
                        }`}
                      >
                        {/* Hover Glow */}
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}
                        />

                        <div className="relative flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-200`}>
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <span className={`font-black text-lg ${item.highlight ? 'text-yellow-400' : 'text-white'}`}>
                            {item.label}
                          </span>
                        </div>

                        {item.badge > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', bounce: 0.5 }}
                            className={`relative w-9 h-9 bg-gradient-to-br ${item.gradient} text-white text-sm font-black rounded-full flex items-center justify-center shadow-2xl`}
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="px-4 pb-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={toggleCategoriesOnly}
                    className="w-full p-5 bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/10 rounded-2xl transition-all duration-200 flex items-center justify-between min-h-[64px]"
                  >
                    <div>
                      <span className="font-black text-white text-sm block mb-0.5">Nur Kategorien anzeigen</span>
                      <span className="text-xs text-zinc-500 font-semibold">Schneller Kategorie-Zugriff</span>
                    </div>
                    <div className={`relative w-14 h-7 rounded-full transition-all duration-300 ${categoriesOnly ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30' : 'bg-zinc-700'}`}>
                      <motion.div
                        animate={{ x: categoriesOnly ? 28 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                      />
                    </div>
                  </motion.button>
                </motion.div>
              )}

              {/* Logout */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-4 mt-4 border-t border-white/10"
                >
                  <motion.button
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => base44.auth.logout()}
                    className="w-full p-5 min-h-[64px] bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-500/30 rounded-2xl font-black text-red-400 text-base transition-all duration-200 shadow-lg hover:shadow-red-500/20"
                  >
                    Abmelden
                  </motion.button>
                </motion.div>
              )}
                </div>
              )}

              {/* Quick Action Footer (nur im Menu Mode auf Mobile) */}
              {drawerMode === 'menu' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="md:hidden sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent backdrop-blur-xl border-t border-white/10"
                >
                  <div className="flex gap-2">
                    <Link to={createPageUrl('Cart')} className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-black text-white flex items-center justify-center gap-2 shadow-lg"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Warenkorb
                        {cartCount > 0 && (
                          <span className="bg-white text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">
                            {cartCount}
                          </span>
                        )}
                      </motion.button>
                    </Link>
                    <Link to={createPageUrl('Wishlist')} onClick={() => setIsMenuOpen(false)}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-14 w-14 bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/10 rounded-2xl flex items-center justify-center transition-all relative"
                      >
                        <Heart className="w-5 h-5 text-pink-400" />
                        {wishlistCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black">
                            {wishlistCount}
                          </span>
                        )}
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* CATEGORIES MODE - Premium Design */}
              {drawerMode === 'categories' && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  {/* Premium Search Bar */}
                  {!selectedCategory && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-4 py-4 border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Kategorie suchen..."
                          className="w-full h-14 pl-14 pr-12 rounded-2xl text-white placeholder-zinc-500 focus:outline-none font-bold text-base transition-all"
                          style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)'
                          }}
                          autoComplete="off"
                        />
                        <Store className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                        {searchQuery && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                            style={{ background: 'var(--surface2)' }}
                            aria-label="Suche löschen"
                          >
                            <X className="w-4 h-4 text-white" />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <AnimatePresence mode="wait">
                    {!selectedCategory ? (
                      /* Main Categories List - Mobile & Desktop */
                      <motion.div
                        key="main"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar"
                      >
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((cat, index) => (
                          <motion.button
                            key={cat.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.04, duration: 0.2 }}
                            whileHover={{ x: 6, scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => cat.children.length > 0 ? handleCategoryClick(cat) : handleSubcategoryClick(cat.id, cat.label)}
                            className="w-full min-h-[64px] p-4 glass-panel-hover rounded-2xl transition-all duration-200 flex items-center justify-between group relative overflow-hidden"
                            aria-label={`${cat.label} ${cat.children.length > 0 ? 'öffnen' : 'anzeigen'}`}
                          >
                            {/* Premium Gradient Glow */}
                            <motion.div 
                              className={`absolute inset-0 bg-gradient-to-r ${cat.gradient} opacity-0 group-hover:opacity-[0.15] transition-opacity duration-300`}
                              whileHover={{ scale: 1.1 }}
                            />

                            <div className="flex items-center gap-4 relative z-10">
                              <motion.div 
                                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-2xl shadow-xl relative`}
                              >
                                <div className="absolute inset-1 bg-black/10 rounded-lg backdrop-blur-sm" />
                                <span className="relative drop-shadow-lg">{cat.icon}</span>
                              </motion.div>
                              <div className="text-left">
                                <span className="font-black text-white text-lg block group-hover:text-gradient-gold transition-all">{cat.label}</span>
                                {cat.children.length > 0 && (
                                  <span className="text-xs font-bold" style={{ color: 'var(--subtle)' }}>
                                    {cat.children.length} Kategorien
                                  </span>
                                )}
                              </div>
                            </div>
                            {cat.children.length > 0 && (
                              <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <ChevronRight className="w-6 h-6 text-gold group-hover:text-gold2 transition-colors duration-200 relative z-10 drop-shadow-lg" />
                              </motion.div>
                            )}
                          </motion.button>
                              ))
                              ) : (
                              <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col items-center justify-center py-16 px-4"
                              >
                              <div className="w-20 h-20 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-center justify-center mb-4">
                              <Package className="w-10 h-10 text-zinc-600" />
                              </div>
                              <p className="text-zinc-400 text-sm font-bold text-center">
                              Keine Kategorien gefunden
                              </p>
                              <button
                              onClick={() => setSearchQuery('')}
                              className="mt-4 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 text-xs font-black transition-all"
                              >
                              Suche zurücksetzen
                              </button>
                              </motion.div>
                              )}
                              </motion.div>
                    ) : (
                      /* Subcategories View - Mobile: Drilldown, Desktop: 2-Column */
                      <motion.div
                        key="sub"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.18 }}
                        className="flex flex-col lg:flex-row h-full"
                      >
                        {/* Desktop: Left Column - Premium Categories */}
                        <div className="hidden lg:block lg:w-1/3 overflow-y-auto custom-scrollbar" style={{ borderRight: '1px solid var(--border)' }}>
                          <div className="p-4 space-y-3">
                            {categories.map((cat) => (
                              <motion.button
                                key={cat.id}
                                whileHover={{ x: 4, scale: 1.02 }}
                                onClick={() => cat.children.length > 0 && handleCategoryClick(cat)}
                                className={`w-full min-h-[56px] p-4 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                                  selectedCategory?.id === cat.id
                                    ? 'glass-panel gold-border'
                                    : 'glass-panel-hover'
                                }`}
                                style={selectedCategory?.id === cat.id ? {
                                  background: 'linear-gradient(135deg, rgba(var(--gold-rgb), 0.12), rgba(var(--gold-rgb), 0.08))'
                                } : {}}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl drop-shadow-lg">{cat.icon}</span>
                                  <span className={`font-black text-base transition-colors ${
                                    selectedCategory?.id === cat.id ? 'text-gold' : 'text-white group-hover:text-gold'
                                  }`}>{cat.label}</span>
                                </div>
                                {cat.children.length > 0 && (
                                  <ChevronRight className={`w-5 h-5 transition-colors ${
                                    selectedCategory?.id === cat.id ? 'text-gold' : 'text-muted group-hover:text-gold'
                                  }`} />
                                )}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Mobile: Premium Back Button + Title */}
                        <div className="lg:hidden px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                          <motion.button
                            whileHover={{ x: -4 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedCategory(null)}
                            className="flex items-center gap-2 min-h-[44px] text-gold hover:text-gold2 transition-colors mb-3"
                            aria-label="Zurück zu allen Kategorien"
                          >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="font-black text-base">Zurück</span>
                          </motion.button>
                          <div className="flex items-center gap-3">
                            <span className="text-3xl drop-shadow-lg">{selectedCategory.icon}</span>
                            <h3 className="text-2xl font-black text-gradient-gold">{selectedCategory.label}</h3>
                          </div>
                        </div>

                        {/* Subcategories Column */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          {/* Desktop: Premium Title */}
                          <div className="hidden lg:block px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                            <div className="flex items-center gap-3">
                              <span className="text-3xl drop-shadow-lg">{selectedCategory.icon}</span>
                              <h3 className="text-xl font-black text-gradient-gold">{selectedCategory.label}</h3>
                            </div>
                          </div>

                          <div className="px-4 py-4 space-y-3">
                            {selectedCategory.children.map((sub, index) => (
                              typeof sub === 'string' ? (
                                <motion.button
                                  key={sub}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.03, duration: 0.18 }}
                                  whileHover={{ x: 6, scale: 1.02 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => handleSubcategoryClick(selectedCategory.id, sub)}
                                  className="w-full min-h-[52px] p-4 glass-panel-hover rounded-xl transition-all duration-200 text-left group relative overflow-hidden"
                                  aria-label={`${sub} anzeigen`}
                                >
                                  <div className={`absolute inset-0 bg-gradient-to-r ${selectedCategory.gradient} opacity-0 group-hover:opacity-[0.12] transition-opacity duration-300`} />
                                  <span className="relative font-black text-white text-base group-hover:text-gold transition-colors">{sub}</span>
                                </motion.button>
                              ) : (
                                <div key={sub.id}>
                                  <div className="text-xs font-black uppercase tracking-widest mb-3 mt-5 px-2" style={{ color: 'var(--gold)' }}>
                                    {sub.label}
                                  </div>
                                  {sub.children.map((item, i) => (
                                    <motion.button
                                      key={item}
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: (index + i) * 0.03, duration: 0.18 }}
                                      whileHover={{ x: 6, scale: 1.02 }}
                                      whileTap={{ scale: 0.96 }}
                                      onClick={() => handleSubcategoryClick(selectedCategory.id, item)}
                                      className="w-full min-h-[52px] p-4 mb-2 glass-panel-hover rounded-xl transition-all duration-200 text-left group relative overflow-hidden"
                                      aria-label={`${item} anzeigen`}
                                    >
                                      <div className={`absolute inset-0 bg-gradient-to-r ${selectedCategory.gradient} opacity-0 group-hover:opacity-[0.12] transition-opacity duration-300`} />
                                      <span className="relative font-black text-white text-base group-hover:text-gold transition-colors">{item}</span>
                                    </motion.button>
                                  ))}
                                </div>
                              )
                            ))}
                          </div>
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