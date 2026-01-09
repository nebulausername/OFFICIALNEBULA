import React from 'react';
import MobileHeader from './components/layout/MobileHeader';
import { Star } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <style>{`
        :root {
          --nebula-primary: #8B5CF6;
          --nebula-secondary: #EC4899;
        }
        body {
          background: #fafafa;
        }
      `}</style>

      {/* Mobile Header */}
      <MobileHeader />

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