import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Search, User, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

// Menu Data Structure
const MENU_DATA = {
  SNEAKER: {
    columns: [
      {
        title: 'NIKE',
        items: ['AIRMAX 95', 'AIRMAX DN', 'SHOX TL', 'AIR FORCE', 'DUNK SB']
      },
      {
        title: 'AIR JORDAN',
        items: ['AIR JORDAN 1 HIGH', 'AIR JORDAN 1 LOW', 'AIR JORDAN 3', 'AIR JORDAN 4', 'AIR JORDAN 5', 'AIR JORDAN 6']
      },
      {
        title: 'NOCTA',
        items: ['GLIDE', 'HOT STEP', 'HOT STEP 2']
      },
      {
        title: 'MAISON MARGIELA',
        items: ['GATS']
      },
      {
        title: 'CHANEL',
        items: ['RUNNER']
      },
      {
        title: 'LV',
        items: ['SKATE', 'TRAINER']
      }
    ]
  },
  KLEIDUNG: {
    columns: [
      {
        title: 'WINTERJACKEN',
        items: ['CANADA GOOSE', 'MONCLER HERREN', 'MONCLER DAMEN', 'POLO RALPH LAUREN', 'STÜSSY', 'CORTEIZ', 'C.P. COMPANY', 'BBR']
      },
      {
        title: 'CARDIGANS',
        items: ['MONCLER']
      },
      {
        title: 'TRACKSUITS',
        items: ['NOCTA']
      }
    ]
  },
  TASCHEN: { columns: [] },
  'MÜTZEN & CAPS': { columns: [] },
  GELDBÖRSEN: { columns: [] },
  GÜRTEL: { columns: [] },
  'HIGH HEELS': { columns: [] }
};

export default function PremiumHeader() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadCartCount();
  }, []);

  const loadCartCount = async () => {
    try {
      const user = await base44.auth.me();
      const cartItems = await base44.entities.StarCartItem.filter({ user_id: user.id });
      setCartCount(cartItems.length);
    } catch (error) {
      setCartCount(0);
    }
  };

  const handleMouseEnter = (menuKey) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveMenu(menuKey);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 120);
  };

  const handleKeyDown = (e, menuKey) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveMenu(activeMenu === menuKey ? null : menuKey);
    } else if (e.key === 'Escape') {
      setActiveMenu(null);
    }
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const menuKeys = Object.keys(MENU_DATA);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-200 ${
          isScrolled ? 'shadow-sm backdrop-blur-md bg-white/95' : ''
        }`}
        style={{ borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(0,0,0,0.04)' }}
      >
        {/* Top Bar */}
        <div className="border-b border-zinc-100">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="h-14 flex items-center justify-between">
              {/* Logo */}
              <Link to={createPageUrl('Home')} className="text-xl font-black tracking-tight text-zinc-900 hover:text-zinc-700 transition-colors">
                LOGO
              </Link>

              {/* Center Tabs - Desktop */}
              <nav className="hidden md:flex items-center gap-8" role="navigation">
                <Link 
                  to={createPageUrl('Home')} 
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors relative group"
                >
                  Home
                  <span className="absolute bottom-[-1px] left-0 w-0 h-[2px] bg-zinc-900 transition-all duration-200 group-hover:w-full" />
                </Link>
                <Link 
                  to={createPageUrl('Products')} 
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors relative group"
                >
                  Shop
                  <span className="absolute bottom-[-1px] left-0 w-0 h-[2px] bg-zinc-900 transition-all duration-200 group-hover:w-full" />
                </Link>
                <Link 
                  to={createPageUrl('Profile')} 
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors relative group"
                >
                  Profil
                  <span className="absolute bottom-[-1px] left-0 w-0 h-[2px] bg-zinc-900 transition-all duration-200 group-hover:w-full" />
                </Link>
                <Link 
                  to={createPageUrl('Support')} 
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors relative group"
                >
                  <span className="flex items-center gap-1.5">
                    Tickets
                    <span className="text-[9px] font-black text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full">NEU</span>
                  </span>
                  <span className="absolute bottom-[-1px] left-0 w-0 h-[2px] bg-zinc-900 transition-all duration-200 group-hover:w-full" />
                </Link>
              </nav>

              {/* Right Icons */}
              <div className="flex items-center gap-4">
                <button 
                  className="hidden md:block p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
                <Link 
                  to={createPageUrl('Profile')} 
                  className="hidden md:block p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                  aria-label="User Profile"
                >
                  <User className="w-5 h-5" />
                </Link>
                <Link 
                  to={createPageUrl('Cart')} 
                  className="relative p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                  aria-label="Shopping Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-zinc-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button 
                  className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open Menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation - Desktop */}
        <nav className="hidden md:block" role="menubar">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="h-11 flex items-center gap-8">
              {menuKeys.map((menuKey) => (
                <div
                  key={menuKey}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(menuKey)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`text-[11px] font-semibold tracking-wider uppercase transition-colors relative ${
                      activeMenu === menuKey ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                    onKeyDown={(e) => handleKeyDown(e, menuKey)}
                    role="menuitem"
                    aria-haspopup="true"
                    aria-expanded={activeMenu === menuKey}
                  >
                    {menuKey}
                    {activeMenu === menuKey && (
                      <motion.span
                        layoutId="activeTab"
                        className="absolute bottom-[-11px] left-0 right-0 h-[2px] bg-zinc-900"
                        initial={false}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Mega Menu - Desktop */}
      <AnimatePresence>
        {activeMenu && MENU_DATA[activeMenu]?.columns?.length > 0 && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 bg-black/10 z-40"
              style={{ top: isScrolled ? '105px' : '105px' }}
              onClick={() => setActiveMenu(null)}
            />

            {/* Mega Menu Content */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed left-0 right-0 z-50 bg-white shadow-lg"
              style={{ top: isScrolled ? '105px' : '105px' }}
              onMouseEnter={() => handleMouseEnter(activeMenu)}
              onMouseLeave={handleMouseLeave}
              role="menu"
            >
              <div className="max-w-[1400px] mx-auto px-6 py-8">
                <div className="grid gap-12" style={{ gridTemplateColumns: `repeat(${Math.min(MENU_DATA[activeMenu].columns.length, 6)}, 1fr)` }}>
                  {MENU_DATA[activeMenu].columns.map((column, idx) => (
                    <div key={idx}>
                      <h3 className="text-xs font-bold tracking-wider uppercase text-zinc-900 mb-4">
                        {column.title}
                      </h3>
                      <ul className="space-y-2.5">
                        {column.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <Link
                              to={createPageUrl('Products')}
                              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors block py-0.5 hover:translate-x-0.5 transition-transform"
                              role="menuitem"
                            >
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                <span className="text-lg font-black tracking-tight">MENÜ</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-zinc-600 hover:text-zinc-900"
                  aria-label="Close Menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <div className="p-6 border-b border-zinc-100 space-y-4">
                <Link 
                  to={createPageUrl('Home')} 
                  className="block text-sm font-medium text-zinc-900 hover:text-purple-600 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to={createPageUrl('Products')} 
                  className="block text-sm font-medium text-zinc-900 hover:text-purple-600 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Shop
                </Link>
                <Link 
                  to={createPageUrl('Profile')} 
                  className="block text-sm font-medium text-zinc-900 hover:text-purple-600 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Profil
                </Link>
                <Link 
                  to={createPageUrl('Support')} 
                  className="block text-sm font-medium text-zinc-900 hover:text-purple-600 transition-colors relative"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    Support Tickets
                    <span className="text-[10px] font-black text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">NEU</span>
                  </span>
                </Link>
              </div>

              {/* Mobile Accordion Menu */}
              <div className="p-6">
                {menuKeys.map((menuKey) => {
                  const hasSubmenu = MENU_DATA[menuKey]?.columns?.length > 0;
                  
                  return (
                    <div key={menuKey} className="border-b border-zinc-100 last:border-0">
                      <button
                        onClick={() => setMobileAccordion(mobileAccordion === menuKey ? null : menuKey)}
                        className="w-full py-4 flex items-center justify-between text-left"
                      >
                        <span className="text-xs font-bold tracking-wider uppercase text-zinc-900">
                          {menuKey}
                        </span>
                        {hasSubmenu && (
                          <ChevronDown 
                            className={`w-4 h-4 text-zinc-600 transition-transform ${
                              mobileAccordion === menuKey ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </button>

                      <AnimatePresence>
                        {mobileAccordion === menuKey && hasSubmenu && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pb-4 pl-4 space-y-4">
                              {MENU_DATA[menuKey].columns.map((column, idx) => (
                                <div key={idx}>
                                  <h4 className="text-xs font-bold tracking-wider uppercase text-zinc-700 mb-2">
                                    {column.title}
                                  </h4>
                                  <ul className="space-y-1.5">
                                    {column.items.map((item, itemIdx) => (
                                      <li key={itemIdx}>
                                        <Link
                                          to={createPageUrl('Products')}
                                          className="text-sm text-zinc-600 block py-1"
                                          onClick={() => setMobileOpen(false)}
                                        >
                                          {item}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-[105px]" />
    </>
  );
}