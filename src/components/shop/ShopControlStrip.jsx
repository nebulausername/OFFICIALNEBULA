import React, { useState } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown, Store } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
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



  const sortOptions = [
    { value: 'newest', label: 'Neueste' },
    { value: 'popular', label: 'Beliebt' },
    { value: 'price_asc', label: 'Preis ↑' },
    { value: 'price_desc', label: 'Preis ↓' },
    { value: 'name_asc', label: 'A-Z' },
    { value: 'name_desc', label: 'Z-A' }
  ];

  return (
    <div className="space-y-4">
      {/* Main Control Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
            style={{ color: isFocused ? '#D6B25E' : 'rgba(255, 255, 255, 0.5)' }}
          />
          <Input
            type="text"
            placeholder={t('shop.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full h-14 pl-12 pr-12 text-base font-medium rounded-xl transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: isFocused ? '1px solid rgba(214, 178, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              boxShadow: isFocused ? '0 0 20px rgba(214, 178, 94, 0.15)' : 'none'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <X className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Categories Button - PREMIUM DARK GLASS */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCategoriesClick}
            className="h-14 px-6 rounded-[16px] font-bold text-sm flex items-center gap-2.5 transition-all"
            style={{
              background: 'rgba(20, 22, 28, 0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(214, 178, 94, 0.35)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
              color: '#F2D27C'
            }}
          >
            <Store className="w-5 h-5" />
            <span>{t('shop.categories')}</span>
          </motion.button>

          {/* Filter Button */}
          <Button
            onClick={onFiltersClick}
            variant="outline"
            className="h-14 px-5 rounded-xl font-bold text-sm relative transition-all"
            style={{
              background: activeFilters > 0 ? 'rgba(214, 178, 94, 0.1)' : 'rgba(255, 255, 255, 0.06)',
              border: activeFilters > 0 ? '1px solid rgba(214, 178, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
              color: activeFilters > 0 ? '#F2D27C' : '#FFFFFF'
            }}
          >
            <SlidersHorizontal className="w-5 h-5 me-2" />
            {t('shop.filters')}
            {activeFilters > 0 && (
              <span
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                style={{
                  background: 'linear-gradient(135deg, #D6B25E, #F2D27C)',
                  color: '#0B0D12'
                }}
              >
                {activeFilters}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Department Chips - Premium */}
      {departments.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onDepartmentSelect?.('all')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
            style={{
              background: selectedDepartment === 'all' ? 'rgba(214, 178, 94, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              border: selectedDepartment === 'all' ? '1px solid rgba(214, 178, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: selectedDepartment === 'all' ? '#F2D27C' : 'rgba(255, 255, 255, 0.85)'
            }}
          >
            Alle
          </motion.button>
          {departments.map((dept) => (
            <motion.button
              key={dept.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDepartmentSelect?.(dept.id)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
              style={{
                background: selectedDepartment === dept.id ? 'rgba(214, 178, 94, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                border: selectedDepartment === dept.id ? '1px solid rgba(214, 178, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                color: selectedDepartment === dept.id ? '#F2D27C' : 'rgba(255, 255, 255, 0.85)'
              }}
            >
              {dept.name}
            </motion.button>
          ))}
        </div>
      )}

      {/* Quick Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onCategorySelect('all')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
          style={{
            background: selectedCategory === 'all' ? 'rgba(214, 178, 94, 0.15)' : 'rgba(255, 255, 255, 0.06)',
            border: selectedCategory === 'all' ? '1px solid rgba(214, 178, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            color: selectedCategory === 'all' ? '#F2D27C' : 'rgba(255, 255, 255, 0.85)'
          }}
        >
          {t('common.all')}
        </motion.button>
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCategorySelect(cat.id)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
            style={{
              background: selectedCategory === cat.id ? 'rgba(214, 178, 94, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              border: selectedCategory === cat.id ? '1px solid rgba(214, 178, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: selectedCategory === cat.id ? '#F2D27C' : 'rgba(255, 255, 255, 0.85)'
            }}
          >
            {cat.name}
          </motion.button>
        ))}
      </div>

      {/* Results Bar */}
      <div
        className="flex items-center justify-between py-4 px-1"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
      >
        <span className="text-base font-semibold" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
          <span className="font-black" style={{ color: '#F2D27C' }}>{productCount}</span> {t('shop.products')}
        </span>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="h-10 pl-4 pr-10 rounded-lg text-sm font-semibold appearance-none cursor-pointer transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF'
              }}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: '#12151C' }}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}