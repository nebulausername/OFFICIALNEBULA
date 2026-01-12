import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { base44 } from '@/api/base44Client';
import { Heart, ShoppingCart, Menu, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import MainDrawer from '../drawer/MainDrawer';
import ShopCategoriesDrawer from '../drawer/ShopCategoriesDrawer';
import ProfileDrawer from '../drawer/ProfileDrawer';

export default function PremiumHeader() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
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
                onClick={() => setIsMainDrawerOpen(true)}
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