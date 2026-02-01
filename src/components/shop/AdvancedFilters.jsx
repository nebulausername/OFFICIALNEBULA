import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, SlidersHorizontal, ChevronDown, ChevronUp,
  Check, RotateCcw, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function AdvancedFilters({
  isOpen,
  onClose,
  categories = [],
  brands = [],
  products = [],
  filters,
  onFiltersChange,
  onReset,
  variant = 'drawer'
}) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    sizes: false,
    colors: false,
    availability: false
  });

  // Extract unique sizes and colors from products
  const allSizes = [...new Set(products.flatMap(p => p.sizes || []))].sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  const allColors = [...new Set(products.flatMap(p =>
    (p.colors || []).map(c => JSON.stringify({ name: c.name, hex: c.hex }))
  ))].map(c => JSON.parse(c));

  // Price range
  const prices = products.map(p => p.price || 0).filter(p => p > 0);
  const minPrice = Math.min(...prices, 0);
  const maxPrice = Math.max(...prices, 1000);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const activeFilterCount = [
    filters.categories?.length > 0,
    filters.brands?.length > 0,
    filters.priceRange?.[0] > minPrice || filters.priceRange?.[1] < maxPrice,
    filters.sizes?.length > 0,
    filters.colors?.length > 0,
    filters.inStock !== null
  ].filter(Boolean).length;

  const FilterSection = ({ title, section, children }) => (
    <div className="border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between py-4 px-1 transition-colors hover:bg-white/5"
      >
        <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          {title}
        </span>
        {expandedSections[section] ? (
          <ChevronUp className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
        ) : (
          <ChevronDown className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
        )}
      </button>
      <AnimatePresence>
        {expandedSections[section] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 px-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const CheckboxItem = ({ label, checked, onChange, count }) => (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onChange}
      className="w-full flex items-center justify-between py-2 px-2 rounded-lg transition-all group"
      style={{
        background: checked ? 'rgba(214, 178, 94, 0.08)' : 'transparent',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-5 h-5 rounded flex items-center justify-center transition-all shadow-sm"
          style={{
            background: checked ? 'linear-gradient(135deg, #D6B25E, #F2D27C)' : 'rgba(255, 255, 255, 0.06)',
            border: checked ? 'none' : '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          {checked && <Check className="w-3 h-3" style={{ color: '#0B0D12' }} />}
        </div>
        <span
          className="text-sm font-medium transition-colors"
          style={{ color: checked ? '#F2D27C' : 'rgba(255, 255, 255, 0.75)' }}
        >
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/5" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
          {count}
        </span>
      )}
    </motion.button>
  );

  const ColorSwatch = ({ color, selected, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative w-8 h-8 rounded-full transition-all shadow-lg"
      style={{
        background: color.hex || '#888',
        boxShadow: selected ? `0 0 0 2px #050608, 0 0 0 4px #D6B25E` : '0 2px 4px rgba(0,0,0,0.2)'
      }}
      title={color.name}
    >
      {selected && (
        <Check
          className="absolute inset-0 m-auto w-4 h-4"
          style={{ color: isLightColor(color.hex) ? '#000' : '#FFF' }}
        />
      )}
    </motion.button>
  );

  const isLightColor = (hex) => {
    if (!hex) return false;
    const c = hex.replace('#', '');
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
  };

  // Extract inner content to reuse
  const FilterContent = () => (
    <div className="flex flex-col h-full space-y-2">
      {/* Categories */}
      <FilterSection title="Kategorien" section="categories">
        <div className="space-y-0.5">
          {categories.map(cat => {
            const count = products.filter(p => p.category_id === cat.id).length;
            return (
              <CheckboxItem
                key={cat.id}
                label={cat.name}
                count={count}
                checked={filters.categories?.includes(cat.id)}
                onChange={() => {
                  const current = filters.categories || [];
                  const updated = current.includes(cat.id)
                    ? current.filter(id => id !== cat.id)
                    : [...current, cat.id];
                  onFiltersChange({ ...filters, categories: updated });
                }}
              />
            );
          })}
        </div>
      </FilterSection>

      {/* Brands */}
      <FilterSection title="Marken" section="brands">
        <div className="space-y-0.5 max-h-56 overflow-y-auto custom-scrollbar pr-2">
          {brands.map(brand => {
            const count = products.filter(p => p.brand_id === brand.id).length;
            return (
              <CheckboxItem
                key={brand.id}
                label={brand.name}
                count={count}
                checked={filters.brands?.includes(brand.id)}
                onChange={() => {
                  const current = filters.brands || [];
                  const updated = current.includes(brand.id)
                    ? current.filter(id => id !== brand.id)
                    : [...current, brand.id];
                  onFiltersChange({ ...filters, brands: updated });
                }}
              />
            );
          })}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Preis" section="price">
        <div className="space-y-6 pt-4 pb-2">
          <Slider
            value={filters.priceRange || [minPrice, maxPrice]}
            min={minPrice}
            max={maxPrice}
            step={5}
            onValueChange={(value) => {
              onFiltersChange({ ...filters, priceRange: value });
            }}
            className="w-full"
          />
          <div className="flex items-center justify-between">
            <div
              className="px-4 py-2 rounded-lg text-sm font-bold shadow-inner"
              style={{ background: 'rgba(0, 0, 0, 0.3)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              {(filters.priceRange?.[0] || minPrice).toFixed(0)}€
            </div>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>—</span>
            <div
              className="px-4 py-2 rounded-lg text-sm font-bold shadow-inner"
              style={{ background: 'rgba(0, 0, 0, 0.3)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              {(filters.priceRange?.[1] || maxPrice).toFixed(0)}€
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Sizes */}
      {allSizes.length > 0 && (
        <FilterSection title="Größen" section="sizes">
          <div className="flex flex-wrap gap-2">
            {allSizes.map(size => {
              const selected = filters.sizes?.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => {
                    const current = filters.sizes || [];
                    const updated = current.includes(size)
                      ? current.filter(s => s !== size)
                      : [...current, size];
                    onFiltersChange({ ...filters, sizes: updated });
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 shadow-sm"
                  style={{
                    background: selected ? 'linear-gradient(135deg, #D6B25E, #F2D27C)' : 'rgba(255, 255, 255, 0.04)',
                    color: selected ? '#0B0D12' : 'rgba(255, 255, 255, 0.75)',
                    border: selected ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: selected ? '0 4px 12px rgba(214, 178, 94, 0.3)' : 'none'
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Colors */}
      {allColors.length > 0 && (
        <FilterSection title="Farben" section="colors">
          <div className="flex flex-wrap gap-3 p-1">
            {allColors.map((color, idx) => (
              <ColorSwatch
                key={idx}
                color={color}
                selected={filters.colors?.includes(color.name)}
                onClick={() => {
                  const current = filters.colors || [];
                  const updated = current.includes(color.name)
                    ? current.filter(c => c !== color.name)
                    : [...current, color.name];
                  onFiltersChange({ ...filters, colors: updated });
                }}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Availability */}
      <FilterSection title="Verfügbarkeit" section="availability">
        <div className="space-y-0.5">
          <CheckboxItem
            label="Nur sofort verfügbar"
            checked={filters.inStock === true}
            onChange={() => {
              onFiltersChange({
                ...filters,
                inStock: filters.inStock === true ? null : true
              });
            }}
          />
        </div>
      </FilterSection>

      {/* Sidebar Footer Actions (Only for sidebar mode if needed, usually auto-applies) */}
      <div className="pt-6 mt-auto">
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full h-10 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'rgba(255,255,255,0.7)'
          }}
        >
          <RotateCcw className="w-3 h-3 mr-2" />
          Filter zurücksetzen
        </Button>
      </div>
    </div>
  );

  if (variant === 'sidebar') {
    return (
      <div className="w-full h-full flex flex-col">
        {/* We rely on parent to render header if needed, but here we can just render content */}
        {/* Actually parent renders header. We just need content. */}
        <FilterContent />
      </div>
    );
  }

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
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 overflow-hidden flex flex-col shadow-2xl"
            style={{
              background: 'rgba(15, 18, 26, 0.98)',
              backdropFilter: 'blur(24px)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5" style={{ color: '#D6B25E' }} />
                <span className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Filter</span>
                {activeFilterCount > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(214, 178, 94, 0.2)', color: '#F2D27C' }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 bg-white/5 hover:bg-white/10"
              >
                <X className="w-5 h-5" style={{ color: '#FFFFFF' }} />
              </button>
            </div>

            {/* Filters Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
              <FilterContent />
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-white/10 bg-black/20">
              <Button
                onClick={onClose}
                className="w-full h-12 rounded-xl font-bold btn-gold shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Ergebnisse anzeigen
              </Button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}