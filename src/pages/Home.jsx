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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-pink-600/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]"
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            {/* Floating Logo */}
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotateY: [0, 180, 360],
              }}
              transition={{ 
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                rotateY: { duration: 8, repeat: Infinity, ease: "linear" }
              }}
              className="inline-block mb-12 perspective-1000"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 60px rgba(168, 85, 247, 0.4)',
                      '0 0 100px rgba(236, 72, 153, 0.6)',
                      '0 0 60px rgba(168, 85, 247, 0.4)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-[2.5rem] flex items-center justify-center mx-auto"
                >
                  <Star className="w-14 h-14 md:w-18 md:h-18 text-white drop-shadow-2xl" fill="white" />
                </motion.div>
                {/* Orbital Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-6 border-2 border-purple-500/30 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-10 border-2 border-pink-500/20 rounded-full"
                />
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 leading-none">
                <motion.span 
                  className="block bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: '200% auto' }}
                >
                  NEBULA
                </motion.span>
                <motion.span 
                  className="block bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['100% 50%', '0% 50%', '100% 50%']
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: '200% auto' }}
                >
                  SUPPLY
                </motion.span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto font-medium tracking-wide"
            >
              Wo <span className="text-purple-400 font-bold">Style</span> auf{' '}
              <span className="text-pink-400 font-bold">Premium</span> trifft ✨
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to={createPageUrl('Products')}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 40px rgba(168, 85, 247, 0.5)',
                        '0 0 60px rgba(236, 72, 153, 0.5)',
                        '0 0 40px rgba(168, 85, 247, 0.5)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-2xl blur-xl"
                  />
                  <Button className="relative h-16 px-12 text-lg font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 rounded-2xl text-white border-2 border-white/20 bg-[length:200%_auto] transition-all">
                    <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                    Shop entdecken
                  </Button>
                </motion.div>
              </Link>

              <Link to={createPageUrl('VIP')}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" className="h-16 px-10 text-lg font-black bg-zinc-900/50 backdrop-blur-xl border-2 border-purple-500/40 hover:border-purple-500/80 hover:bg-zinc-800/50 rounded-2xl text-white transition-all">
                    <Star className="w-6 h-6 mr-2 text-yellow-400" fill="currentColor" />
                    VIP werden
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto"
            >
              {[
                { value: '500+', label: 'Produkte' },
                { value: '10k+', label: 'Happy Customers' },
                { value: '24/7', label: 'Support' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="text-center p-4 rounded-xl bg-zinc-900/30 backdrop-blur-xl border border-white/10"
                >
                  <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-zinc-500 font-semibold mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-24 relative z-10">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute bottom-20 right-10 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -5 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="inline-flex items-center gap-3 px-8 py-4 mb-8 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 backdrop-blur-2xl border-2 border-purple-500/40 rounded-full shadow-2xl shadow-purple-500/30"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-purple-400" />
              </motion.div>
              <span className="text-base font-black text-white uppercase tracking-widest">Unsere Welten</span>
            </motion.div>

            <motion.h2 
              className="text-5xl md:text-7xl font-black mb-6 tracking-tight"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Kategorien
              </span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto"
            >
              Tauche ein in unsere Premium-Kollektionen
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {loadingDepts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="aspect-square rounded-3xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl border border-zinc-700/50" 
                />
              ))
            ) : (
              departments.map((dept, index) => {
                const gradients = [
                  { 
                    from: 'from-purple-600', via: 'via-pink-600', to: 'to-purple-700', 
                    glow: 'shadow-purple-500/50', border: 'border-purple-500/40',
                    ring: 'ring-purple-500/30', bg: 'bg-purple-500/10'
                  },
                  { 
                    from: 'from-pink-600', via: 'via-rose-600', to: 'to-pink-700', 
                    glow: 'shadow-pink-500/50', border: 'border-pink-500/40',
                    ring: 'ring-pink-500/30', bg: 'bg-pink-500/10'
                  },
                  { 
                    from: 'from-blue-600', via: 'via-cyan-600', to: 'to-blue-700', 
                    glow: 'shadow-blue-500/50', border: 'border-blue-500/40',
                    ring: 'ring-blue-500/30', bg: 'bg-blue-500/10'
                  },
                  { 
                    from: 'from-amber-600', via: 'via-orange-600', to: 'to-amber-700', 
                    glow: 'shadow-amber-500/50', border: 'border-amber-500/40',
                    ring: 'ring-amber-500/30', bg: 'bg-amber-500/10'
                  }
                ];
                const gradient = gradients[index % gradients.length];

                return (
                  <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: index * 0.1, 
                      type: 'spring', 
                      stiffness: 100,
                      damping: 15
                    }}
                    whileHover={{ y: -12, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative"
                  >
                    {/* Animated Glow */}
                    <motion.div 
                      animate={{
                        boxShadow: [
                          `0 0 40px rgba(168, 85, 247, 0.3)`,
                          `0 0 80px rgba(236, 72, 153, 0.5)`,
                          `0 0 40px rgba(168, 85, 247, 0.3)`,
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className={`absolute -inset-2 bg-gradient-to-r ${gradient.from} ${gradient.via} ${gradient.to} rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-all duration-700`} 
                    />

                    {/* Outer Ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className={`absolute -inset-1 border-2 ${gradient.border} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity`}
                    />

                    <Link
                      to={createPageUrl('Products') + `?department=${dept.id}`}
                      className={`relative block backdrop-blur-2xl border-2 ${gradient.border} rounded-3xl overflow-hidden hover:border-opacity-100 transition-all shadow-2xl ${gradient.glow} bg-gradient-to-br from-zinc-900/80 to-black/80`}
                    >
                      {/* Animated Background */}
                      <motion.div 
                        animate={{
                          backgroundPosition: ['0% 0%', '100% 100%']
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className={`absolute inset-0 ${gradient.bg} opacity-20 bg-[size:200%_200%]`}
                      />

                      {/* Shimmer Effect */}
                      <motion.div 
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" 
                      />

                      <div className="relative aspect-square flex flex-col items-center justify-center gap-5 p-6">
                        {/* Icon Container */}
                        <motion.div 
                          whileHover={{ 
                            rotate: [0, -15, 15, -15, 0],
                            scale: 1.2
                          }}
                          transition={{ duration: 0.7 }}
                          className="relative"
                        >
                          {/* Pulsing Ring */}
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`absolute inset-0 bg-gradient-to-br ${gradient.from} ${gradient.to} rounded-2xl blur-lg`}
                          />
                          
                          <div className={`relative w-24 h-24 bg-gradient-to-br ${gradient.from} ${gradient.via} ${gradient.to} rounded-2xl flex items-center justify-center shadow-2xl ${gradient.glow}`}>
                            <div className="absolute inset-2 bg-white/10 rounded-xl backdrop-blur-sm" />
                            <Package className="relative w-12 h-12 text-white drop-shadow-2xl" />
                          </div>
                        </motion.div>

                        {/* Department Name */}
                        <div className="text-center space-y-2">
                          <h3 className="text-xl md:text-2xl font-black text-white group-hover:scale-110 transition-transform">
                            {dept.name}
                          </h3>
                          <motion.p 
                            initial={{ opacity: 0, y: 5 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            className="text-xs text-zinc-400 font-semibold uppercase tracking-wider"
                          >
                            Entdecken →
                          </motion.p>
                        </div>

                        {/* Corner Accent */}
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          whileHover={{ scale: 1, rotate: 0 }}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center"
                        >
                          <span className="text-white text-xl">✨</span>
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

      {/* Featured Products - Ultra Premium */}
      <section className="py-32 relative overflow-hidden z-10">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(139,92,246,0.15),transparent_60%)]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.15),transparent_60%)]"
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="inline-flex items-center gap-3 px-8 py-4 mb-10 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 backdrop-blur-2xl border-2 border-purple-500/40 rounded-full shadow-2xl shadow-purple-500/30"
            >
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <Sparkles className="w-6 h-6 text-purple-400" />
              </motion.div>
              <span className="text-base font-black text-white uppercase tracking-widest">Fresh Drops</span>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-500/50"
              />
            </motion.div>
            
            {/* Headline */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight"
            >
              <span className="block bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Brandneu
              </span>
            </motion.h2>
            
            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl text-zinc-400 max-w-3xl mx-auto font-medium"
            >
              Die <span className="text-purple-400 font-bold">heißesten</span> Drops –{' '}
              <span className="text-pink-400 font-bold">limitiert</span> & exklusiv ✨
            </motion.p>
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

      {/* VIP Section - Ultra Premium */}
      <section className="py-32 relative overflow-hidden z-10">
        {/* Epic Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 via-purple-900/10 to-pink-900/10" />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-500/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ 
              scale: [1.3, 1, 1.3],
              rotate: [360, 180, 0]
            }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-purple-500/20 rounded-full blur-[120px]"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="relative backdrop-blur-2xl border-2 border-yellow-500/40 rounded-[3rem] p-10 md:p-16 text-center overflow-hidden"
          >
            {/* Animated Background Pattern */}
            <motion.div
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%']
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-yellow-500/10 bg-[size:200%_200%]"
            />

            {/* Rotating Crown */}
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 0],
                y: [0, -15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-8 relative"
            >
              {/* Crown Glow */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 60px rgba(234, 179, 8, 0.5)',
                    '0 0 100px rgba(245, 158, 11, 0.7)',
                    '0 0 60px rgba(234, 179, 8, 0.5)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-3xl blur-2xl"
              />
              <div className="relative w-28 h-28 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-6xl drop-shadow-2xl">👑</span>
              </div>
              
              {/* Orbiting Sparkles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute -top-2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-500/50" />
                <div className="absolute top-1/2 -right-2 w-3 h-3 bg-amber-400 rounded-full shadow-lg shadow-amber-500/50" />
                <div className="absolute -bottom-2 left-1/2 w-3 h-3 bg-yellow-300 rounded-full shadow-lg shadow-yellow-400/50" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl lg:text-7xl font-black mb-6"
            >
              <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-2xl">
                VIP CLUB
              </span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-zinc-300 mb-12 max-w-3xl mx-auto font-medium leading-relaxed"
            >
              Tritt der <span className="text-yellow-400 font-black">Elite</span> bei und erlebe{' '}
              <span className="text-amber-400 font-black">Premium Shopping</span> ✨
            </motion.p>

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