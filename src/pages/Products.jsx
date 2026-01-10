import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, X, Package, Sparkles } from 'lucide-react';
import FilterSidebar from '../components/products/FilterSidebar';
import PremiumProductCard from '../components/products/PremiumProductCard';
import ProductQuickView from '../components/products/ProductQuickView';
import ProductRequestModal from '../components/products/ProductRequestModal';
import EmptyStateModal from '../components/products/EmptyStateModal';
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
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters, searchQuery]);

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

      // Apply filters
      let filtered = allProducts;

      // Department filter
      if (filters.departments.length > 0) {
        filtered = filtered.filter(p => filters.departments.includes(p.department_id));
      }

      // Category filter
      if (filters.categories.length > 0) {
        filtered = filtered.filter(p => filters.categories.includes(p.category_id));
      }

      // Brand filter
      if (filters.brands.length > 0) {
        filtered = filtered.filter(p => filters.brands.includes(p.brand_id));
      }

      // Price filter
      filtered = filtered.filter(p => 
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
      );

      // Stock filter
      if (filters.inStockOnly) {
        filtered = filtered.filter(p => p.in_stock);
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.name?.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
        );
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
      
      // Check if item already in cart
      const existing = await base44.entities.StarCartItem.filter({
        user_id: user.id,
        product_id: product.id
      });

      if (existing.length > 0) {
        // Update quantity
        await base44.entities.StarCartItem.update(existing[0].id, {
          quantity: existing[0].quantity + quantity,
          selected_options: selectedOptions
        });
      } else {
        // Create new cart item
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

      // Reload page to update cart count
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center relative"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        />
        <h1 className="text-6xl md:text-7xl font-black mb-3 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent relative">
          Shop
        </h1>
        <p className="text-zinc-300 text-lg md:text-xl font-medium">Entdecke unsere Premium-Auswahl</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10 max-w-4xl mx-auto"
      >
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative flex items-center">
            <Search className="absolute left-6 w-6 h-6 text-zinc-500 group-focus-within:text-purple-400 transition-colors z-10" />
            <Input
              type="text"
              placeholder="Suchbegriff, Produkt-ID oder Marke… wir finden's für dich ✨"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-24 h-16 glass backdrop-blur-xl border-2 border-zinc-800/50 text-white text-base md:text-lg rounded-2xl group-focus-within:border-purple-500/50 transition-all shadow-xl placeholder:text-zinc-500 font-medium"
            />
            {searchQuery ? (
              <motion.button
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-4 w-10 h-10 bg-zinc-800/80 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              >
                <X className="w-5 h-5 text-zinc-300" />
              </motion.button>
            ) : (
              <div className="absolute right-6 hidden md:flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500 font-mono">
                  ⌘K
                </Badge>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-24 glass backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-2xl"
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
                <Button variant="outline" className="w-full h-14 glass backdrop-blur-xl border-zinc-800 hover:border-purple-500/50 transition-all rounded-xl text-lg font-bold">
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filter & Sortierung
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="glass backdrop-blur-xl border-zinc-800 w-80">
                <SheetHeader>
                  <SheetTitle className="text-2xl font-bold">Filter</SheetTitle>
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

          {/* Results Count & Sort */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2.5 h-2.5 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50"
              />
              <p className="text-white font-bold text-base">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Laden...
                  </span>
                ) : (
                  <>
                    <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {products.length}
                    </span>
                    <span className="text-zinc-300 ml-2">
                      {products.length === 1 ? 'Produkt' : 'Produkte'} gefunden
                    </span>
                  </>
                )}
              </p>
            </div>
            {!loading && products.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-zinc-400 font-medium">Sortiert nach:</span>
                <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 font-bold">
                  Neueste zuerst
                </Badge>
              </div>
            )}
          </motion.div>

          {/* Products Grid */}
          {/* Quick View Modal */}
          <ProductQuickView
            product={quickViewProduct}
            isOpen={isQuickViewOpen}
            onClose={() => setIsQuickViewOpen(false)}
            onAddToCart={handleAddToCart}
          />

          {/* Product Request Modal */}
          <ProductRequestModal
            product={requestProduct}
            isOpen={isRequestModalOpen}
            onClose={() => setIsRequestModalOpen(false)}
          />

          {/* Empty State Modal */}
          <EmptyStateModal
            isOpen={isEmptyStateModalOpen}
            onClose={() => setIsEmptyStateModalOpen(false)}
            searchQuery={searchQuery}
          />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="h-96 skeleton rounded-2xl"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl border-2 border-zinc-700/50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
              >
                <Package className="w-16 h-16 text-zinc-600" />
              </motion.div>
              <h3 className="text-3xl font-black text-white mb-4">Nichts gefunden 😕</h3>
              <p className="text-zinc-400 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                {searchQuery 
                  ? `Keine Treffer für "${searchQuery}". Willst du es anfragen?`
                  : 'Versuche es mit anderen Filtereinstellungen'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  onClick={handleClearFilters} 
                  variant="outline"
                  className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 h-12 px-8 font-bold text-white"
                >
                  Filter zurücksetzen
                </Button>
                {searchQuery && (
                  <Button 
                    onClick={() => setIsEmptyStateModalOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-transform h-12 px-8 font-bold shadow-xl shadow-purple-500/30"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Produkt anfragen
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}