import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Star, Sparkles, Package, ShoppingBag, Shirt, Watch, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ProductQuickView from '../components/products/ProductQuickView';
import DeliveryBar from '../components/delivery/DeliveryBar';
import PremiumProductCard from '../components/products/PremiumProductCard';

// Department icons mapping
const deptIcons = {
  'Herren': Users,
  'Damen': Users,
  'Accessoires': Watch,
  'Unisex': Shirt,
  'default': Package
};

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
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Premium Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Main Gold Gradient */}
        <div 
          className="absolute top-0 left-0 right-0 h-[80vh]"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(var(--gold-rgb), 0.12) 0%, transparent 70%)'
          }}
        />
        
        {/* Subtle Animated Orbs */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            opacity: [0.08, 0.15, 0.08]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{ background: 'rgba(var(--gold-rgb), 0.15)' }}
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            opacity: [0.06, 0.12, 0.06]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'rgba(var(--gold-rgb), 0.12)' }}
        />
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            {/* Floating Logo */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block mb-10"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 50px rgba(var(--gold-rgb), 0.4)',
                      '0 0 80px rgba(var(--gold-rgb), 0.6)',
                      '0 0 50px rgba(var(--gold-rgb), 0.4)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-3xl p-3 mx-auto"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '2px solid rgba(var(--gold-rgb), 0.5)',
                    backdropFilter: 'blur(20px)'
                  }}
                >
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                    alt="Nebula Supply"
                    className="w-full h-full object-contain"
                    style={{ filter: 'drop-shadow(0 0 15px rgba(var(--gold-rgb), 0.5))' }}
                  />
                </motion.div>
                
                {/* Orbital Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-5 border rounded-full"
                  style={{ borderColor: 'rgba(var(--gold-rgb), 0.3)' }}
                />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 leading-none tracking-tight">
                <span className="block" style={{ color: '#FFFFFF' }}>NEBULA</span>
                <span 
                  className="block bg-gradient-to-r from-gold via-gold2 to-gold bg-clip-text text-transparent"
                  style={{ filter: 'drop-shadow(0 0 30px rgba(var(--gold-rgb), 0.4))' }}
                >
                  SUPPLY
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-semibold"
              style={{ color: 'rgba(255, 255, 255, 0.85)' }}
            >
              Premium Lifestyle • <span className="text-gold font-bold">Exklusiv für dich</span> ✨
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
            >
              <Link to={createPageUrl('Products')}>
                <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                  <Button className="btn-gold h-14 px-10 text-lg rounded-xl font-bold">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Jetzt shoppen
                  </Button>
                </motion.div>
              </Link>

              <Link to={createPageUrl('VIP')}>
                <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                  <Button 
                    className="h-14 px-8 text-lg rounded-xl font-bold"
                    style={{
                      background: 'rgba(var(--gold-rgb), 0.12)',
                      border: '1px solid rgba(var(--gold-rgb), 0.4)',
                      color: 'var(--gold2)'
                    }}
                  >
                    <Star className="w-5 h-5 mr-2" fill="currentColor" />
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
              className="max-w-3xl mx-auto"
            >
              <DeliveryBar />
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-14 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
            >
              {[
                { value: '500+', label: 'Produkte', emoji: '📦' },
                { value: '10k+', label: 'Kunden', emoji: '⭐' },
                { value: '24/7', label: 'Support', emoji: '💬' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-4 md:p-5 rounded-xl text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(var(--gold-rgb), 0.2)'
                  }}
                >
                  <div className="text-xl mb-1">{stat.emoji}</div>
                  <div className="text-2xl md:text-3xl font-black text-gold2">{stat.value}</div>
                  <div className="text-xs md:text-sm font-semibold text-muted">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 rounded-full"
              style={{
                background: 'rgba(var(--gold-rgb), 0.1)',
                border: '1px solid rgba(var(--gold-rgb), 0.3)'
              }}
            >
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm font-bold uppercase tracking-wider text-gold">
                Unsere Welten
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4" style={{ color: '#FFFFFF' }}>
              Kategorien
            </h2>
            <p className="text-lg font-medium max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
              Entdecke unsere Premium-Kollektionen
            </p>
          </motion.div>

          {/* Department Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {loadingDepts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div 
                  key={i}
                  className="aspect-square rounded-2xl animate-pulse"
                  style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                />
              ))
            ) : (
              departments.map((dept, index) => {
                const IconComponent = deptIcons[dept.name] || deptIcons['default'];
                return (
                  <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <Link
                      to={createPageUrl('Products') + `?department=${dept.id}`}
                      className="block rounded-2xl overflow-hidden transition-all group"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(var(--gold-rgb), 0.2)'
                      }}
                    >
                      <div className="aspect-square flex flex-col items-center justify-center gap-4 p-6 relative">
                        {/* Hover Glow */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'radial-gradient(circle, rgba(var(--gold-rgb), 0.1), transparent 70%)' }}
                        />
                        
                        {/* Icon */}
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, rgba(var(--gold-rgb), 0.2), rgba(var(--gold-rgb), 0.08))',
                            border: '1px solid rgba(var(--gold-rgb), 0.3)'
                          }}
                        >
                          <IconComponent className="w-10 h-10 text-gold" />
                        </motion.div>

                        {/* Name */}
                        <div className="text-center relative">
                          <h3 className="text-lg md:text-xl font-bold group-hover:text-gold transition-colors" style={{ color: '#FFFFFF' }}>
                            {dept.name}
                          </h3>
                          <p 
                            className="text-sm font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--gold)' }}
                          >
                            Entdecken →
                          </p>
                        </div>
                      </div>
                      
                      {/* Gold Border on Hover */}
                      <div 
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        style={{ border: '1px solid rgba(var(--gold-rgb), 0.5)' }}
                      />
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link to={createPageUrl('Products')}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button 
                  className="h-12 px-8 rounded-xl font-bold"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(var(--gold-rgb), 0.3)',
                    color: '#FFFFFF'
                  }}
                >
                  Alle Produkte
                  <Sparkles className="w-4 h-4 ml-2 text-gold" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 rounded-full"
              style={{
                background: 'rgba(var(--gold-rgb), 0.1)',
                border: '1px solid rgba(var(--gold-rgb), 0.3)'
              }}
            >
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm font-bold uppercase tracking-wider text-gold">Fresh Drops</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4" style={{ color: '#FFFFFF' }}>
              Brandneu
            </h2>
            
            <p className="text-lg max-w-2xl mx-auto font-medium" style={{ color: 'var(--muted)' }}>
              Die <span className="text-gold">heißesten</span> Drops – <span className="text-gold2">limitiert</span> & exklusiv ✨
            </p>
          </motion.div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {loadingProducts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square rounded-2xl animate-pulse" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
                  <div className="h-5 w-3/4 rounded animate-pulse" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
                  <div className="h-7 w-1/2 rounded animate-pulse" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
                </div>
              ))
            ) : (
              products.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
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

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link to={createPageUrl('Products')}>
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button className="btn-gold h-14 px-10 text-base rounded-xl font-bold">
                  Alle Produkte ansehen
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* VIP Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-8 md:p-12 text-center overflow-hidden"
            style={{
              background: 'rgba(var(--gold-rgb), 0.08)',
              border: '1px solid rgba(var(--gold-rgb), 0.3)'
            }}
          >
            {/* Crown */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <div 
                className="w-24 h-24 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold2))' }}
              >
                <span className="text-5xl">👑</span>
              </div>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gold2">
              VIP CLUB
            </h2>
            
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto font-medium" style={{ color: 'var(--muted)' }}>
              Tritt der <span className="text-gold font-bold">Elite</span> bei und erlebe{' '}
              <span className="text-gold2 font-bold">Premium Shopping</span> ✨
            </p>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { emoji: '⚡', title: 'Early Access', desc: 'Erster Zugriff auf neue Produkte' },
                { emoji: '💎', title: 'Exklusive Deals', desc: 'Spezielle VIP-Rabatte' },
                { emoji: '🎁', title: 'Priority Support', desc: 'Bevorzugter Kundenservice' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="p-5 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(var(--gold-rgb), 0.2)'
                  }}
                >
                  <div className="text-2xl mb-2">{item.emoji}</div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <Link to={createPageUrl('VIP')}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button className="btn-gold h-14 px-10 text-lg rounded-xl font-bold">
                  👑 VIP werden
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}