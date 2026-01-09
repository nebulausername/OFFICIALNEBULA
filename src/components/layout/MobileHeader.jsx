import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Menu, ShoppingBag, Globe, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import SideDrawer from './SideDrawer';

export default function MobileHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [language, setLanguage] = useState('DE');

  useEffect(() => {
    loadCartCount();
  }, []);

  const loadCartCount = async () => {
    try {
      const userData = await base44.auth.me();
      const items = await base44.entities.StarCartItem.filter({ user_id: userData.id });
      setCartCount(items.length);
    } catch (error) {
      setCartCount(0);
    }
  };

  const languages = ['DE', 'EN', 'FR'];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
        {/* USP Bar */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white">
          <div className="flex items-center justify-center gap-6 px-4 py-2 text-xs font-medium overflow-x-auto">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Free Shipping
            </span>
            <span className="text-zinc-500">•</span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Star className="w-3 h-3" fill="currentColor" />
              Premium Qualität
            </span>
            <span className="text-zinc-500">•</span>
            <span className="whitespace-nowrap">24/7 Support</span>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between px-4 py-4">
          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 touch-manipulation hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-zinc-900" />
          </button>

          {/* Logo */}
          <Link to={createPageUrl('Home')} className="absolute left-1/2 -translate-x-1/2">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="text-lg font-black tracking-tight text-zinc-900">
                NEBULA
              </span>
            </motion.div>
          </Link>

          {/* Language + Cart */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors touch-manipulation">
                <Globe className="w-4 h-4" />
                {language}
              </button>
            </div>

            {/* Cart */}
            <Link to={createPageUrl('Cart')} className="relative">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors touch-manipulation"
              >
                <ShoppingBag className="w-6 h-6 text-zinc-900" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>
            </Link>
          </div>
        </div>
      </header>

      {/* Side Drawer */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}