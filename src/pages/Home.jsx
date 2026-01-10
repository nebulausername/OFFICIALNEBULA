import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Star, Sparkles, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ProductQuickView from '../components/products/ProductQuickView';

export default function Home() {
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    loadDepartments();
    loadProducts();
  }, []);

  const loadDepartments = async () => {
    try {
      const depts = await base44.entities.Department.list('sort_order');
      setDepartments(depts);
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setLoadingDepts(false);
    }
  };

  const loadProducts = async () => {
    try {
      const prods = await base44.entities.Product.list('-created_date', 4);
      setProducts(prods);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
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
      setIsQuickViewOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-100 to-white">
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-purple-500/30">
                <Star className="w-8 h-8 md:w-10 md:h-10 text-white" fill="white" />
              </div>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 leading-tight text-zinc-900">
              Premium Lifestyle
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Exklusiv für dich
              </span>
            </h1>

            <p className="text-base md:text-lg text-zinc-600 mb-8 max-w-xl mx-auto">
              Entdecke die neuesten Trends in Streetwear, Sneaker & Accessoires
            </p>

            <motion.div
              whileTap={{ scale: 0.97 }}
            >
              <Link to={createPageUrl('Products')}>
                <Button className="h-14 px-10 text-base font-black bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-xl hover:shadow-purple-500/40 rounded-xl text-white">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Jetzt shoppen
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mb-2">
              Kategorien
            </h2>
            <p className="text-zinc-600">Entdecke unsere Produktwelten</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loadingDepts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton aspect-square rounded-xl" />
              ))
            ) : (
              departments.map((dept, index) => (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="group"
                >
                  <Link
                    to={createPageUrl('Products') + `?department=${dept.id}`}
                    className="block bg-white border border-zinc-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square flex flex-col items-center justify-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <Package className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-sm font-black text-center text-zinc-900 group-hover:text-purple-600 transition-colors">
                        {dept.name}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products - Premium Redesign */}
      <section className="py-20 relative overflow-hidden">
        {/* Premium Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-zinc-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.05),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(236,72,153,0.05),transparent_40%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 bg-white/80 backdrop-blur-sm border border-zinc-200/60 rounded-full shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-black text-zinc-700 uppercase tracking-wider">Fresh Arrivals</span>
            </motion.div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-zinc-900 mb-4 tracking-tight">
              Neu eingetroffen
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto font-medium">
              Die neuesten Drops – handverlesen, limitiert, authentisch
            </p>
          </motion.div>

          {/* Premium Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {loadingProducts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="skeleton aspect-[3/4] rounded-2xl" />
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-7 w-1/2 rounded" />
                </div>
              ))
            ) : (
              products.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                  className="group"
                >
                  <div className="relative">
                    {/* Product Card */}
                    <Link
                      to={createPageUrl('ProductDetail') + `?id=${product.id}`}
                      className="block"
                    >
                      <motion.div
                        whileHover={{ y: -8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="bg-white rounded-2xl overflow-hidden border border-zinc-200/60 shadow-sm hover:shadow-xl hover:shadow-zinc-900/10 hover:border-zinc-300 transition-all duration-300"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50">
                          {product.cover_image ? (
                            <motion.img
                              whileHover={{ scale: 1.08 }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              src={product.cover_image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-16 h-16 text-zinc-300" />
                            </div>
                          )}
                          
                          {/* Availability Badge */}
                          {product.in_stock ? (
                            <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm border border-green-500/20 text-green-700 text-xs font-black rounded-full shadow-sm">
                              ✓ Verfügbar
                            </div>
                          ) : (
                            <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm border border-red-500/20 text-red-700 text-xs font-black rounded-full shadow-sm">
                              Ausverkauft
                            </div>
                          )}
                          
                          {/* Quick View Overlay */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6"
                          >
                            <motion.button
                              initial={{ y: 20, opacity: 0 }}
                              whileHover={{ y: 0, opacity: 1, scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ delay: 0.1 }}
                              onClick={(e) => {
                                e.preventDefault();
                                setQuickViewProduct(product);
                                setIsQuickViewOpen(true);
                              }}
                              className="px-6 py-3 bg-white text-zinc-900 font-black text-sm rounded-xl shadow-lg hover:bg-purple-600 hover:text-white transition-all duration-200"
                            >
                              Quick View
                            </motion.button>
                          </motion.div>
                        </div>

                        {/* Product Info */}
                        <div className="p-5 space-y-3">
                          <h3 className="font-bold text-base text-zinc-900 line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors">
                            {product.name}
                          </h3>
                          
                          <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-black text-zinc-900">
                              {product.price}€
                            </div>
                            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                              {product.sku}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <ProductQuickView
            product={quickViewProduct}
            isOpen={isQuickViewOpen}
            onClose={() => setIsQuickViewOpen(false)}
            onAddToCart={handleAddToCart}
          />

          {/* View All CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link to={createPageUrl('Products')}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button className="h-14 px-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-base rounded-2xl shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/40 transition-all">
                  Alle Produkte ansehen
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}