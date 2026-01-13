import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import PremiumProductCard from '../components/products/PremiumProductCard';
import ProductQuickView from '../components/products/ProductQuickView';
import ShopControlStrip from '../components/shop/ShopControlStrip';
import ShopMegaMenu from '../components/shop/ShopMegaMenu';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    loadData();
    
    // Parse URL params
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');
    
    if (searchParam) setSearchQuery(searchParam);
    if (categoryParam) setSelectedCategory(categoryParam);
  }, []);

  const loadData = async () => {
    try {
      const [prods, cats, brds] = await Promise.all([
        base44.entities.Product.list('-created_date'),
        base44.entities.Category.list('sort_order'),
        base44.entities.Brand.list('sort_order')
      ]);
      setProducts(prods);
      setCategories(cats);
      setBrands(brds);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_asc': return (a.price || 0) - (b.price || 0);
      case 'price_desc': return (b.price || 0) - (a.price || 0);
      case 'popular': return 0; // Would need popularity data
      default: return new Date(b.created_date) - new Date(a.created_date);
    }
  });

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
                Premium Drops • Authentisch • Limitiert
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
              Shop
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
            Entdecke unsere Premium-Auswahl
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
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
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
                Keine Produkte gefunden
              </h3>
              <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Versuche einen anderen Suchbegriff oder Filter
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

      {/* Mega Menu */}
      <ShopMegaMenu
        isOpen={megaMenuOpen}
        onClose={() => setMegaMenuOpen(false)}
        categories={categories}
        brands={brands}
      />

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}