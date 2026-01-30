import React, { useState, useEffect } from 'react';
import PremiumHeader from './components/layout/PremiumHeader';
import Footer from './components/layout/Footer';
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
        <div className={`min-h-screen transition-colors duration-300 ${theme === 'light'
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
          {/* Footer */}
          <Footer theme={theme} />
        </div>
      </WishlistProvider>
    </I18nProvider>
  );
}