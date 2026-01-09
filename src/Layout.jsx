import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, Home, Package, User, Menu, X, Star, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadUser();
    loadCartCount();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.log('Not authenticated');
    }
  };

  const loadCartCount = async () => {
    try {
      const userData = await base44.auth.me();
      const items = await base44.entities.StarCartItem.filter({ user_id: userData.id });
      setCartCount(items.length);
    } catch (error) {
      setCartCount(0);
    }
  };

  const navigation = [
    { name: 'Home', page: 'Home', icon: Home },
    { name: 'Shop', page: 'Products', icon: Package },
    { name: 'Profil', page: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <style>{`
        :root {
          --nebula-primary: #8B5CF6;
          --nebula-secondary: #EC4899;
          --nebula-accent: #F59E0B;
        }
      `}</style>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="floating-cart"
        >
          <Link
            to={createPageUrl('Cart')}
            className="relative w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl glow-effect hover:scale-110 transition-transform group"
          >
            <ShoppingBag className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
            <span className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
              {cartCount}
            </span>
          </Link>
        </motion.div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-zinc-700/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 glow-effect shadow-lg shadow-purple-500/50">
                <Star className="w-6 h-6 text-white" fill="white" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-gradient">
                Nebula Supply
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className="relative group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-base transition-all overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                          : 'glass backdrop-blur-xl border-2 border-zinc-700 text-zinc-300 hover:border-purple-400 hover:text-white hover:shadow-lg hover:shadow-purple-500/30'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
                      <span className="relative z-10 uppercase tracking-wide">{item.name}</span>
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link
                to={createPageUrl('Cart')}
                className="relative group"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-3 glass backdrop-blur-xl border-2 border-zinc-700 rounded-xl hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  <ShoppingBag className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-black shadow-lg shadow-purple-500/50"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              {/* User Menu */}



            </div>
          </div>
        </div>


      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong backdrop-blur-2xl border-t-2 border-zinc-700/50 shadow-2xl pb-safe">
        <div className="grid grid-cols-3 gap-2 px-3 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className="relative"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`relative flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl shadow-purple-500/50'
                      : 'glass border-2 border-zinc-700 hover:border-purple-400'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveTab"
                      className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={`w-7 h-7 relative z-10 ${isActive ? 'text-white scale-110 drop-shadow-lg' : 'text-zinc-400'} transition-all`} />
                  <span className={`text-xs font-black uppercase tracking-wider relative z-10 ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 opacity-50"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-purple-400" fill="currentColor" />
              <span className="text-sm text-zinc-400">© 2026 Nebula Supply. Premium Quality.</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors font-medium">Impressum</a>
              <a href="#" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors font-medium">Datenschutz</a>
              <a href="#" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors font-medium">AGB</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}