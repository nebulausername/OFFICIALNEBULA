import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { X, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

export default function SideDrawer({ isOpen, onClose }) {
  const [currentLevel, setCurrentLevel] = useState('main');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = {
    main: [
      { name: 'SNEAKER', hasSubmenu: true },
      { name: 'KLEIDUNG', hasSubmenu: true },
      { name: 'TASCHEN', hasSubmenu: true },
      { name: 'MÜTZEN & CAPS', hasSubmenu: true },
      { name: 'GELDBÖRSEN', hasSubmenu: false },
      { name: 'GÜRTEL', hasSubmenu: false },
      { name: 'HIGH HEELS', hasSubmenu: true },
      { name: 'PROFIL', hasSubmenu: false, link: 'Profile' }
    ],
    SNEAKER: [
      {
        section: 'NIKE',
        items: ['AirMax 95', 'AirMax DN', 'SHOX TL', 'AIR FORCE', 'Dunk SB']
      },
      {
        section: 'AIR JORDAN',
        items: ['Air Jordan 1 High', 'Air Jordan 1 Low', 'Air Jordan 3', 'Air Jordan 4', 'Air Jordan 5', 'Air Jordan 6', 'Air Jordan 11']
      },
      {
        section: 'NOCTA',
        items: ['Glide', 'Hot Step', 'Hot Step 2']
      },
      {
        section: 'MAISON MARGIELA',
        items: ['Gats']
      }
    ],
    KLEIDUNG: [
      {
        section: 'WINTER JACKEN',
        items: ['Canada Goose', 'Moncler Herren', 'Moncler Damen', 'Polo Ralph Lauren', 'Stüssy', 'Corteiz', 'C.P. Company', 'BBR']
      },
      {
        section: 'CARDIGANS',
        items: ['Moncler']
      },
      {
        section: 'TRACKSUITS',
        items: ['Nocta']
      }
    ],
    TASCHEN: [
      {
        section: 'LUXURY BRANDS',
        items: ['Louis Vuitton', 'Gucci', 'Prada', 'Dior']
      }
    ],
    'MÜTZEN & CAPS': [
      {
        section: 'CAPS',
        items: ['New Era', 'Nike', 'Adidas']
      }
    ],
    'HIGH HEELS': [
      {
        section: 'DESIGNER',
        items: ['Christian Louboutin', 'Jimmy Choo', 'Manolo Blahnik']
      }
    ]
  };

  const handleCategoryClick = (category) => {
    if (category.link) {
      window.location.href = createPageUrl(category.link);
      onClose();
    } else if (category.hasSubmenu) {
      setSelectedCategory(category.name);
      setCurrentLevel('submenu');
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    setCurrentLevel('main');
    setSelectedCategory(null);
  };

  const handleItemClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-0 top-0 bottom-0 w-[90%] max-w-[420px] bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 z-[101] shadow-2xl overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="min-h-full flex flex-col">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-b from-zinc-900 to-zinc-900/95 z-10 border-b border-zinc-800">
                <div className="flex items-center justify-between px-5 py-4">
                  {currentLevel === 'submenu' ? (
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-white font-bold text-base hover:text-zinc-300 transition-colors touch-manipulation"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      {selectedCategory}
                    </button>
                  ) : (
                    <div className="text-white font-black text-lg tracking-tight">MENÜ</div>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 -mr-2 touch-manipulation hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Search - only on main level */}
                {currentLevel === 'main' && (
                  <div className="px-5 pb-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Suche..."
                        className="h-12 pl-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 py-2">
                <AnimatePresence mode="wait">
                  {currentLevel === 'main' ? (
                    <motion.div
                      key="main"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {categories.main.map((category, index) => (
                        <button
                          key={index}
                          onClick={() => handleCategoryClick(category)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-800 active:bg-zinc-700 transition-colors touch-manipulation border-b border-zinc-800"
                        >
                          <span className={`font-bold text-base tracking-tight ${
                            category.name === 'PROFIL' 
                              ? 'text-purple-400 font-black'
                              : 'text-white'
                          }`}>
                            {category.name}
                          </span>
                          {category.hasSubmenu && (
                            <ChevronRight className="w-5 h-5 text-zinc-600" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="submenu"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6 px-5 py-4"
                    >
                      {categories[selectedCategory]?.map((section, sectionIndex) => (
                        <div key={sectionIndex}>
                          <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider mb-3">
                            {section.section}
                          </h3>
                          <div className="space-y-1">
                            {section.items.map((item, itemIndex) => (
                              <Link
                                key={itemIndex}
                                to={createPageUrl('Products')}
                                onClick={handleItemClick}
                                className="block py-3 text-white font-medium text-base hover:text-purple-300 transition-colors touch-manipulation"
                              >
                                {item}
                              </Link>
                            ))}
                          </div>
                          {sectionIndex < categories[selectedCategory].length - 1 && (
                            <div className="mt-4 border-t border-zinc-800" />
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}