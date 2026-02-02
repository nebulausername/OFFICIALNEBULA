import React, { useState, useEffect } from 'react';
import PremiumHeader from './components/layout/PremiumHeader';
import Footer from './components/layout/Footer';
import { WishlistProvider } from './components/wishlist/WishlistContext';
import { I18nProvider } from './components/i18n/I18nProvider';

import GlobalSearch from "@/components/admin/GlobalSearch";
import ShopCommandPalette from "@/components/shop/ShopCommandPalette";

export default function Layout({ children, currentPageName }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('nebula-theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('nebula-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <I18nProvider>
      <WishlistProvider>
        <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${theme === 'light'
          ? 'bg-zinc-50'
          : 'bg-[#0a0a0c]' // Deep rich dark background
          }`}>

          {/* Dynamic Background Effects (Dark Mode Only) */}
          {theme === 'dark' && (
            <div className="fixed inset-0 z-0 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-nebula-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] animate-nebula-pulse delay-1000" />
              <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-900/10 rounded-full blur-[100px] animate-float delay-700" />
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
            </div>
          )}

          <style>{`
          :root {
            --nebula-primary: #8B5CF6;
            --nebula-secondary: #EC4899;
          }
          [data-theme="dark"] {
            color-scheme: dark;
          }
          [data-theme="light"] {
            color-scheme: light;
          }
        `}</style>

          {/* Premium Header */}
          <div className="relative z-10">
            <PremiumHeader />
            <GlobalSearch />
            <ShopCommandPalette />

            {/* Main Content */}
            <main className="min-h-[calc(100vh-8rem)]">
              {children}
            </main>

            {/* Footer */}
            <Footer theme={theme} />
          </div>
        </div>
      </WishlistProvider>
    </I18nProvider>
  );
}