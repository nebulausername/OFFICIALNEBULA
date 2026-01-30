import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Menu, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/api';
import SideDrawer from './SideDrawer';

export default function MobileHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadCartCount();
  }, []);

  const loadCartCount = async () => {
    try {
      const userData = await api.auth.me();
      const items = await api.entities.StarCartItem.filter({ user_id: userData.id });
      setCartCount(items.length);
    } catch (error) {
      setCartCount(0);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-3' : 'py-5'}`}
        style={{
          background: 'rgba(11, 13, 18, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <div className="px-4 flex items-center justify-between">
          {/* Hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setDrawerOpen(true)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white shadow-lg backdrop-blur-md"
          >
            <Menu className="w-5 h-5 text-white" />
          </motion.button>

          {/* Logo */}
          <Link to={createPageUrl('Home')} className="absolute left-1/2 -translate-x-1/2">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(214, 178, 94, 0.3)',
                  boxShadow: '0 0 15px rgba(0,0,0,0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50" />
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                  alt="Nebula"
                  className="w-full h-full object-contain p-1.5"
                />
              </div>
              <span className="text-lg font-black tracking-tight text-white hidden xs:block">
                NEBULA
              </span>
            </motion.div>
          </Link>

          {/* Cart */}
          <Link to={createPageUrl('Cart')} className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white shadow-lg backdrop-blur-md"
            >
              <ShoppingBag className="w-5 h-5 text-white" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 px-1 bg-gradient-to-r from-[#D6B25E] to-[#F2D27C] rounded-full flex items-center justify-center text-[10px] font-black text-black shadow-lg"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>
          </Link>
        </div>
      </header>

      {/* Side Drawer */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}