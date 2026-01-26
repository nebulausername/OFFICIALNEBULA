import React, { useState, useEffect, useRef } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown, Store, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../i18n/I18nProvider';

export default function ShopControlStrip({
  searchQuery,
  onSearchChange,
  onCategoriesClick,
  onFiltersClick,
  activeFilters = 0,
  categories = [],
  selectedCategory,
  onCategorySelect,
  departments = [],
  selectedDepartment = 'all',
  onDepartmentSelect,
  sortBy,
  onSortChange,
  productCount = 0
}) {
  const { t } = useI18n();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Keyboard shortcut CMD/CTRL + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sortOptions = [
    { value: 'newest', label: 'Neueste' },
    { value: 'popular', label: 'Beliebt' },
    { value: 'price_asc', label: 'Preis aufsteigend' },
    { value: 'price_desc', label: 'Preis absteigend' },
    { value: 'name_asc', label: 'A-Z' },
    { value: 'name_desc', label: 'Z-A' }
  ];

  return (
    <div className="space-y-6">
      {/* Main Control Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        {/* Search Bar - Premium Glow Effect */}
        <div className="flex-1 relative group">
          <div
            className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-600/20 opacity-0 transition-opacity duration-500 blur-md ${isFocused ? 'opacity-100' : 'group-hover:opacity-50'}`}
          />
          <div className="relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}
            />
            <Input
              ref={inputRef}
              type="text"
              placeholder={t('shop.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full h-14 pl-12 pr-14 text-base font-medium rounded-xl bg-black/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-xl"
            />

            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <AnimatePresence>
                {searchQuery ? (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => onSearchChange('')}
                    className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                ) : (
                  <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/50 border border-zinc-700/50 text-[10px] font-mono text-zinc-500 transition-opacity duration-300 ${isFocused ? 'opacity-0' : 'opacity-100'}`}>
                    <Command className="w-3 h-3" />
                    <span>K</span>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Categories Button - PREMIUM DARK GLASS */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCategoriesClick}
            className="h-14 px-6 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all relative overflow-hidden group"
            style={{
              background: 'rgba(20, 22, 28, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Store className="w-5 h-5 text-amber-500" />
            <span className="text-zinc-200 group-hover:text-white">{t('shop.categories')}</span>
          </motion.button>

          {/* Filter Button */}
          <Button
            onClick={onFiltersClick}
            variant="outline"
            className={`h-14 px-6 rounded-xl font-bold text-sm relative transition-all border-zinc-800 hover:bg-zinc-800 hover:text-white ${activeFilters > 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-black/40 text-zinc-300'}`}
          >
            <SlidersHorizontal className="w-5 h-5 me-2" />
            {t('shop.filters')}
            {activeFilters > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 text-black text-xs font-black flex items-center justify-center shadow-lg shadow-amber-500/20">
                {activeFilters}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Department Chips - Premium */}
      {departments.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 mask-linear-fade">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDepartmentSelect?.('all')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 border ${selectedDepartment === 'all'
                ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
          >
            Alle Welten
          </motion.button>

          {departments.map((dept) => (
            <motion.button
              key={dept.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDepartmentSelect?.(dept.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 border ${selectedDepartment === dept.id
                  ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
            >
              {dept.name}
            </motion.button>
          ))}
        </div>
      )}

      {/* Results Bar */}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-zinc-500">
          <span className="text-white font-bold">{productCount}</span> {t('shop.products')} gefunden
        </span>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown - Minimalist */}
          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-lg text-sm font-medium bg-transparent text-zinc-400 hover:text-white focus:outline-none appearance-none cursor-pointer transition-colors"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-zinc-400 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
