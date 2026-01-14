import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronLeft, Search, Check,
  ShoppingBag, Shirt, Watch, Footprints, Briefcase, 
  Crown, Sparkles, Star, Grid3X3
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Category icons mapping
const categoryIcons = {
  'sneaker': Footprints,
  'schuhe': Footprints,
  'kleidung': Shirt,
  'clothing': Shirt,
  'taschen': Briefcase,
  'bags': Briefcase,
  'accessoires': Watch,
  'accessories': Watch,
  'default': ShoppingBag
};

const getCategoryIcon = (name) => {
  const lowerName = (name || '').toLowerCase();
  for (const [key, Icon] of Object.entries(categoryIcons)) {
    if (lowerName.includes(key)) return Icon;
  }
  return categoryIcons.default;
};

// Quick category chips for mobile
const quickChips = [
  { id: 'sneaker', label: 'Sneaker', icon: '👟' },
  { id: 'kleidung', label: 'Kleidung', icon: '👕' },
  { id: 'taschen', label: 'Taschen', icon: '👜' },
  { id: 'accessoires', label: 'Accessoires', icon: '⌚' },
  { id: 'caps', label: 'Caps', icon: '🧢' },
  { id: 'guertel', label: 'Gürtel', icon: '🎗️' },
];

export default function ShopCategoryDrawer({ 
  isOpen, 
  onClose, 
  categories = [], 
  brands = [],
  departments = [],
  onSelectCategory,
  onSelectBrand,
  selectedCategory 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMainCategory, setActiveMainCategory] = useState(null);
  const [mobileStep, setMobileStep] = useState('main'); // 'main' | 'sub'
  const [isMobile, setIsMobile] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setApplied(false);
      setMobileStep('main');
      setActiveMainCategory(null);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleCategorySelect = (categoryId, categoryName) => {
    setApplied(true);
    onSelectCategory?.(categoryId, categoryName);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleSelectAll = () => {
    setApplied(true);
    onSelectCategory?.('all', 'Alle Produkte');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  // Group categories by department
  const groupedCategories = departments.map(dept => ({
    ...dept,
    categories: categories.filter(cat => cat.department_id === dept.id)
  }));

  // Filter categories based on search
  const filteredCategories = searchQuery
    ? categories.filter(cat => 
        cat.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  const filteredBrands = searchQuery
    ? brands.filter(brand =>
        brand.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : brands;

  // Mobile Bottom Sheet
  const MobileDrawer = () => (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl overflow-hidden"
      style={{
        height: '90vh',
        background: 'rgba(15, 15, 20, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderBottom: 'none'
      }}
    >
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-12 h-1.5 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.3)' }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-4">
        {mobileStep === 'sub' ? (
          <button
            onClick={() => setMobileStep('main')}
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
          >
            <ChevronLeft className="w-5 h-5" />
            Zurück
          </button>
        ) : (
          <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
            Shop Kategorien
          </h2>
        )}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255, 255, 255, 0.08)' }}
        >
          <X className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 pb-4">
        <div className="relative">
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: 'rgba(255, 255, 255, 0.4)' }}
          />
          <Input
            type="text"
            placeholder="Kategorie oder Marke suchen…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl text-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF'
            }}
          />
        </div>
      </div>

      {/* Applied Feedback */}
      <AnimatePresence>
        {applied && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full flex items-center gap-2 z-50"
            style={{ 
              background: 'rgba(52, 211, 153, 0.2)',
              border: '1px solid rgba(52, 211, 153, 0.4)'
            }}
          >
            <Check className="w-4 h-4" style={{ color: '#34D399' }} />
            <span className="text-sm font-semibold" style={{ color: '#34D399' }}>Filter angewendet</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="h-[calc(100%-180px)] overflow-y-auto px-5 pb-8 scrollbar-hide">
        {mobileStep === 'main' ? (
          <>
            {/* Quick Chips */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {quickChips.map(chip => (
                <button
                  key={chip.id}
                  onClick={() => handleCategorySelect(chip.id, chip.label)}
                  className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <span className="mr-1.5">{chip.icon}</span>
                  {chip.label}
                </button>
              ))}
            </div>

            {/* All Products */}
            <button
              onClick={handleSelectAll}
              className="w-full flex items-center justify-between p-4 rounded-xl mb-3 transition-all"
              style={{
                background: selectedCategory === 'all' 
                  ? 'rgba(214, 178, 94, 0.15)' 
                  : 'rgba(255, 255, 255, 0.04)',
                border: selectedCategory === 'all'
                  ? '1px solid rgba(214, 178, 94, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(214, 178, 94, 0.15)' }}
                >
                  <Grid3X3 className="w-6 h-6" style={{ color: '#D6B25E' }} />
                </div>
                <div className="text-left">
                  <div className="font-bold" style={{ color: '#FFFFFF' }}>Alle Produkte</div>
                  <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Filter zurücksetzen
                  </div>
                </div>
              </div>
              {selectedCategory === 'all' && (
                <Check className="w-5 h-5" style={{ color: '#D6B25E' }} />
              )}
            </button>

            {/* Main Categories */}
            <div className="space-y-2">
              {(searchQuery ? filteredCategories : categories).map(category => {
                const IconComponent = getCategoryIcon(category.name);
                const isSelected = selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id, category.name)}
                    className="w-full flex items-center justify-between p-4 rounded-xl transition-all"
                    style={{
                      background: isSelected 
                        ? 'rgba(214, 178, 94, 0.15)' 
                        : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected
                        ? '1px solid rgba(214, 178, 94, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                      >
                        <IconComponent className="w-6 h-6" style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold" style={{ color: '#FFFFFF' }}>{category.name}</div>
                      </div>
                    </div>
                    {isSelected ? (
                      <Check className="w-5 h-5" style={{ color: '#D6B25E' }} />
                    ) : (
                      <ChevronRight className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Brands Section */}
            {filteredBrands.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  Marken
                </h3>
                <div className="flex flex-wrap gap-2">
                  {filteredBrands.slice(0, 8).map(brand => (
                    <button
                      key={brand.id}
                      onClick={() => {
                        onSelectBrand?.(brand.id);
                        setApplied(true);
                        setTimeout(onClose, 400);
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.85)'
                      }}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Sub Categories */
          <div className="space-y-2">
            {activeMainCategory?.categories?.map(subCat => (
              <button
                key={subCat.id}
                onClick={() => handleCategorySelect(subCat.id, subCat.name)}
                className="w-full flex items-center justify-between p-4 rounded-xl transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <span className="font-semibold" style={{ color: '#FFFFFF' }}>{subCat.name}</span>
                <ChevronRight className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  // Desktop Mega Menu
  const DesktopMegaMenu = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-x-0 top-20 z-50 mx-auto max-w-6xl rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(15, 15, 20, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Shop Kategorien</h2>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'rgba(255, 255, 255, 0.08)' }}
        >
          <X className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
        </button>
      </div>

      {/* Applied Feedback */}
      <AnimatePresence>
        {applied && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full flex items-center gap-2 z-50"
            style={{ 
              background: 'rgba(52, 211, 153, 0.2)',
              border: '1px solid rgba(52, 211, 153, 0.4)'
            }}
          >
            <Check className="w-4 h-4" style={{ color: '#34D399' }} />
            <span className="text-sm font-semibold" style={{ color: '#34D399' }}>Filter angewendet</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Grid */}
      <div className="grid grid-cols-4 min-h-[400px]">
        {/* Column 1: Main Categories */}
        <div className="border-r p-4 space-y-1" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={handleSelectAll}
            onMouseEnter={() => setActiveMainCategory(null)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
            style={{
              background: selectedCategory === 'all' ? 'rgba(214, 178, 94, 0.15)' : 'transparent',
              border: selectedCategory === 'all' ? '1px solid rgba(214, 178, 94, 0.3)' : '1px solid transparent'
            }}
          >
            <Grid3X3 className="w-5 h-5" style={{ color: '#D6B25E' }} />
            <span className="font-semibold" style={{ color: '#FFFFFF' }}>Alle Produkte</span>
            {selectedCategory === 'all' && <Check className="w-4 h-4 ml-auto" style={{ color: '#D6B25E' }} />}
          </button>

          {categories.map(category => {
            const IconComponent = getCategoryIcon(category.name);
            const isActive = activeMainCategory?.id === category.id;
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id, category.name)}
                onMouseEnter={() => setActiveMainCategory(category)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
                style={{
                  background: isActive || isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: isSelected ? '1px solid rgba(214, 178, 94, 0.3)' : '1px solid transparent'
                }}
              >
                <IconComponent className="w-5 h-5" style={{ color: isSelected ? '#D6B25E' : 'rgba(255, 255, 255, 0.6)' }} />
                <span className="font-semibold" style={{ color: isSelected ? '#D6B25E' : '#FFFFFF' }}>{category.name}</span>
                {isSelected && <Check className="w-4 h-4 ml-auto" style={{ color: '#D6B25E' }} />}
              </button>
            );
          })}
        </div>

        {/* Column 2: Brands */}
        <div className="border-r p-4" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4 px-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Marken
          </h3>
          <div className="space-y-1">
            {brands.slice(0, 10).map(brand => (
              <button
                key={brand.id}
                onClick={() => {
                  onSelectBrand?.(brand.id);
                  setApplied(true);
                  setTimeout(onClose, 400);
                }}
                className="w-full px-4 py-2.5 rounded-lg text-left font-medium transition-all hover:bg-white/5"
                style={{ color: 'rgba(255, 255, 255, 0.85)' }}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>

        {/* Column 3: Quick Filters */}
        <div className="border-r p-4" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4 px-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Schnellfilter
          </h3>
          <div className="flex flex-wrap gap-2">
            {quickChips.map(chip => (
              <button
                key={chip.id}
                onClick={() => handleCategorySelect(chip.id, chip.label)}
                className="px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.85)'
                }}
              >
                <span className="mr-1">{chip.icon}</span>
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Column 4: Featured */}
        <div className="p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4 px-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Featured
          </h3>
          <div className="space-y-3">
            <div 
              className="p-4 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(214, 178, 94, 0.15), rgba(214, 178, 94, 0.05))',
                border: '1px solid rgba(214, 178, 94, 0.25)'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" style={{ color: '#D6B25E' }} />
                <span className="text-sm font-bold" style={{ color: '#D6B25E' }}>Neu eingetroffen</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Entdecke die neuesten Drops
              </p>
            </div>
            <div 
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.25)'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4" style={{ color: '#A78BFA' }} />
                <span className="text-sm font-bold" style={{ color: '#A78BFA' }}>Bestseller</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Die beliebtesten Produkte
              </p>
            </div>
            <div 
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(236, 72, 153, 0.1)',
                border: '1px solid rgba(236, 72, 153, 0.25)'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4" style={{ color: '#F472B6' }} />
                <span className="text-sm font-bold" style={{ color: '#F472B6' }}>VIP Exklusiv</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Nur für VIP Mitglieder
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0, 0, 0, 0.6)' }}
          />

          {/* Drawer/Menu */}
          {isMobile ? <MobileDrawer /> : <DesktopMegaMenu />}
        </>
      )}
    </AnimatePresence>
  );
}