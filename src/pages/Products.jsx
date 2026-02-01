import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/api';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, PackageX } from 'lucide-react';
import { InView } from 'react-intersection-observer';
import PremiumProductCard from '../components/products/PremiumProductCard';
import SEO from '@/components/seo/SEO';

import ShopControlStrip from '../components/shop/ShopControlStrip';
import ShopCategoryDrawer from '../components/shop/ShopCategoryDrawer';
import AdvancedFilters from '../components/shop/AdvancedFilters';
import ProductGridSkeleton from '../components/products/ProductGridSkeleton';
import { useI18n } from '../components/i18n/I18nProvider';
import { products as staticProducts } from '../data/products';

export default function Products() {
  const { t } = useI18n();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const [sortBy, setSortBy] = useState('newest');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    categories: [],
    brands: [],
    priceRange: null,
    sizes: [],
    colors: [],
    inStock: null
  });

  // Infinite Scroll State
  const [visibleProducts, setVisibleProducts] = useState(8);

  const loadData = async () => {
    try {
      const [prods, cats, brds, depts] = await Promise.all([
        api.entities.Product.list('-created_at'),
        api.entities.Category.list('sort_order'),
        api.entities.Brand.list('sort_order'),
        api.entities.Department.list('sort_order')
      ]);

      if (prods && prods.length > 0) {
        setProducts(prods);
      } else {
        setProducts(staticProducts);
      }

      setCategories(cats);
      setBrands(brds);
      setDepartments(depts);
    } catch (error) {
      console.error('Error loading data:', error);
      setProducts(staticProducts);
      if (departments.length === 0) {
        setDepartments([
          { id: 'vapes', name: 'Vapes', slug: 'vapes' },
          { id: 'shishas', name: 'Shishas', slug: 'shishas' },
          { id: 'tabak', name: 'Tabak', slug: 'tabak' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');
    const departmentParam = urlParams.get('department');

    if (searchParam) setSearchQuery(searchParam);
    if (categoryParam) setSelectedCategory(categoryParam);
    if (departmentParam) setSelectedDepartment(departmentParam);
  }, []);

  // Calculate price range for slider
  const priceRange = useMemo(() => {
    const prices = products.map(p => p.price || 0).filter(p => p > 0);
    return {
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 1000)
    };
  }, [products]);

  // Initialize price range filter
  useEffect(() => {
    if (products.length > 0 && !advancedFilters.priceRange) {
      setAdvancedFilters(prev => ({
        ...prev,
        priceRange: [priceRange.min, priceRange.max]
      }));
    }
  }, [products, priceRange]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleProducts(8);
  }, [searchQuery, selectedCategory, selectedDepartment, advancedFilters, sortBy]);

  const handleCategoryFromDrawer = (categoryId, categoryName) => {
    setSelectedCategory(categoryId);
    const url = new URL(window.location.href);
    if (categoryId === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', categoryId);
    }
    window.history.pushState({}, '', url);
  };

  const handleBrandFromDrawer = (brandId) => {
    setAdvancedFilters(prev => ({
      ...prev,
      brands: [brandId]
    }));
  };

  const handleDepartmentSelect = (departmentId) => {
    setSelectedDepartment(departmentId);
    const url = new URL(window.location.href);
    if (departmentId === 'all') {
      url.searchParams.delete('department');
    } else {
      url.searchParams.set('department', departmentId);
    }
    window.history.pushState({}, '', url);
  };

  const resetFilters = () => {
    setAdvancedFilters({
      categories: [],
      brands: [],
      priceRange: [priceRange.min, priceRange.max],
      sizes: [],
      colors: [],
      inStock: null
    });
    setSelectedCategory('all');
    setSelectedDepartment('all');
    setSearchQuery('');

    const url = new URL(window.location.href);
    url.searchParams.delete('department');
    url.searchParams.delete('category');
    url.searchParams.delete('search');
    window.history.pushState({}, '', url);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.categories?.length > 0) count++;
    if (advancedFilters.brands?.length > 0) count++;
    if (advancedFilters.priceRange &&
      (advancedFilters.priceRange[0] > priceRange.min ||
        advancedFilters.priceRange[1] < priceRange.max)) count++;
    if (advancedFilters.sizes?.length > 0) count++;
    if (advancedFilters.colors?.length > 0) count++;
    if (advancedFilters.inStock !== null) count++;
    return count;
  }, [advancedFilters, priceRange]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const tagsArray = (() => {
        const raw = product.tags;
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string') {
          try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      })();

      const matchesSearch = !searchQuery ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tagsArray.some(tag => (tag || '').toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDepartment = selectedDepartment === 'all' || product.department_id === selectedDepartment;
      const matchesQuickCategory = selectedCategory === 'all' || product.category_id === selectedCategory;

      const matchesAdvancedCategories = advancedFilters.categories.length === 0 ||
        advancedFilters.categories.includes(product.category_id);

      const matchesBrand = advancedFilters.brands.length === 0 ||
        advancedFilters.brands.includes(product.brand_id);

      const matchesPrice = !advancedFilters.priceRange ||
        ((product.price || 0) >= advancedFilters.priceRange[0] &&
          (product.price || 0) <= advancedFilters.priceRange[1]);

      const matchesSize = advancedFilters.sizes.length === 0 ||
        (product.sizes || []).some(size => advancedFilters.sizes.includes(size));

      const matchesColor = advancedFilters.colors.length === 0 ||
        (product.colors || []).some(color => advancedFilters.colors.includes(color.name));

      const matchesStock = advancedFilters.inStock === null ||
        product.in_stock === advancedFilters.inStock;

      return matchesSearch && matchesDepartment && matchesQuickCategory && matchesAdvancedCategories &&
        matchesBrand && matchesPrice && matchesSize && matchesColor && matchesStock;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return (a.price || 0) - (b.price || 0);
        case 'price_desc': return (b.price || 0) - (a.price || 0);
        case 'name_asc': return (a.name || '').localeCompare(b.name || '');
        case 'name_desc': return (b.name || '').localeCompare(a.name || '');
        case 'popular': return 0;
        default: return new Date(b.created_at || b.created_date || 0).getTime() - new Date(a.created_at || a.created_date || 0).getTime();
      }
    });
  }, [products, searchQuery, selectedCategory, selectedDepartment, advancedFilters, sortBy]);

  return (
    <div className="min-h-screen bg-[#050608]">
      <SEO
        title="Produkte"
        description="Entdecke unsere Premium Shisha, Vapes und Zubehör Auswahl."
        image="/images/hero-logo.png"
        url={window.location.href}
      />
      {/* Shop Hero - Condensed & Modern */}
      <section className="relative pt-32 pb-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]" />
          <div className="absolute top-20 left-20 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-2"
              >
                <span className="w-10 h-0.5 bg-gradient-to-r from-gold to-transparent" />
                <span className="text-gold font-bold text-xs uppercase tracking-widest">Premium Selection</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl font-black text-white tracking-tight"
              >
                {t('shop.title')}
              </motion.h1>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl p-2"
          >
            <ShopControlStrip
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onCategoriesClick={() => setMegaMenuOpen(true)}
              onFiltersClick={() => setFiltersOpen(true)}
              activeFilters={activeFilterCount}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              departments={departments}
              selectedDepartment={selectedDepartment}
              onDepartmentSelect={handleDepartmentSelect}
              sortBy={sortBy}
              onSortChange={setSortBy}
              productCount={filteredProducts.length}
              products={products}
            />
          </motion.div>
        </div>
      </section>

      {/* Main Shop Layout */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sticky Glass Sidebar */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="sticky top-28 h-[calc(100vh-9rem)]"
              >
                <div className="glass-panel rounded-2xl p-6 h-full overflow-hidden flex flex-col border-gold/10">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                    <SlidersHorizontal className="w-5 h-5 text-gold" />
                    <h3 className="font-bold text-lg text-white">Filter</h3>
                  </div>

                  <AdvancedFilters
                    variant="sidebar"
                    isOpen={true} // Always open as sidebar
                    onClose={() => { }}
                    categories={categories}
                    brands={brands}
                    products={products}
                    filters={advancedFilters}
                    onFiltersChange={setAdvancedFilters}
                    onReset={resetFilters}
                  />
                </div>
              </motion.div>
            </div>

            {/* Product Grid Area */}
            <div className="flex-1 min-h-[600px]">
              {loading ? (
                <ProductGridSkeleton count={8} />
              ) : filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center justify-center min-h-[500px]"
                >
                  <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center">
                    <PackageX className="w-12 h-12 text-zinc-600" />
                  </div>
                  <h3 className="text-3xl font-black mb-4 text-white">Keine Treffer</h3>
                  <p className="text-lg text-zinc-400 max-w-md mx-auto mb-8">
                    Leider keine Ergebnisse für deine Auswahl. Versuche es mit weniger Filtern oder einer anderen Kategorie.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-8 py-4 rounded-xl font-bold bg-[#D6B25E] text-black hover:bg-[#F2D27C] transition-colors shadow-lg shadow-gold/10"
                  >
                    Alle Filter zurücksetzen
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.slice(0, visibleProducts).map((product, index) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                      >
                        <PremiumProductCard
                          product={product}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Infinite Scroll Trigger */}
                  {visibleProducts < filteredProducts.length && (
                    <InView
                      as="div"
                      onChange={(inView) => {
                        if (inView) {
                          setTimeout(() => {
                            setVisibleProducts(prev => prev + 8);
                          }, 300);
                        }
                      }}
                      className="col-span-full py-12 flex justify-center w-full"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 border-4 border-gold/20 rounded-full" />
                          <div className="absolute inset-0 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                        </div>
                      </div>
                    </InView>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ShopCategoryDrawer
        isOpen={megaMenuOpen}
        onClose={() => setMegaMenuOpen(false)}
        categories={categories}
        brands={brands}
        departments={departments}
        onSelectCategory={handleCategoryFromDrawer}
        onSelectBrand={handleBrandFromDrawer}
        selectedCategory={selectedCategory}
      />

      <AdvancedFilters
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        categories={categories}
        brands={brands}
        products={products}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        onReset={resetFilters}
      />
    </div>
  );
}