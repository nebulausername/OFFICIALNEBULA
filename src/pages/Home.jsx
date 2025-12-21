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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-400 font-medium">Dein Premium Lifestyle Shop</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Nebula Supply
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto">
              Premium Sneaker, Fashion, Tech & Lifestyle – exklusiv für dich
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link
                to={createPageUrl('Products')}
                className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold flex items-center space-x-2 hover:scale-105 transition-transform"
              >
                <span>Jetzt entdecken</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                <div
                  key={index}
                  className="p-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl hover:border-purple-500/50 transition-all"
                >
                  <Icon className="w-10 h-10 text-purple-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-zinc-400">{feature.description}</p>
                </div>
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
            {departments.map((dept) => (
              <Link
                key={dept.id}
                to={createPageUrl('Products') + `?department=${dept.id}`}
                className="group relative overflow-hidden bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all hover:scale-105"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full transform translate-x-16 -translate-y-16" />
                <h3 className="text-2xl font-bold mb-2 relative z-10">{dept.name}</h3>
                <div className="flex items-center text-purple-400 text-sm font-medium relative z-10">
                  <span>Entdecken</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
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