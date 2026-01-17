import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/api';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import PremiumProductCard from '../components/products/PremiumProductCard';
import ProductQuickView from '../components/products/ProductQuickView';
import PremiumProductModal from '../components/products/PremiumProductModal';

import ShopControlStrip from '../components/shop/ShopControlStrip';
import ShopCategoryDrawer from '../components/shop/ShopCategoryDrawer';
import AdvancedFilters from '../components/shop/AdvancedFilters';
import { useI18n } from '../components/i18n/I18nProvider';

export default function Products() {
  const { t } = useI18n();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    categories: [],
    brands: [],
    priceRange: null,
    sizes: [],
    colors: [],
    inStock: null
  });

  useEffect(() => {
    loadData();
    
    // Parse URL params
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');
    const departmentParam = urlParams.get('department');
    
    if (searchParam) setSearchQuery(searchParam);
    if (categoryParam) setSelectedCategory(categoryParam);
    if (departmentParam) setSelectedDepartment(departmentParam);
  }, []);

  const [departments, setDepartments] = useState([]);

  const loadData = async () => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Products.jsx:loadData:start',message:'Loading all shop data',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      
      const [prods, cats, brds, depts] = await Promise.all([
        api.entities.Product.list('-created_at'), // Fixed: was '-created_date', should be '-created_at'
        api.entities.Category.list('sort_order'),
        api.entities.Brand.list('sort_order'),
        api.entities.Department.list('sort_order')
      ]);
      
      // #region agent log
      fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Products.jsx:loadData:loaded',message:'Shop data loaded',data:{productsCount:prods?.length||0,categoriesCount:cats?.length||0,brandsCount:brds?.length||0,departmentsCount:depts?.length||0,productDeptIds:prods?.map(p=>p.department_id)||[]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      
      setProducts(prods);
      setCategories(cats);
      setBrands(brds);
      setDepartments(depts);
    } catch (error) {
      console.error('Error loading data:', error);
      
      // #region agent log
      fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Products.jsx:loadData:error',message:'Error loading shop data',data:{error:error.message,networkError:error.networkError,apiUrl:import.meta.env.VITE_API_URL||'http://localhost:8000/api'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      
      // Show user-friendly error message
      if (error.networkError || error.message?.includes('Verbindung zum Server')) {
        console.error('❌ Backend-Server läuft nicht!');
        console.error('   Bitte starte das Backend mit:');
        console.error('   cd backend && npm run dev');
        console.error('   Oder verwende: .\\start-backend.ps1');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFromDrawer = (categoryId, categoryName) => {
    setSelectedCategory(categoryId);
    // Update URL
    const url = new URL(window.location);
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

  // Count active filters
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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      const matchesSearch = !searchQuery || 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Department filter
      const matchesDepartment = selectedDepartment === 'all' || product.department_id === selectedDepartment;
      
      // Quick category filter (from chips)
      const matchesQuickCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
      
      // Advanced category filter
      const matchesAdvancedCategories = advancedFilters.categories.length === 0 || 
        advancedFilters.categories.includes(product.category_id);
      
      // Brand filter
      const matchesBrand = advancedFilters.brands.length === 0 || 
        advancedFilters.brands.includes(product.brand_id);
      
      // Price filter
      const matchesPrice = !advancedFilters.priceRange || 
        ((product.price || 0) >= advancedFilters.priceRange[0] && 
         (product.price || 0) <= advancedFilters.priceRange[1]);
      
      // Size filter
      const matchesSize = advancedFilters.sizes.length === 0 || 
        (product.sizes || []).some(size => advancedFilters.sizes.includes(size));
      
      // Color filter
      const matchesColor = advancedFilters.colors.length === 0 || 
        (product.colors || []).some(color => advancedFilters.colors.includes(color.name));
      
      // Stock filter
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
        default: return new Date(b.created_at || b.created_date || 0) - new Date(a.created_at || a.created_date || 0);
      }
    });
  }, [products, searchQuery, selectedCategory, selectedDepartment, advancedFilters, sortBy]);

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
    
    // Update URL
    const url = new URL(window.location);
    url.searchParams.delete('department');
    url.searchParams.delete('category');
    url.searchParams.delete('search');
    window.history.pushState({}, '', url);
  };
  
  const handleDepartmentSelect = (departmentId) => {
    setSelectedDepartment(departmentId);
    // Update URL
    const url = new URL(window.location);
    if (departmentId === 'all') {
      url.searchParams.delete('department');
    } else {
      url.searchParams.set('department', departmentId);
    }
    window.history.pushState({}, '', url);
  };

  const handleAddToCart = async (variantData) => {
    try {
      const user = await api.auth.me();
      
      await api.entities.StarCartItem.create({
        user_id: user.id,
        product_id: variantData.product_id,
        quantity: variantData.quantity,
        selected_options: {
          variant_id: variantData.variant_id,
          color_id: variantData.color_id,
          color_name: variantData.color_name,
          color_hex: variantData.color_hex,
          size: variantData.size,
          image: variantData.image,
          price: variantData.price,
          sku: variantData.sku
        }
      });
      
      setIsQuickViewOpen(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Shop Hero */}
      <section className="relative pt-8 pb-10">
        {/* Subtle Background Gradient */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(214, 178, 94, 0.06) 0%, transparent 60%)'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
              style={{
                background: 'rgba(214, 178, 94, 0.1)',
                border: '1px solid rgba(214, 178, 94, 0.3)'
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#D6B25E' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D6B25E' }}>
                {t('misc.premiumDrops')}
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-4"
          >
            <h1 
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight"
              style={{ color: '#FFFFFF' }}
            >
              {t('shop.title')}
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-lg md:text-xl font-medium mb-10"
            style={{ color: 'rgba(255, 255, 255, 0.75)' }}
          >
            {t('misc.discoverPremium')}
          </motion.p>

          {/* Shop Control Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
            />
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} />
                  <div className="h-5 w-3/4 rounded animate-pulse" style={{ background: 'var(--surface)' }} />
                  <div className="h-7 w-1/2 rounded animate-pulse" style={{ background: 'var(--surface)' }} />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(214, 178, 94, 0.1)', border: '1px solid rgba(214, 178, 94, 0.2)' }}
              >
                <Sparkles className="w-10 h-10" style={{ color: '#D6B25E' }} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#FFFFFF' }}>
                {t('shop.noProducts')}
              </h3>
              <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {t('shop.resetFilters')}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PremiumProductCard
                    product={product}
                    onQuickView={(p) => {
                      setQuickViewProduct(p);
                      setIsQuickViewOpen(true);
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category Drawer */}
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

      {/* Premium Product Modal */}
      <PremiumProductModal
        product={quickViewProduct}
        open={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* Advanced Filters Panel */}
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