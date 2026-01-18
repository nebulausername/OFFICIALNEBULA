import React, { useState, useEffect } from 'react';
import PremiumHeader from './components/layout/PremiumHeader';
import { WishlistProvider } from './components/wishlist/WishlistContext';
import { I18nProvider } from './components/i18n/I18nProvider';
import { Star } from 'lucide-react';

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
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-gradient-to-br from-zinc-50 via-white to-zinc-50' 
          : 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-black'
      }`}>
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
        <PremiumHeader />

        {/* Main Content */}
        <main className="min-h-[calc(100vh-8rem)]">
          {children}
        </main>

      {/* Footer */}
      <footer className={`border-t mt-20 ${
        theme === 'light' 
          ? 'bg-white border-zinc-200' 
          : 'border-white/10'
      }`} style={theme === 'dark' ? {
        background: 'rgba(8, 8, 12, 0.6)',
        backdropFilter: 'blur(12px)'
      } : {}}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Star className={`w-4 h-4 ${theme === 'light' ? 'text-zinc-400' : 'text-gold/60'}`} fill="currentColor" />
              <span className={`text-sm font-semibold ${theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                © 2026 Nebula Supply. Premium Quality.
              </span>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className={`font-medium transition-colors ${
                theme === 'light' 
                  ? 'text-zinc-600 hover:text-zinc-900' 
                  : 'text-zinc-400 hover:text-white'
              }`}>Impressum</a>
              <a href="#" className={`font-medium transition-colors ${
                theme === 'light' 
                  ? 'text-zinc-600 hover:text-zinc-900' 
                  : 'text-zinc-400 hover:text-white'
              }`}>Datenschutz</a>
              <a href="#" className={`font-medium transition-colors ${
                theme === 'light' 
                  ? 'text-zinc-600 hover:text-zinc-900' 
                  : 'text-zinc-400 hover:text-white'
              }`}>AGB</a>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </WishlistProvider>
    </I18nProvider>
  );
}