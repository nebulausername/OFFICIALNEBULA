import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Filter, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FilterSidebar({
  departments,
  categories,
  brands,
  filters,
  onFilterChange,
  onClearFilters,
  className = ''
}) {
  const [openSections, setOpenSections] = useState(['departments', 'categories', 'brands', 'price']);

  const toggleSection = (section) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleDepartmentToggle = (deptId) => {
    const current = filters.departments || [];
    const updated = current.includes(deptId)
      ? current.filter(id => id !== deptId)
      : [...current, deptId];
    onFilterChange({ ...filters, departments: updated });
  };

  const handleCategoryToggle = (catId) => {
    const current = filters.categories || [];
    const updated = current.includes(catId)
      ? current.filter(id => id !== catId)
      : [...current, catId];
    onFilterChange({ ...filters, categories: updated });
  };

  const handleBrandToggle = (brandId) => {
    const current = filters.brands || [];
    const updated = current.includes(brandId)
      ? current.filter(id => id !== brandId)
      : [...current, brandId];
    onFilterChange({ ...filters, brands: updated });
  };

  const activeFilterCount = 
    (filters.departments?.length || 0) + 
    (filters.categories?.length || 0) + 
    (filters.brands?.length || 0) + 
    (filters.inStockOnly ? 1 : 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-black">Filter</h3>
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-purple-500/50"
            >
              {activeFilterCount}
            </motion.div>
          )}
        </div>
        {activeFilterCount > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onClearFilters}
            className="text-sm text-purple-400 hover:text-purple-300 font-semibold hover:underline transition-all"
          >
            Zurücksetzen
          </motion.button>
        )}
      </div>

      {/* Departments */}
      {departments.length > 0 && (
        <div className="glass backdrop-blur border border-zinc-800 rounded-xl p-4 hover:border-purple-500/30 transition-all">
          <button
            onClick={() => toggleSection('departments')}
            className="flex items-center justify-between w-full mb-3 group"
          >
            <span className="font-bold text-zinc-200 group-hover:text-purple-400 transition-colors">Departments</span>
            <ChevronDown className={`w-5 h-5 text-zinc-400 transition-all ${openSections.includes('departments') ? 'rotate-180 text-purple-400' : 'group-hover:text-purple-400'}`} />
          </button>
          <AnimatePresence>
            {openSections.includes('departments') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {departments.map((dept, index) => (
                  <motion.label 
                    key={dept.id} 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={(filters.departments || []).includes(dept.id)}
                      onChange={() => handleDepartmentToggle(dept.id)}
                      className="w-5 h-5 rounded border-2 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors flex-1">{dept.name}</span>
                    {(filters.departments || []).includes(dept.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-purple-500 rounded-full"
                      />
                    )}
                  </motion.label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="glass backdrop-blur border border-zinc-800 rounded-xl p-4 hover:border-purple-500/30 transition-all">
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full mb-3 group"
          >
            <span className="font-bold text-zinc-200 group-hover:text-purple-400 transition-colors">Kategorien</span>
            <ChevronDown className={`w-5 h-5 text-zinc-400 transition-all ${openSections.includes('categories') ? 'rotate-180 text-purple-400' : 'group-hover:text-purple-400'}`} />
          </button>
          <AnimatePresence>
            {openSections.includes('categories') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {categories.map((cat, index) => (
                  <motion.label 
                    key={cat.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={(filters.categories || []).includes(cat.id)}
                      onChange={() => handleCategoryToggle(cat.id)}
                      className="w-5 h-5 rounded border-2 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors flex-1">{cat.name}</span>
                    {(filters.categories || []).includes(cat.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-purple-500 rounded-full"
                      />
                    )}
                  </motion.label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <div className="glass backdrop-blur border border-zinc-800 rounded-xl p-4 hover:border-purple-500/30 transition-all">
          <button
            onClick={() => toggleSection('brands')}
            className="flex items-center justify-between w-full mb-3 group"
          >
            <span className="font-bold text-zinc-200 group-hover:text-purple-400 transition-colors">Marken</span>
            <ChevronDown className={`w-5 h-5 text-zinc-400 transition-all ${openSections.includes('brands') ? 'rotate-180 text-purple-400' : 'group-hover:text-purple-400'}`} />
          </button>
          <AnimatePresence>
            {openSections.includes('brands') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {brands.map((brand, index) => (
                  <motion.label 
                    key={brand.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={(filters.brands || []).includes(brand.id)}
                      onChange={() => handleBrandToggle(brand.id)}
                      className="w-5 h-5 rounded border-2 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors flex-1">{brand.name}</span>
                    {(filters.brands || []).includes(brand.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-purple-500 rounded-full"
                      />
                    )}
                  </motion.label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Price Range */}
      <div className="glass backdrop-blur border border-zinc-800 rounded-xl p-4 hover:border-purple-500/30 transition-all">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3 group"
        >
          <span className="font-bold text-zinc-200 group-hover:text-purple-400 transition-colors">Preis</span>
          <ChevronDown className={`w-5 h-5 text-zinc-400 transition-all ${openSections.includes('price') ? 'rotate-180 text-purple-400' : 'group-hover:text-purple-400'}`} />
        </button>
        <AnimatePresence>
          {openSections.includes('price') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <Slider
                value={filters.priceRange || [0, 1000]}
                onValueChange={(value) => onFilterChange({ ...filters, priceRange: value })}
                max={1000}
                step={10}
                className="w-full"
              />
              <div className="flex items-center justify-between gap-3">
                <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg">
                  <span className="text-sm font-bold text-purple-400">{(filters.priceRange || [0, 1000])[0]}€</span>
                </div>
                <div className="text-zinc-600">—</div>
                <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg">
                  <span className="text-sm font-bold text-purple-400">{(filters.priceRange || [0, 1000])[1]}€</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* In Stock Only */}
      <motion.label 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-between p-4 glass backdrop-blur border border-zinc-800 rounded-xl hover:border-green-500/30 cursor-pointer transition-all group"
      >
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={filters.inStockOnly || false}
            onChange={(e) => onFilterChange({ ...filters, inStockOnly: e.target.checked })}
            className="w-5 h-5 rounded border-2 border-zinc-700 text-green-500 focus:ring-2 focus:ring-green-500 cursor-pointer"
          />
          <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">Nur verfügbare Artikel</span>
        </div>
        {filters.inStockOnly && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
          />
        )}
      </motion.label>
    </div>
  );
}