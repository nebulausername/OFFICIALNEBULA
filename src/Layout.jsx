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
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`
        :root {
          --nebula-primary: #8B5CF6;
          --nebula-secondary: #EC4899;
          --nebula-accent: #F59E0B;
        }
      `}</style>



      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                <Star className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Nebula Supply
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link
                to={createPageUrl('Cart')}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingBag className="w-6 h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {cartCount}
                  </span>
                )}
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

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPageName === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`p-2 rounded-lg ${
                isActive ? 'bg-purple-600 text-white' : 'text-gray-700'
              }`}
            >
              <Icon className="w-6 h-6" />
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-purple-400" fill="currentColor" />
              <span className="text-sm text-gray-400">© 2026 Nebula Supply. Premium Quality.</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Impressum</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Datenschutz</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">AGB</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}