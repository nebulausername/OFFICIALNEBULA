import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { ChevronRight, Star, Sparkles, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [departments, setDepartments] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [depts, products] = await Promise.all([
        base44.entities.Department.list('sort_order'),
        base44.entities.Product.list('-created_date', 6)
      ]);
      setDepartments(depts);
      setFeaturedProducts(products);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, title: 'Schnell', description: 'Blitzschnelle Lieferung' },
    { icon: Shield, title: 'Sicher', description: '100% Authentizität' },
    { icon: Star, title: 'Premium', description: 'Top Qualität' }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden z-10 min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-transparent animate-gradient" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-2xl float-animation" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-3 px-6 py-3 glass backdrop-blur-xl border-2 border-purple-500/40 rounded-full mb-6 glow-effect shadow-2xl shadow-purple-500/30"
            >
              <Sparkles className="w-5 h-5 text-purple-300 animate-pulse" />
              <span className="text-base font-black text-purple-200 uppercase tracking-wider">Dein Premium Lifestyle Shop</span>
              <Sparkles className="w-5 h-5 text-pink-300 animate-pulse" />
            </motion.div>
            
            <motion.h1 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-8 leading-none"
            >
              <span className="inline-block bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-gradient drop-shadow-2xl">
                Nebula
              </span>
              <br />
              <span className="inline-block bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent animate-gradient">
                Supply
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl sm:text-2xl md:text-3xl text-zinc-200 max-w-4xl mx-auto font-bold leading-relaxed"
            >
              Premium Sneaker, Fashion, Tech & Lifestyle
              <br />
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Exklusiv für dich
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12"
            >
              <Link to={createPageUrl('Products')}>
                <motion.button
                  whileHover={{ scale: 1.08, rotate: 1 }}
                  whileTap={{ scale: 0.92 }}
                  className="relative group px-12 py-6 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl font-black text-xl flex items-center gap-3 shadow-2xl shadow-purple-500/60 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Zap className="w-6 h-6 relative z-10 group-hover:animate-pulse" />
                  <span className="relative z-10 uppercase tracking-wider">Jetzt entdecken</span>
                  <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
                  <div className="absolute inset-0 shimmer-effect" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.15 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="relative p-8 glass backdrop-blur-xl border-2 border-zinc-700 rounded-3xl hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-purple-500/50">
                      <Icon className="w-9 h-9 text-white" />
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-zinc-100 group-hover:text-white transition-colors">{feature.title}</h3>
                    <p className="text-base font-semibold text-zinc-300 group-hover:text-zinc-200 transition-colors">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Departments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Kategorien</h2>
          <p className="text-zinc-200 text-xl font-bold">Entdecke unsere exklusiven Sortimente</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 skeleton rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={createPageUrl('Products') + `?department=${dept.id}`}
                  className="group relative overflow-hidden glass backdrop-blur-xl border-2 border-zinc-700 rounded-3xl p-12 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/40 transition-all hover:scale-105 block h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-500/40 to-pink-500/30 rounded-full transform translate-x-24 -translate-y-24 group-hover:scale-150 group-hover:rotate-45 transition-all duration-700 blur-3xl" />
                  
                  <div className="relative z-10">
                    <h3 className="text-4xl md:text-5xl font-black mb-4 text-zinc-100 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all">{dept.name}</h3>
                    <div className="flex items-center gap-2 text-purple-400 text-base font-black group-hover:text-pink-300 transition-colors">
                      <span className="uppercase tracking-wider">Jetzt shoppen</span>
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 glass backdrop-blur-xl border-2 border-purple-500/30 rounded-full mb-6">
              <Star className="w-5 h-5 text-purple-400" fill="currentColor" />
              <span className="text-sm font-black text-purple-300 uppercase tracking-wider">Featured</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Neu eingetroffen</h2>
            <p className="text-zinc-200 text-xl font-bold">Die neuesten Premium-Produkte</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={createPageUrl('ProductDetail') + `?id=${product.id}`}
                  className="group relative glass backdrop-blur-xl border-2 border-zinc-700 rounded-3xl overflow-hidden hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/40 transition-all hover:scale-105 block"
                >
                  {product.cover_image && (
                    <div className="aspect-square overflow-hidden bg-zinc-800 relative">
                      <img
                        src={product.cover_image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}
                  <div className="p-8">
                    <div className="text-xs font-black text-purple-400 mb-3 uppercase tracking-wider">{product.sku}</div>
                    <h3 className="font-black text-xl mb-4 line-clamp-2 text-zinc-100 group-hover:text-white transition-colors">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{product.price}€</span>
                      {product.in_stock ? (
                        <span className="text-xs font-black text-green-300 bg-green-400/20 px-4 py-2 rounded-full border border-green-400/30">Verfügbar</span>
                      ) : (
                        <span className="text-xs font-black text-red-300 bg-red-400/20 px-4 py-2 rounded-full border border-red-400/30">Ausverkauft</span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16 relative z-10"
          >
            <Link to={createPageUrl('Products')}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-10 py-5 glass backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl hover:border-purple-400 hover:bg-purple-500/20 transition-all font-black text-lg text-white shadow-lg shadow-purple-500/30"
              >
                <span className="uppercase tracking-wider">Alle Produkte ansehen</span>
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </motion.div>
        </section>
      )}
    </div>
  );
}