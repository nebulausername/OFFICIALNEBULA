import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown, Store, Command, Clock, TrendingUp, Sparkles, LayoutGrid, Grid3X3, Grid2X2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../i18n/I18nProvider';

const RECENT_SEARCHES_KEY = 'nebula_recent_searches';
const MAX_RECENT_SEARCHES = 5;

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
  productCount = 0,
  products = [], // For search suggestions
  viewMode = 4,
  onViewModeChange
}) {
  const { t } = useI18n();
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading recent searches:', e);
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut CMD/CTRL + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // ESC to close dropdown
      if (e.key === 'Escape') {
        setShowDropdown(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save search to recent when user submits
  const saveRecentSearch = (query) => {
    if (!query.trim() || query.length < 2) return;

    const updated = [
      query.trim(),
      ...recentSearches.filter(s => s.toLowerCase() !== query.toLowerCase())
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const handleSearchSelect = (query) => {
    onSearchChange(query);
    saveRecentSearch(query);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  // Generate search suggestions from products
  const searchSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2 || !products.length) return [];

    const query = searchQuery.toLowerCase();
    return products
      .filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query)
      )
      .slice(0, 4)
      .map(p => ({
        type: 'product',
        text: p.name,
        sku: p.sku,
        image: p.cover_image,
        price: p.price
      }));
  }, [searchQuery, products]);

  // Handle Enter key to save search
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      setShowDropdown(false);
    }
  };

  const sortOptions = [
    { value: 'newest', label: 'Neueste' },
    { value: 'popular', label: 'Beliebt' },
    { value: 'delivery', label: 'Schnelle Lieferung' },
    { value: 'price_asc', label: 'Preis ↑' },
    { value: 'price_desc', label: 'Preis ↓' },
    { value: 'name_asc', label: 'A-Z' },
    { value: 'name_desc', label: 'Z-A' }
  ];

  const hasDropdownContent =
    (isFocused && !searchQuery && recentSearches.length > 0) ||
    (searchQuery && searchSuggestions.length > 0);

  // Format currency helper if not available from hook (though it should be)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Main Control Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        {/* Search Bar - Premium Glow Effect */}
        <div className="flex-1 relative group" ref={dropdownRef}>
          <div
            className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-600/20 opacity-0 transition-opacity duration-500 blur-md ${isFocused ? 'opacity-100' : 'group-hover:opacity-50'}`}
          />
          <div className="relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 z-10 ${isFocused ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}
            />
            <Input
              ref={inputRef}
              type="text"
              placeholder={t('shop.searchPlaceholder') || 'Produkte suchen...'}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                setShowDropdown(true);
              }}
              onBlur={() => {
                setIsFocused(false);
                // Delay hiding dropdown to allow clicks
                setTimeout(() => setShowDropdown(false), 150);
              }}
              onKeyDown={handleKeyDown}
              className="w-full h-14 pl-12 pr-14 text-base font-medium rounded-xl bg-black/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-xl"
            />

            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
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

            {/* Search Dropdown */}
            <AnimatePresence>
              {showDropdown && hasDropdownContent && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 p-3 rounded-xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 shadow-2xl z-50 overflow-hidden"
                >
                  {/* Search Suggestions */}
                  {searchQuery && searchSuggestions.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                        <TrendingUp className="w-3 h-3" />
                        Vorschläge
                      </div>
                      <div className="space-y-1 mt-1">
                        {searchSuggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => handleSearchSelect(suggestion.text)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                          >
                            {suggestion.image && (
                              <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 border border-white/5">
                                <img
                                  src={suggestion.image}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <div className="flex-1 text-left min-w-0">
                              <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                                {suggestion.text}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-mono text-amber-400">{formatPrice(suggestion.price)}</span>
                                {suggestion.sku && (
                                  <span className="text-[10px] text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded">{suggestion.sku}</span>
                                )}
                              </div>
                            </div>
                            <Sparkles className="w-4 h-4 text-amber-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Searches */}
                  {!searchQuery && recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-2 py-1">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                          <Clock className="w-3 h-3" />
                          Letzte Suchen
                        </div>
                        <button
                          onClick={clearRecentSearches}
                          className="text-[10px] text-zinc-600 hover:text-amber-400 transition-colors"
                        >
                          Löschen
                        </button>
                      </div>
                      <div className="space-y-1 mt-1">
                        {recentSearches.map((search, i) => (
                          <button
                            key={i}
                            onClick={() => handleSearchSelect(search)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                          >
                            <Clock className="w-4 h-4 text-zinc-600" />
                            <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                              {search}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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
            <span className="text-zinc-200 group-hover:text-white">{t('shop.categories') || 'Kategorien'}</span>
          </motion.button>

          {/* Filter Button */}
          <Button
            onClick={onFiltersClick}
            variant="outline"
            className={`h-14 px-6 rounded-xl font-bold text-sm relative transition-all border-zinc-800 hover:bg-zinc-800 hover:text-white ${activeFilters > 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-black/40 text-zinc-300'}`}
          >
            <SlidersHorizontal className="w-5 h-5 me-2" />
            {t('shop.filters') || 'Filter'}
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

      {/* Active Filters Chips */}
      {activeFilters > 0 && (
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mr-2">Aktive Filter:</span>

          {/* Clear All Button */}
          <button
            onClick={() => onFiltersClick()}
            className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-colors"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}

      {/* Results Bar */}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-zinc-500">
          <span className="text-white font-bold">{productCount}</span> {t('shop.products') || 'Produkte'} gefunden
        </span>

        <div className="flex items-center gap-4">
          {/* Layout Switcher */}
          {onViewModeChange && (
            <div className="hidden md:flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
              <button
                onClick={() => onViewModeChange(2)}
                className={`p-1.5 rounded-md transition-all ${viewMode === 2 ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="2 Columns"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange(3)}
                className={`p-1.5 rounded-md transition-all ${viewMode === 3 ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="3 Columns"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange(4)}
                className={`p-1.5 rounded-md transition-all ${viewMode === 4 ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="4 Columns"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          )}

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
