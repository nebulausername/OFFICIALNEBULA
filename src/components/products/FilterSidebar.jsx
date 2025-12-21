import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, SlidersHorizontal } from 'lucide-react';

export default function FilterSidebar({
  departments,
  categories,
  brands,
  filters,
  onFilterChange,
  onClearFilters,
  className = ''
}) {
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

  const handlePriceChange = (values) => {
    onFilterChange({ ...filters, priceRange: values });
  };

  const handleStockToggle = () => {
    onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly });
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold">Filter</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-zinc-400 hover:text-white"
        >
          Zurücksetzen
        </Button>
      </div>

      {/* Departments */}
      {departments.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider">Department</h4>
          {departments.map((dept) => (
            <div key={dept.id} className="flex items-center space-x-2">
              <Checkbox
                id={`dept-${dept.id}`}
                checked={(filters.departments || []).includes(dept.id)}
                onCheckedChange={() => handleDepartmentToggle(dept.id)}
              />
              <Label
                htmlFor={`dept-${dept.id}`}
                className="text-sm cursor-pointer hover:text-white transition-colors"
              >
                {dept.name}
              </Label>
            </div>
          ))}
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider">Kategorien</h4>
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={(filters.categories || []).includes(cat.id)}
                onCheckedChange={() => handleCategoryToggle(cat.id)}
              />
              <Label
                htmlFor={`cat-${cat.id}`}
                className="text-sm cursor-pointer hover:text-white transition-colors"
              >
                {cat.name}
              </Label>
            </div>
          ))}
        </div>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider">Marken</h4>
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={(filters.brands || []).includes(brand.id)}
                onCheckedChange={() => handleBrandToggle(brand.id)}
              />
              <Label
                htmlFor={`brand-${brand.id}`}
                className="text-sm cursor-pointer hover:text-white transition-colors"
              >
                {brand.name}
              </Label>
            </div>
          ))}
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider">Preis</h4>
        <div className="px-2">
          <Slider
            min={0}
            max={1000}
            step={10}
            value={filters.priceRange || [0, 1000]}
            onValueChange={handlePriceChange}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>{(filters.priceRange || [0, 1000])[0]}€</span>
            <span>{(filters.priceRange || [0, 1000])[1]}€</span>
          </div>
        </div>
      </div>

      {/* Stock Filter */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStockOnly || false}
            onCheckedChange={handleStockToggle}
          />
          <Label htmlFor="in-stock" className="text-sm cursor-pointer hover:text-white transition-colors">
            Nur verfügbare Artikel
          </Label>
        </div>
      </div>
    </div>
  );
}