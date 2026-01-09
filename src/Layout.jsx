import React, { useState, useEffect } from 'react';
import MobileHeader from './components/layout/MobileHeader';
import { Star } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('nebula-theme') || 'light';
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

      {/* Mobile Header */}
      <MobileHeader theme={theme} toggleTheme={toggleTheme} />

      {/* Main Content */}
      <main className="min-h-[calc(100vh-8rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-zinc-400" fill="currentColor" />
              <span className="text-sm text-zinc-600">© 2026 Nebula Supply. Premium Quality.</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-zinc-600 hover:text-zinc-900 transition-colors font-medium">Impressum</a>
              <a href="#" className="text-zinc-600 hover:text-zinc-900 transition-colors font-medium">Datenschutz</a>
              <a href="#" className="text-zinc-600 hover:text-zinc-900 transition-colors font-medium">AGB</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}