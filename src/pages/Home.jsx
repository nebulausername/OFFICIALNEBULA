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
            {/* Ultra Premium Floating Logo */}
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
                      '0 0 60px rgba(var(--gold-rgb), 0.6)',
                      '0 0 100px rgba(var(--gold-rgb), 0.8)',
                      '0 0 60px rgba(var(--gold-rgb), 0.6)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] p-4 mx-auto relative"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))',
                    border: '2px solid rgba(var(--gold-rgb), 0.5)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)'
                  }}
                >
                  <div className="absolute inset-0 rounded-[2.5rem]" 
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(var(--gold-rgb), 0.2), transparent 70%)'
                    }}
                  />
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                    alt="Nebula Supply"
                    className="relative w-full h-full object-contain drop-shadow-2xl"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(var(--gold-rgb), 0.5))' }}
                  />
                </motion.div>
                {/* Premium Orbital Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-6 border-2 rounded-full"
                  style={{ 
                    borderColor: 'rgba(var(--gold-rgb), 0.4)',
                    boxShadow: '0 0 30px rgba(var(--gold-rgb), 0.3)'
                  }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-10 border-2 rounded-full"
                  style={{ 
                    borderColor: 'rgba(var(--gold-rgb), 0.3)',
                    boxShadow: '0 0 40px rgba(var(--gold-rgb), 0.2)'
                  }}
                />
                {/* Sparkle Accents */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.5, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
                    boxShadow: '0 0 30px rgba(var(--gold-rgb), 0.8)'
                  }}
                >
                  <Sparkles className="w-4 h-4 text-zinc-900" />
                </motion.div>
              </div>
            </motion.div>

            {/* Ultra Premium Headline */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 leading-none">
                <motion.span 
                  className="block bg-gradient-to-r from-white via-zinc-100 to-white bg-clip-text text-transparent"
                  style={{ 
                    textShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
                    filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))'
                  }}
                >
                  NEBULA
                </motion.span>
                <motion.span 
                  className="block bg-gradient-to-r from-[#E8C76A] via-[#F5D98B] to-[#E8C76A] bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ 
                    backgroundSize: '200% auto',
                    textShadow: '0 0 60px rgba(var(--gold-rgb), 0.6)',
                    filter: 'drop-shadow(0 0 30px rgba(var(--gold-rgb), 0.4))'
                  }}
                >
                  SUPPLY
                </motion.span>
              </h1>
            </motion.div>

            {/* Premium Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-bold tracking-wide"
              style={{ 
                color: 'rgba(255, 255, 255, 0.85)',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)'
              }}
            >
              Premium Lifestyle •{' '}
              <span className="bg-gradient-to-r from-[#E8C76A] to-[#F5D98B] bg-clip-text text-transparent font-black">
                Exklusiv für dich
              </span>{' '}
              <span className="inline-block">✨</span>
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
                  <Button 
                    className="h-16 px-10 text-lg rounded-2xl font-black"
                    style={{
                      background: 'linear-gradient(135deg, rgba(214, 178, 94, 0.15), rgba(214, 178, 94, 0.08))',
                      border: '2px solid rgba(214, 178, 94, 0.5)',
                      color: '#F5D98B',
                      boxShadow: '0 0 30px rgba(214, 178, 94, 0.2)'
                    }}
                  >
                    <Star className="w-6 h-6 mr-2" style={{ color: '#E8C76A' }} fill="currentColor" />
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
              className="mt-16 grid grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto"
            >
              {[
                { value: '500+', label: 'Produkte', icon: '📦', color: 'from-purple-500 to-pink-500' },
                { value: '10k+', label: 'Happy Customers', icon: '⭐', color: 'from-amber-500 to-orange-500' },
                { value: '24/7', label: 'Support', icon: '💬', color: 'from-cyan-500 to-blue-500' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative text-center p-5 md:p-6 rounded-2xl overflow-hidden group cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                  }}
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                  />
                  <div className="relative">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#E8C76A] to-[#F5D98B] bg-clip-text text-transparent mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm font-bold" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-24 relative z-10">
        {/* Subtle Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px]"
            style={{ background: 'radial-gradient(circle, rgba(214, 178, 94, 0.08), transparent 70%)' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              whileInView={{ scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="inline-flex items-center gap-3 px-6 py-3 mb-8 rounded-full"
              style={{
                background: 'rgba(214, 178, 94, 0.1)',
                border: '1px solid rgba(214, 178, 94, 0.3)'
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: 'var(--gold)' }} />
              <span className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
                Unsere Welten
              </span>
            </motion.div>

            <motion.h2 
              className="text-5xl md:text-6xl lg:text-7xl font-black mb-5 tracking-tight"
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
              style={{ color: 'var(--text-secondary)' }}
            >
              Tauche ein in unsere Premium-Kollektionen
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {loadingDepts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="aspect-square rounded-2xl"
                  style={{ background: 'var(--surface)' }}
                />
              ))
            ) : (
              departments.map((dept, index) => (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative"
                >
                  <Link
                    to={createPageUrl('Products') + `?department=${dept.id}`}
                    className="relative block rounded-2xl overflow-hidden transition-all"
                    style={{
                      background: 'var(--bg2)',
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-subtle)'
                    }}
                  >
                    {/* Hover Glow */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                      style={{ boxShadow: 'inset 0 0 40px rgba(214, 178, 94, 0.1)' }}
                    />

                    <div className="relative aspect-square flex flex-col items-center justify-center gap-4 p-6">
                      {/* Icon */}
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-20 h-20 rounded-2xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(214, 178, 94, 0.15), rgba(214, 178, 94, 0.05))',
                          border: '1px solid rgba(214, 178, 94, 0.25)'
                        }}
                      >
                        <Package className="w-10 h-10" style={{ color: 'var(--gold)' }} />
                      </motion.div>

                      {/* Name */}
                      <div className="text-center">
                        <h3 className="text-lg md:text-xl font-bold group-hover:text-gold transition-colors"
                          style={{ color: 'var(--text)' }}>
                          {dept.name}
                        </h3>
                        <p className="text-sm font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: 'var(--muted)' }}>
                          Entdecken →
                        </p>
                      </div>
                    </div>

                    {/* Gold Border on Hover */}
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{ border: '1px solid rgba(214, 178, 94, 0.4)' }}
                    />
                  </Link>
                </motion.div>
              ))
            )}
          </div>

          {/* View All CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link to={createPageUrl('Products')}>
              <Button 
                className="h-12 px-8 rounded-xl font-bold"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)'
                }}
              >
                Alle Produkte durchstöbern
                <Sparkles className="w-4 h-4 ml-2" style={{ color: 'var(--gold)' }} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products - Ultra Premium */}
      <section className="py-24 relative overflow-hidden z-10">
        {/* Clean Background */}
        <div className="absolute inset-0" style={{ background: 'var(--bg)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[200px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(214, 178, 94, 0.06), transparent 70%)' }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              whileInView={{ scale: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-6 py-3 mb-8 rounded-full"
              style={{
                background: 'rgba(214, 178, 94, 0.1)',
                border: '1px solid rgba(214, 178, 94, 0.3)'
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: 'var(--gold)' }} />
              <span className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
                Fresh Drops
              </span>
              <div className="w-2 h-2 bg-green-400 rounded-full" />
            </motion.div>
            
            {/* Headline */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl sm:text-6xl md:text-7xl font-black mb-5 tracking-tight"
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
              className="text-lg sm:text-xl max-w-3xl mx-auto font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Die <span style={{ color: 'var(--gold)' }}>heißesten</span> Drops –{' '}
              <span style={{ color: 'var(--gold2)' }}>limitiert</span> & exklusiv ✨
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
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className="h-14 px-10 text-base rounded-xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
                    color: '#0B0D12',
                    boxShadow: '0 4px 20px rgba(214, 178, 94, 0.3)'
                  }}
                >
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