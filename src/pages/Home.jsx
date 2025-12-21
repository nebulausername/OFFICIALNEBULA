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
      <section className="relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 animate-gradient" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 glass border border-purple-500/30 rounded-full mb-4 glow-effect"
            >
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-sm text-purple-400 font-semibold">Dein Premium Lifestyle Shop</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                Nebula Supply
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto">
              Premium Sneaker, Fashion, Tech & Lifestyle – exklusiv für dich
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link to={createPageUrl('Products')}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="neon-button group px-10 py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl font-bold text-lg flex items-center space-x-2 shadow-2xl shadow-purple-500/50 glow-effect animate-gradient"
                >
                  <span>Jetzt entdecken</span>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="p-8 glass border border-zinc-800 rounded-2xl hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-zinc-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Departments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Kategorien</h2>
          <p className="text-zinc-400 text-lg">Entdecke unsere exklusiven Sortimente</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-zinc-900/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={createPageUrl('Products') + `?department=${dept.id}`}
                  className="group relative overflow-hidden glass border border-zinc-800 rounded-2xl p-10 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all hover:scale-105 block h-full"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/30 to-pink-500/20 rounded-full transform translate-x-20 -translate-y-20 group-hover:scale-150 transition-transform duration-500 blur-2xl" />
                  <h3 className="text-3xl font-black mb-3 relative z-10 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">{dept.name}</h3>
                  <div className="flex items-center text-purple-400 text-sm font-bold relative z-10 group-hover:text-pink-400 transition-colors">
                    <span>Entdecken</span>
                    <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Neu eingetroffen</h2>
            <p className="text-zinc-400 text-lg">Die neuesten Premium-Produkte</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={createPageUrl('ProductDetail') + `?id=${product.id}`}
                className="group bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all hover:scale-105"
              >
                {product.cover_image && (
                  <div className="aspect-square overflow-hidden bg-zinc-800">
                    <img
                      src={product.cover_image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="text-xs text-purple-400 font-medium mb-2">{product.sku}</div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-purple-400">{product.price}€</span>
                    {product.in_stock ? (
                      <span className="text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full">Verfügbar</span>
                    ) : (
                      <span className="text-xs text-red-400 bg-red-400/10 px-3 py-1 rounded-full">Ausverkauft</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to={createPageUrl('Products')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors"
            >
              <span>Alle Produkte ansehen</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}