import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import FilterSidebar from '../components/products/FilterSidebar';
import ProductCard from '../components/products/ProductCard';
import { useToast } from '@/components/ui/use-toast';
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

  const handleAddToCart = async (product) => {
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
          quantity: existing[0].quantity + 1
        });
      } else {
        // Create new cart item
        await base44.entities.StarCartItem.create({
          user_id: user.id,
          product_id: product.id,
          quantity: 1
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Produkte</h1>
        <p className="text-zinc-400 text-lg">Entdecke unsere Premium-Auswahl</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Produkte suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-zinc-900 border-zinc-800 text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6">
            <FilterSidebar
              departments={departments}
              categories={categories}
              brands={brands}
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filter & Sortierung
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-zinc-900 border-zinc-800 w-80">
                <SheetHeader>
                  <SheetTitle>Filter</SheetTitle>
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

          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-zinc-400">
              {loading ? 'Laden...' : `${products.length} Produkte gefunden`}
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-zinc-900/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Keine Produkte gefunden</h3>
              <p className="text-zinc-400 mb-6">Versuche es mit anderen Filtereinstellungen</p>
              <Button onClick={handleClearFilters} variant="outline">
                Filter zurücksetzen
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}