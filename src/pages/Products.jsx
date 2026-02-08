import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/api';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, PackageX } from 'lucide-react';
import { InView } from 'react-intersection-observer';
import AntigravityProductCard from '../components/antigravity/AntigravityProductCard';
import SEO from '@/components/seo/SEO';
import CosmicHeroBackground from '../components/home/CosmicHeroBackground';

import ShopControlStrip from '../components/shop/ShopControlStrip';
import ShopCategoryDrawer from '../components/shop/ShopCategoryDrawer';
import AdvancedFilters from '../components/shop/AdvancedFilters';
import ProductGridSkeleton from '../components/products/ProductGridSkeleton';
import UnifiedProductModal from '../components/products/UnifiedProductModal';
import { useI18n } from '../components/i18n/I18nProvider';
import { products as staticProducts } from '../data/products';
import { useToast } from '@/components/ui/use-toast';

export default function Products() {
  const { t } = useI18n();
  const { toast } = useToast();
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
  const [visibleProducts, setVisibleProducts] = useState(12);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Grid View State
  const [viewMode, setViewMode] = useState(4); // 2, 3, or 4

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
    const sortParam = urlParams.get('sort');

    if (searchParam) setSearchQuery(searchParam);
    if (categoryParam) setSelectedCategory(categoryParam);
    if (departmentParam) setSelectedDepartment(departmentParam);
    if (sortParam) setSortBy(sortParam);
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
    setVisibleProducts(12);
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
        case 'delivery': return (a.lead_time_days || 3) - (b.lead_time_days || 3); // Schnellste Lieferung zuerst
        case 'popular': return 0; // Needs popularity metric
        default: return new Date(b.created_at || b.created_date || 0).getTime() - new Date(a.created_at || a.created_date || 0).getTime();
      }
    });
  }, [products, searchQuery, selectedCategory, selectedDepartment, advancedFilters, sortBy]);

  const handleAddToCart = async (product, quantity = 1, selectedOptions = {}) => {
    try {
      const user = await api.auth.me();
      if (!user) return; // Should likely redirect to login or show toast

      const existing = await api.entities.StarCartItem.filter({
        user_id: user.id,
        product_id: product.id
      });

      if (existing.length > 0) {
        await api.entities.StarCartItem.update(existing[0].id, {
          quantity: existing[0].quantity + quantity,
          selected_options: selectedOptions
        });
      } else {
        await api.entities.StarCartItem.create({
          user_id: user.id,
          product_id: product.id,
          quantity: quantity,
          selected_options: selectedOptions
        });
      }
      setIsQuickViewOpen(false);
      toast({
        title: 'Hinzugefügt! 🛒',
        description: `${quantity}x ${product.name} im Warenkorb.`,
        className: "bg-gold/10 border-gold/30 text-white"
      });
      window.location.reload(); // Simple reload for now
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({ title: 'Fehler', description: 'Produkt konnte nicht hinzugefügt werden', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] font-sans selection:bg-gold/30">
      <SEO
        title="Produkte"
        description="Entdecke unsere Premium Shisha, Vapes und Zubehör Auswahl."
        image="/images/hero-logo.png"
        url={window.location.href}
      />

      {/* Background Ambience */}
      <CosmicHeroBackground />
      <div className="fixed inset-0 bg-gradient-radial from-transparent via-black/40 to-black/90 pointer-events-none z-0" />

      {/* Shop Hero - Condensed & Modern */}
      <section className="relative pt-32 pb-8 z-10">
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
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
                  className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none"
                >
                  SHOP
                </motion.h1>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl p-2 border-white/5 bg-black/40 backdrop-blur-xl sticky top-24 z-30 transition-all duration-300 shadow-2xl shadow-black/50"
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
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </motion.div>
        </div>
      </section>

      {/* Main Shop Layout */}
      <section className="pb-24 relative z-10">
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
                <div className="glass-panel rounded-2xl p-6 h-full overflow-hidden flex flex-col border-white/5 bg-black/20 backdrop-blur-md">
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
                  className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center justify-center min-h-[500px] border-white/5 bg-black/20"
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
                <div className={`grid gap-4 md:gap-6 ${viewMode === 2 ? 'grid-cols-2' :
                    viewMode === 3 ? 'grid-cols-2 md:grid-cols-3' :
                      'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                  }`}>
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
                        <AntigravityProductCard
                          product={product}
                          onQuickView={(p) => { setQuickViewProduct(p); setIsQuickViewOpen(true); }}
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
                            setVisibleProducts(prev => prev + 12);
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

      {/* --- MODALS --- */}
      <UnifiedProductModal
        product={quickViewProduct}
        open={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
        mode="quick"
      />
    </div>
  );
}
