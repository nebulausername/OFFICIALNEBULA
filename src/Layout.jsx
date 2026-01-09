import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, Home, Package, User, Menu, X, Star, Sparkles, ChevronDown, HelpCircle, MessageCircle, Settings, LogOut } from 'lucide-react';
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
    { name: 'Anfragen', page: 'Requests', icon: ShoppingBag },
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
      <header className="sticky top-0 z-50 glass-strong border-b border-zinc-800/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 glow-effect">
                <Star className="w-6 h-6 text-white" fill="white" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                Nebula Supply
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link
                to={createPageUrl('Cart')}
                className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center space-x-3 px-4 py-2 glass border border-zinc-800 rounded-xl hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/20 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold">{user.full_name || user.email}</span>
                      <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-purple-400 transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    className="w-64 glass border-zinc-800 bg-zinc-950/98 backdrop-blur-2xl shadow-2xl shadow-purple-500/20 rounded-2xl p-2"
                  >
                    <div className="px-3 py-4 border-b border-zinc-800/50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{user.full_name || 'User'}</p>
                          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <DropdownMenuItem asChild>
                        <Link 
                          to={createPageUrl('Profile')} 
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-colors group"
                        >
                          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                            <User className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Mein Profil</p>
                            <p className="text-xs text-zinc-500">Account verwalten</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link 
                          to={createPageUrl('Help')} 
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-colors group"
                        >
                          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <HelpCircle className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Hilfe & Support</p>
                            <p className="text-xs text-zinc-500">Wir helfen dir</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link 
                          to={createPageUrl('FAQ')} 
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-colors group"
                        >
                          <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                            <MessageCircle className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">FAQ</p>
                            <p className="text-xs text-zinc-500">Häufige Fragen</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-900">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              {user && user.role === 'admin' && (
                <Link
                  to={createPageUrl('Admin')}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <Star className="w-5 h-5" />
                  <span className="font-medium">Admin</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-purple-400" fill="currentColor" />
              <span className="text-sm text-zinc-400">© 2024 Nebula Supply. Premium Quality.</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Impressum</a>
              <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Datenschutz</a>
              <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">AGB</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}