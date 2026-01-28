import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/api';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { InView } from 'react-intersection-observer';
import PremiumProductCard from '../components/products/PremiumProductCard';
import UnifiedProductModal from '../components/products/UnifiedProductModal';

import ShopControlStrip from '../components/shop/ShopControlStrip';
import ShopCategoryDrawer from '../components/shop/ShopCategoryDrawer';
import AdvancedFilters from '../components/shop/AdvancedFilters';
import ProductGridSkeleton from '../components/products/ProductGridSkeleton';
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

  const [inStock, setInStock] = useState(null);

  // Infinite Scroll State
  const [visibleProducts, setVisibleProducts] = useState(8);

  useEffect(() => {
    // Reset visible count when filters change
    setVisibleProducts(8);
  }, [searchQuery, selectedCategory, selectedDepartment, advancedFilters, sortBy]);

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
      const [prods, cats, brds, depts] = await Promise.all([
        api.entities.Product.list('-created_at'),
        api.entities.Category.list('sort_order'),
        api.entities.Brand.list('sort_order'),
        api.entities.Department.list('sort_order')
      ]);

      setProducts(prods);
      setCategories(cats);
      setBrands(brds);
      setDepartments(depts);
    } catch (error) {
      console.error('Error loading data:', error);

      // Fallback: Show Premium Demo Products
      const demoProducts = [
        {
          id: 'demo-1',
          name: 'Moze Breeze Two - Wavy Black',
          description: 'Die Moze Breeze Two ist die Shisha des Jahres.',
          price: 149.90,
          cover_image: 'https://mozeshisha.de/media/image/product/14987/lg/moze-breeze-two-wavy-blue~2.jpg',
          tags: ['Bestseller', 'Premium'],
          in_stock: true,
          stock: 10,
          sku: 'MOZE-BRZ-BLK',
          department_id: 'shishas',
          min_order_quantity: 1
        },
        {
          id: 'demo-2',
          name: 'Elfbar 600 - Premium Selection',
          description: 'Der Klassiker neu definiert. Wähle deinen Favoriten aus unserer exklusiven Kollektion.',
          price: 7.90,
          cover_image: 'https://dampfdorado.de/media/image/5f/8c/9b/elfbar-600-watermelon.jpg',
          tags: ['Bestseller', 'Configurable'],
          in_stock: true,
          sku: 'ELF-600-VAR',
          department_id: 'vapes',
          min_order_quantity: 1,
          colors: [
            {
              id: 'c1',
              name: 'Watermelon Luxury',
              hex: '#EF5350',
              thumbnail: '/images/products/vape-watermelon.png',
              images: ['/images/products/vape-watermelon.png']
            },
            {
              id: 'c2',
              name: 'Blue Razz Diamond',
              hex: '#42A5F5',
              thumbnail: '/images/products/vape-blue-razz.png',
              images: ['/images/products/vape-blue-razz.png']
            },
            {
              id: 'c3',
              name: 'Grape (Classic)',
              hex: '#AB47BC',
              thumbnail: 'https://dampfdorado.de/media/image/9e/7c/1f/elfbar-600-grape.jpg',
              images: ['https://dampfdorado.de/media/image/9e/7c/1f/elfbar-600-grape.jpg']
            }
          ]
        },
        {
          id: 'demo-3',
          name: 'Nameless - Black Nana',
          description: 'Die Legende unter den Traube-Minze Tabaken.',
          price: 17.90,
          cover_image: '/images/products/tobacco-black-nana.png',
          tags: ['Legendary', 'Bestseller'],
          in_stock: true,
          sku: 'NAM-BLK-NANA',
          department_id: 'shisha-tobacco',
          min_order_quantity: 1,
          colors: [{ id: 't1', name: '200g Dose', hex: '#222', thumbnail: '/images/products/tobacco-black-nana.png' }]
        },
        {
          id: 'demo-4',
          name: 'Vyro Spectre - Carbon Red',
          description: 'Kompakt, innovativ und mit einem einzigartigen Blow-Off System.',
          price: 119.90,
          cover_image: '/images/products/shisha-moze.png',
          tags: ['Innovation', 'Premium'],
          in_stock: true,
          sku: 'VYRO-SPC-RED',
          department_id: 'shishas',
          min_order_quantity: 1,
          colors: [{ id: 's1', name: 'Wavy Black (Resin)', hex: '#000', thumbnail: '/images/products/shisha-moze.png' }]
        },
        {
          id: 'demo-5',
          name: 'OCB Slim Premium Box (50 Stk)',
          description: 'Der Headshop Klassiker im Bulk-Pack.',
          price: 1.20,
          cover_image: 'https://m.media-amazon.com/images/I/71wLpQd0LBL._AC_SL1500_.jpg',
          tags: ['Bulk', 'Deal'],
          in_stock: true,
          sku: 'OCB-BOX',
          min_order_quantity: 50
        },
        {
          id: 'demo-6',
          name: '187 Strassenbande - Hamburg',
          description: 'Ein wilder Beerenmix, der so legendär ist wie die Stadt selbst.',
          price: 9.90,
          cover_image: 'https://files.shisha-world.com/187-Strassenbande-E-Shisha-Hamburg-0004.jpg',
          tags: ['Hype'],
          in_stock: true,
          sku: '187-HH',
          department_id: 'vapes',
          min_order_quantity: 1
        }
      ];
      setProducts(demoProducts);

      // Extract unique departments/categories from demo products as fallback
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

  const handleCategoryFromDrawer = (categoryId, categoryName) => {
    setSelectedCategory(categoryId);
    // Update URL
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
      // Normalize tags to always be an array of strings (supports legacy string/JSON-string)
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

      // Search filter
      const matchesSearch = !searchQuery ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tagsArray.some(tag => (tag || '').toLowerCase().includes(searchQuery.toLowerCase()));

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
    const url = new URL(window.location.href);
    url.searchParams.delete('department');
    url.searchParams.delete('category');
    url.searchParams.delete('search');
    window.history.pushState({}, '', url);
  };

  const handleDepartmentSelect = (departmentId) => {
    setSelectedDepartment(departmentId);
    // Update URL
    const url = new URL(window.location.href);
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
              products={products}
            />
          </motion.div>
        </div>
      </section>

      {/* Main Shop Layout */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col lg:flex-row gap-8">

            {/* Desktop Sidebar Filters */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 p-6 rounded-2xl border border-white/10 bg-[#0F121A]/50 backdrop-blur-xl h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
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
            </div>

            {/* Product Grid Area */}
            <div className="flex-1">
              {loading ? (
                <ProductGridSkeleton count={8} />
              ) : filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 bg-white/5 rounded-3xl border border-white/10"
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
                  <p className="text-base text-zinc-400 max-w-md mx-auto mb-8">
                    Leider keine Ergebnisse für deine Auswahl. Versuche es mit weniger Filtern.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 rounded-xl font-bold bg-[#D6B25E] text-black hover:bg-[#F2D27C] transition-colors"
                  >
                    Filter zurücksetzen
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.slice(0, visibleProducts).map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index % 8 * 0.05 }}
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
                      className="col-span-full py-10 flex justify-center w-full"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-[#D6B25E] border-t-transparent rounded-full animate-spin" />
                      </div>
                    </InView>
                  )}
                </div>
              )}
            </div>
          </div>
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

      {/* Unified Product Modal */}
      <UnifiedProductModal
        product={quickViewProduct}
        open={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
        mode="full"
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