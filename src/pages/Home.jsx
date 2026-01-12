import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Star, Sparkles, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ProductQuickView from '../components/products/ProductQuickView';
import DeliveryBar from '../components/delivery/DeliveryBar';
import PremiumProductCard from '../components/products/PremiumProductCard';

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
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Animated Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent 70%)' }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.15, 0.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2), transparent 70%)' }}
        />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(var(--gold-rgb), 0.15), transparent 70%)' }}
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
            {/* Floating Premium Logo */}
            <motion.div
              animate={{ 
                y: [0, -20, 0]
              }}
              transition={{ 
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="inline-block mb-12"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 60px rgba(var(--gold-rgb), 0.4)',
                      '0 0 100px rgba(var(--gold-rgb), 0.6)',
                      '0 0 60px rgba(var(--gold-rgb), 0.4)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] p-3 mx-auto gold-border"
                  style={{ 
                    background: 'var(--surface)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)'
                  }}
                >
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                    alt="Nebula Supply"
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </motion.div>
                {/* Orbital Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-6 border-2 rounded-full"
                  style={{ borderColor: 'rgba(var(--gold-rgb), 0.30)' }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-10 border-2 rounded-full"
                  style={{ borderColor: 'rgba(var(--gold-rgb), 0.20)' }}
                />
              </div>
            </motion.div>

            {/* Main Headline - Premium Gold/White */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 leading-none">
                <motion.span 
                  className="block"
                  style={{ color: 'var(--text)' }}
                >
                  NEBULA
                </motion.span>
                <motion.span 
                  className="block bg-gradient-to-r from-[#E8C76A] via-[#F5D98B] to-[#E8C76A] bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
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
              className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-bold tracking-wide"
              style={{ color: 'var(--muted)' }}
            >
              Premium Lifestyle •{' '}
              <span className="text-gold2">Exklusiv für dich</span> ✨
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
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
                        '0 0 40px rgba(var(--gold-rgb), 0.4)',
                        '0 0 60px rgba(var(--gold-rgb), 0.5)',
                        '0 0 40px rgba(var(--gold-rgb), 0.4)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-2xl blur-xl"
                  />
                  <Button className="btn-gold relative h-16 px-12 text-lg rounded-2xl">
                    <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                    Jetzt shoppen
                  </Button>
                </motion.div>
              </Link>

              <Link to={createPageUrl('VIP')}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="btn-gold-outline h-16 px-10 text-lg rounded-2xl">
                    <Star className="w-6 h-6 mr-2 text-gold" fill="currentColor" />
                    VIP werden
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Delivery Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="max-w-4xl mx-auto"
            >
              <DeliveryBar />
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
                  className="glass-panel-hover text-center p-4 rounded-xl"
                >
                  <div className="text-3xl font-black bg-gradient-to-r from-[#E8C76A] to-[#F5D98B] bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold mt-1" style={{ color: 'var(--subtle)' }}>{stat.label}</div>
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
              style={{ color: 'var(--text)' }}
            >
              Kategorien
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl font-medium max-w-2xl mx-auto"
              style={{ color: 'var(--muted)' }}
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
              style={{ color: 'var(--text)' }}
            >
              Brandneu
            </motion.h2>
            
            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl max-w-3xl mx-auto font-bold"
              style={{ color: 'var(--muted)' }}
            >
              Die <span className="text-gold">heißesten</span> Drops –{' '}
              <span className="text-gold2">limitiert</span> & exklusiv ✨
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
                >
                  <PremiumProductCard
                    product={product}
                    onQuickView={(p) => {
                      setQuickViewProduct(p);
                      setIsQuickViewOpen(true);
                    }}
                  />
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
                <Button className="btn-gold h-16 px-14 text-lg rounded-2xl">
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
              className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-bold leading-relaxed"
              style={{ color: 'var(--muted)' }}
            >
              Tritt der <span className="text-gold font-black">Elite</span> bei und erlebe{' '}
              <span className="text-gold2 font-black">Premium Shopping</span> ✨
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
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="relative h-16 px-12 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500 text-zinc-900 font-black text-lg rounded-2xl shadow-2xl hover:shadow-yellow-500/60 transition-all overflow-hidden group"
              >
                {/* Animated Background */}
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundSize: '200% 100%' }}
                />
                
                {/* Shine Effect */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                />
                
                {/* Content */}
                <span className="relative flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    👑
                  </motion.span>
                  VIP werden
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}