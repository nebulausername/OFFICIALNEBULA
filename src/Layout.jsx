import React, { useState, useEffect } from 'react';
import PremiumHeader from './components/layout/PremiumHeader.jsx';
import { WishlistProvider } from './components/wishlist/WishlistContext';
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

      {/* Premium Footer */}
                  <footer className="relative mt-24 overflow-hidden">
                    {/* Gradient Top Border */}
                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                    <div className="relative py-12 px-4" style={{ background: 'linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(5,5,8,1) 100%)' }}>
                      {/* Background Glow */}
                      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

                      <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                          {/* Logo & Copyright */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center p-2" style={{ background: 'rgba(214,178,94,0.15)', border: '1px solid rgba(214,178,94,0.3)' }}>
                              <Star className="w-5 h-5 text-amber-400" fill="currentColor" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-white/80">© 2026 Nebula Supply</span>
                              <p className="text-xs text-white/40">Premium Quality Guaranteed</p>
                            </div>
                          </div>

                          {/* Links */}
                          <div className="flex items-center gap-6">
                            <a href="#" className="text-sm text-white/50 hover:text-white transition-colors font-medium">Impressum</a>
                            <a href="#" className="text-sm text-white/50 hover:text-white transition-colors font-medium">Datenschutz</a>
                            <a href="#" className="text-sm text-white/50 hover:text-white transition-colors font-medium">AGB</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </footer>
      </div>
    </WishlistProvider>
  );
}