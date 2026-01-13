import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, X, Sparkles, Grid3x3, List, TrendingUp, Clock, DollarSign, ArrowUpCircle, LayoutGrid, ChevronRight } from 'lucide-react';
import FilterSidebar from '../components/products/FilterSidebar';
import PremiumProductCard from '../components/products/PremiumProductCard';
import ProductQuickView from '../components/products/ProductQuickView';
import ProductRequestModal from '../components/products/ProductRequestModal';
import EmptyStateModal from '../components/products/EmptyStateModal';
import ShopCategoriesDrawer from '../components/drawer/ShopCategoriesDrawer';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    departments: [],
    categories: [],
    brands: [],
    priceRange: [0, 1000],
    inStockOnly: false
  });
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [requestProduct, setRequestProduct] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isEmptyStateModalOpen, setIsEmptyStateModalOpen] = useState(false);
  const [isCategoriesDrawerOpen, setIsCategoriesDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters, searchQuery, sortBy]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadInitialData = async () => {
    try {
      const [depts, cats, brds] = await Promise.all([
        base44.entities.Department.list('sort_order'),
        base44.entities.Category.list('sort_order'),
        base44.entities.Brand.list('sort_order')
      ]);
      setDepartments(depts);
      setCategories(cats);
      setBrands(brds);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      let allProducts = await base44.entities.Product.list('-created_date', 100);

      let filtered = allProducts;

      if (filters.departments.length > 0) {
        filtered = filtered.filter(p => filters.departments.includes(p.department_id));
      }
      if (filters.categories.length > 0) {
        filtered = filtered.filter(p => filters.categories.includes(p.category_id));
      }
      if (filters.brands.length > 0) {
        filtered = filtered.filter(p => filters.brands.includes(p.brand_id));
      }
      filtered = filtered.filter(p => 
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
      );
      if (filters.inStockOnly) {
        filtered = filtered.filter(p => p.in_stock);
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.name?.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      }

      if (sortBy === 'newest') {
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      } else if (sortBy === 'price_low') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_high') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'popular') {
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
      }

      setProducts(filtered);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Fehler',
        description: 'Produkte konnten nicht geladen werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleRequestProduct = (product) => {
    setRequestProduct(product);
    setIsRequestModalOpen(true);
  };

  const handleAddToCart = async (product, quantity = 1, selectedOptions = {}) => {
    try {
      const user = await base44.auth.me();
      
      const existing = await base44.entities.StarCartItem.filter({
        user_id: user.id,
        product_id: product.id
      });

      if (existing.length > 0) {
        await base44.entities.StarCartItem.update(existing[0].id, {
          quantity: existing[0].quantity + quantity,
          selected_options: selectedOptions
        });
      } else {
        await base44.entities.StarCartItem.create({
          user_id: user.id,
          product_id: product.id,
          quantity: quantity,
          selected_options: selectedOptions
        });
      }

      toast({
        title: 'Zum Warenkorb hinzugefügt',
        description: product.name
      });

      window.location.reload();
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Fehler',
        description: 'Produkt konnte nicht hinzugefügt werden',
        variant: 'destructive'
      });
    }
  };

  const handleClearFilters = () => {
    setFilters({
      departments: [],
      categories: [],
      brands: [],
      priceRange: [0, 1000],
      inStockOnly: false
    });
    setSearchQuery('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickFilterChips = [
    { label: 'Alle', value: 'all' },
    { label: 'Sneaker', value: 'sneaker' },
    { label: 'Kleidung', value: 'clothing' },
    { label: 'Accessoires', value: 'accessories' },
    { label: 'Taschen', value: 'bags' },
    { label: 'Neu', value: 'new' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Neueste', icon: Clock },
    { value: 'price_low', label: 'Preis ↑', icon: DollarSign },
    { value: 'price_high', label: 'Preis ↓', icon: DollarSign },
    { value: 'popular', label: 'Beliebt', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-3" 
            style={{ color: 'var(--text)' }}>
            Shop
          </h1>
          <p className="text-lg md:text-xl font-medium" style={{ color: 'var(--text-secondary)' }}>
            Entdecke unsere Premium-Auswahl
          </p>
        </motion.div>

        {/* Search & Categories Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--muted)' }} />
              <Input
                type="text"
                placeholder="Suche nach Produkt, Marke, ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-12 h-14 text-base font-medium rounded-xl"
                style={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'var(--surface)', color: 'var(--text)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Categories Button */}
            <Button
              onClick={() => setIsCategoriesDrawerOpen(true)}
              className="h-14 px-6 rounded-xl font-bold text-base gap-3"
              style={{
                background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
                color: '#0B0D12',
                boxShadow: '0 4px 20px rgba(214, 178, 94, 0.3)'
              }}
            >
              <LayoutGrid className="w-5 h-5" />
              Kategorien
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Filter Chips */}
          <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {quickFilterChips.map((chip) => (
              <button
                key={chip.value}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: chip.value === 'all' ? 'rgba(214, 178, 94, 0.15)' : 'var(--surface)',
                  border: chip.value === 'all' ? '1px solid var(--gold)' : '1px solid var(--border)',
                  color: chip.value === 'all' ? 'var(--gold)' : 'var(--text-secondary)'
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 rounded-2xl p-6"
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)'
              }}
            >
              <FilterSidebar
                departments={departments}
                categories={categories}
                brands={brands}
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={handleClearFilters}
              />
            </motion.div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full h-14 rounded-xl text-base font-bold gap-2"
                    style={{
                      background: 'var(--bg2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)'
                    }}
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    Filter & Sortierung
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Filter</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar
                      departments={departments}
                      categories={categories}
                      brands={brands}
                      filters={filters}
                      onFilterChange={setFilters}
                      onClearFilters={handleClearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Results Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-2xl p-5"
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)'
              }}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Results Count */}
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--gold)', boxShadow: '0 0 12px var(--gold)' }} />
                  <p className="font-bold text-base" style={{ color: 'var(--text)' }}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        Laden...
                      </span>
                    ) : (
                      <>
                        <span className="text-2xl font-black" style={{ color: 'var(--gold)' }}>
                          {products.length}
                        </span>
                        <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>
                          {products.length === 1 ? 'Produkt' : 'Produkte'} gefunden
                        </span>
                      </>
                    )}
                  </p>
                </div>

                {/* Controls */}
                {!loading && products.length > 0 && (
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--surface)' }}>
                      <button
                        onClick={() => setViewMode('grid')}
                        className="p-2 rounded-lg transition-all"
                        style={{
                          background: viewMode === 'grid' ? 'var(--gold)' : 'transparent',
                          color: viewMode === 'grid' ? '#0B0D12' : 'var(--muted)'
                        }}
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className="p-2 rounded-lg transition-all"
                        style={{
                          background: viewMode === 'list' ? 'var(--gold)' : 'transparent',
                          color: viewMode === 'list' ? '#0B0D12' : 'var(--muted)'
                        }}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sort Options */}
                    <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--surface)' }}>
                      {sortOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => setSortBy(option.value)}
                            className="px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5"
                            style={{
                              background: sortBy === option.value ? 'var(--gold)' : 'transparent',
                              color: sortBy === option.value ? '#0B0D12' : 'var(--muted)'
                            }}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Filters */}
              {!loading && (filters.departments.length > 0 || filters.categories.length > 0 || filters.brands.length > 0 || filters.inStockOnly) && (
                <div className="mt-4 pt-4 flex flex-wrap gap-2 items-center" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Aktive Filter:</span>
                  {filters.departments.length > 0 && (
                    <Badge style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                      {filters.departments.length} Dept.
                    </Badge>
                  )}
                  {filters.categories.length > 0 && (
                    <Badge style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#F472B6', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                      {filters.categories.length} Kat.
                    </Badge>
                  )}
                  {filters.brands.length > 0 && (
                    <Badge style={{ background: 'rgba(214, 178, 94, 0.2)', color: 'var(--gold)', border: '1px solid rgba(214, 178, 94, 0.3)' }}>
                      {filters.brands.length} Marken
                    </Badge>
                  )}
                  {filters.inStockOnly && (
                    <Badge style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ADE80', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                      Nur Lagerware
                    </Badge>
                  )}
                  <button
                    onClick={handleClearFilters}
                    className="text-xs font-medium underline ml-2"
                    style={{ color: 'var(--muted)' }}
                  >
                    Alle löschen
                  </button>
                </div>
              )}
            </motion.div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 mx-auto mb-8 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface)' }}>
                  <span className="text-5xl">📦</span>
                </div>
                <h3 className="text-3xl font-black mb-4" style={{ color: 'var(--text)' }}>Nichts gefunden</h3>
                <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                  {searchQuery 
                    ? `Keine Treffer für "${searchQuery}". Willst du es anfragen?`
                    : 'Versuche es mit anderen Filtereinstellungen'}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button onClick={handleClearFilters} variant="outline" className="h-12 px-8 font-bold">
                    Filter zurücksetzen
                  </Button>
                  {searchQuery && (
                    <Button 
                      onClick={() => setIsEmptyStateModalOpen(true)}
                      className="h-12 px-8 font-bold"
                      style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold2))', color: '#0B0D12' }}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Produkt anfragen
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PremiumProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      onQuickView={handleQuickView}
                      onRequestProduct={handleRequestProduct}
                      viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Modals */}
        <ProductQuickView
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          onAddToCart={handleAddToCart}
        />
        <ProductRequestModal
          product={requestProduct}
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
        />
        <EmptyStateModal
          isOpen={isEmptyStateModalOpen}
          onClose={() => setIsEmptyStateModalOpen(false)}
          searchQuery={searchQuery}
        />
        <ShopCategoriesDrawer
          isOpen={isCategoriesDrawerOpen}
          onClose={() => setIsCategoriesDrawerOpen(false)}
          departments={departments}
          categories={categories}
        />

        {/* Scroll to Top */}
        {showScrollTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center z-50"
            style={{
              background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
              color: '#0B0D12',
              boxShadow: '0 8px 24px rgba(214, 178, 94, 0.4)'
            }}
          >
            <ArrowUpCircle className="w-6 h-6" />
          </motion.button>
        )}
      </div>
    </div>
  );
}