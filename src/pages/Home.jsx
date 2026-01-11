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
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
        {/* Animated Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-8"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/50">
                <Star className="w-10 h-10 md:w-12 md:h-12 text-white" fill="white" />
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight"
            >
              <span className="text-white">Premium Lifestyle</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Exklusiv für dich
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-zinc-300 mb-10 max-w-2xl mx-auto font-medium"
            >
              Entdecke die neuesten Trends in Streetwear, Sneaker & Accessoires
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link to={createPageUrl('Products')}>
                <Button className="h-16 px-12 text-lg font-black bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:shadow-2xl hover:shadow-purple-500/50 rounded-2xl text-white transition-all">
                  <Sparkles className="w-6 h-6 mr-2" />
                  Jetzt shoppen
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-6 py-3 mb-6 glass backdrop-blur-xl border-2 border-purple-500/30 rounded-full shadow-xl shadow-purple-500/20"
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-black text-purple-300 uppercase tracking-wider">Premium Selection</span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Kategorien
            </h2>
            <p className="text-zinc-300 text-lg md:text-xl font-medium max-w-2xl mx-auto">Entdecke unsere Produktwelten – von Streetwear bis Accessoires</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {loadingDepts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton aspect-square rounded-2xl" />
              ))
            ) : (
              departments.map((dept, index) => {
                // Define gradient colors for each department
                const gradients = [
                  { from: 'from-purple-500', via: 'via-pink-500', to: 'to-purple-600', shadow: 'shadow-purple-500/50' },
                  { from: 'from-pink-500', via: 'via-rose-500', to: 'to-pink-600', shadow: 'shadow-pink-500/50' },
                  { from: 'from-blue-500', via: 'via-cyan-500', to: 'to-blue-600', shadow: 'shadow-blue-500/50' },
                  { from: 'from-amber-500', via: 'via-orange-500', to: 'to-amber-600', shadow: 'shadow-amber-500/50' }
                ];
                const gradient = gradients[index % gradients.length];

                return (
                  <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, type: 'spring', stiffness: 100 }}
                    whileHover={{ y: -8, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative"
                  >
                    {/* Glow Effect */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${gradient.from} ${gradient.via} ${gradient.to} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500`} />

                    <Link
                      to={createPageUrl('Products') + `?department=${dept.id}`}
                      className="relative block glass backdrop-blur-2xl border-2 border-zinc-800/50 rounded-2xl overflow-hidden hover:border-white/20 transition-all shadow-xl"
                    >
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      <div className="relative aspect-square flex flex-col items-center justify-center gap-4 p-6">
                        {/* Icon with Gradient */}
                        <motion.div 
                          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                          transition={{ duration: 0.6 }}
                          className={`relative w-20 h-20 bg-gradient-to-br ${gradient.from} ${gradient.via} ${gradient.to} rounded-2xl flex items-center justify-center shadow-2xl ${gradient.shadow}`}
                        >
                          {/* Inner Glow */}
                          <div className="absolute inset-2 bg-white/10 rounded-xl" />
                          <Package className="relative w-10 h-10 text-white drop-shadow-lg" />
                        </motion.div>

                        {/* Department Name */}
                        <div className="text-center">
                          <h3 className="text-lg md:text-xl font-black text-white mb-1 group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                            {dept.name}
                          </h3>
                          <p className="text-xs text-zinc-400 font-medium">Jetzt entdecken</p>
                        </div>

                        {/* Arrow Indicator */}
                        <motion.div
                          initial={{ x: -5, opacity: 0 }}
                          whileHover={{ x: 0, opacity: 1 }}
                          className="absolute bottom-4 right-4 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center"
                        >
                          <span className="text-white text-lg">→</span>
                        </motion.div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* View All CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-10"
          >
            <Link to={createPageUrl('Products')}>
              <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-bold">
                Alle Produkte durchstöbern
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products - Premium Redesign */}
      <section className="py-20 relative overflow-hidden">
        {/* Premium Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(236,72,153,0.15),transparent_50%)]" />
        
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
              className="inline-flex items-center gap-2 px-6 py-3 mb-8 glass backdrop-blur-xl border-2 border-purple-500/30 rounded-full shadow-xl shadow-purple-500/20"
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-black text-purple-300 uppercase tracking-wider">Fresh Arrivals</span>
            </motion.div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 tracking-tight">
              Neu eingetroffen
            </h2>
            <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto font-medium">
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
                        className="glass backdrop-blur-xl rounded-2xl overflow-hidden border-2 border-zinc-800/50 shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 hover:border-purple-500/60 transition-all duration-300"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800">
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
                              <Package className="w-16 h-16 text-zinc-600" />
                            </div>
                          )}
                          
                          {/* Availability Badge */}
                          {product.in_stock ? (
                            <div className="absolute top-3 right-3 px-3.5 py-2 bg-green-500/90 backdrop-blur-sm text-white text-xs font-black rounded-full shadow-lg shadow-green-500/50">
                              ✓ Verfügbar
                            </div>
                          ) : (
                            <div className="absolute top-3 right-3 px-3.5 py-2 bg-red-500/90 backdrop-blur-sm text-white text-xs font-black rounded-full shadow-lg shadow-red-500/50">
                              Ausverkauft
                            </div>
                          )}
                          
                          {/* Quick View Overlay */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6"
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
                              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-sm rounded-xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-200"
                            >
                              Quick View
                            </motion.button>
                          </motion.div>
                        </div>

                        {/* Product Info */}
                        <div className="p-5 space-y-3">
                          <h3 className="font-bold text-base text-white line-clamp-2 leading-snug group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                            {product.name}
                          </h3>
                          
                          <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-black text-white">
                              {product.price}€
                            </div>
                            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
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
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button className="h-16 px-14 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-400 hover:via-pink-400 hover:to-purple-500 text-white font-black text-lg rounded-2xl shadow-2xl shadow-purple-600/40 hover:shadow-purple-600/60 transition-all">
                  Alle Produkte ansehen
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* VIP Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass backdrop-blur-2xl border-2 border-yellow-500/30 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-yellow-500/20"
          >
            {/* Crown Icon */}
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                y: [0, -10, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/50">
                <span className="text-4xl">👑</span>
              </div>
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent">
                VIP Premium Access
              </span>
            </h2>

            <p className="text-lg md:text-xl text-zinc-200 mb-8 max-w-2xl mx-auto font-medium">
              Werde VIP-Mitglied und erhalte exklusive Vorteile, frühen Zugang zu Drops und besondere Rabatte
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <motion.div 
                whileHover={{ y: -5, scale: 1.03 }}
                className="glass backdrop-blur-xl border-2 border-yellow-500/20 rounded-2xl p-6"
              >
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-black text-white mb-2">Early Access</h3>
                <p className="text-sm text-zinc-300">Erster Zugriff auf neue Produkte</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5, scale: 1.03 }}
                className="glass backdrop-blur-xl border-2 border-yellow-500/20 rounded-2xl p-6"
              >
                <div className="text-3xl mb-3">💎</div>
                <h3 className="font-black text-white mb-2">Exklusive Deals</h3>
                <p className="text-sm text-zinc-300">Spezielle VIP-Rabatte & Angebote</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5, scale: 1.03 }}
                className="glass backdrop-blur-xl border-2 border-yellow-500/20 rounded-2xl p-6"
              >
                <div className="text-3xl mb-3">🎁</div>
                <h3 className="font-black text-white mb-2">Priority Support</h3>
                <p className="text-sm text-zinc-300">Bevorzugter Kundenservice</p>
              </motion.div>
            </div>

            <Link to={createPageUrl('VIP')}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button className="h-16 px-12 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500 text-zinc-900 font-black text-lg rounded-2xl shadow-2xl shadow-yellow-500/40 hover:shadow-yellow-500/60 transition-all">
                  <span className="mr-2">👑</span>
                  VIP werden
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}