import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import FilterSidebar from '../components/products/FilterSidebar';
import ProductCard from '../components/products/ProductCard';
import ProductQuickView from '../components/products/ProductQuickView';
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
        className="mb-12 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
          Shop
        </h1>
        <p className="text-zinc-400 text-xl">Entdecke unsere Premium-Auswahl</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 max-w-3xl mx-auto"
      >
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-zinc-400 group-focus-within:text-purple-400 transition-colors" />
          <Input
            type="text"
            placeholder="Suche nach Produkten, Marken, Kategorien..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 pr-14 h-16 glass backdrop-blur-xl border-zinc-800 text-lg rounded-2xl group-focus-within:border-purple-500/50 transition-all shadow-lg"
          />
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-5 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
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
          <div className="mb-8 flex items-center justify-between glass backdrop-blur-xl border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <p className="text-zinc-300 font-semibold">
                {loading ? 'Laden...' : `${products.length} ${products.length === 1 ? 'Produkt' : 'Produkte'} gefunden`}
              </p>
            </div>
            {!loading && products.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span>Sortiert nach:</span>
                <span className="text-purple-400 font-semibold">Neueste</span>
              </div>
            )}
          </div>

          {/* Products Grid */}
          {/* Quick View Modal */}
          <ProductQuickView
            product={quickViewProduct}
            isOpen={isQuickViewOpen}
            onClose={() => setIsQuickViewOpen(false)}
            onAddToCart={handleAddToCart}
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
              <div className="w-24 h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Search className="w-12 h-12 text-zinc-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Keine Produkte gefunden</h3>
              <p className="text-zinc-400 mb-8 text-lg">Versuche es mit anderen Filtereinstellungen</p>
              <Button 
                onClick={handleClearFilters} 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-transform h-12 px-8 font-bold"
              >
                Filter zurücksetzen
              </Button>
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
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onQuickView={handleQuickView}
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