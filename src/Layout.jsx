import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, Home, Package, User, Menu, X, Star } from 'lucide-react';

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
    { name: 'Produkte', page: 'Products', icon: Package },
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

      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
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
                <div className="hidden md:flex items-center space-x-3 px-3 py-2 bg-zinc-800 rounded-lg">
                  <User className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium">{user.full_name || user.email}</span>
                </div>
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