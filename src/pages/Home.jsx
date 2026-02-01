import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { api } from '@/api';
import { Star, Sparkles, Zap, Trophy, Crown, Package } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import UnifiedProductModal from '../components/products/UnifiedProductModal';
import DeliveryBar from '../components/delivery/DeliveryBar';
import FreshDropsSection from '../components/home/FreshDropsSection';
import CategoryProductsSection from '../components/home/CategoryProductsSection';
import VideoSpotlight from '../components/home/VideoSpotlight';
import TypewriterEffect from '@/components/ui/TypewriterEffect';
import CosmicHeroBackground from '../components/home/CosmicHeroBackground';
import BentoGrid from '../components/home/BentoGrid';
import InfiniteMarquee from '../components/home/InfiniteMarquee';
import MagneticButton from '@/components/ui/MagneticButton';
import SEO from '@/components/seo/SEO';

// Animated Section Wrapper
const AnimatedSection = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [departmentProductCounts, setDepartmentProductCounts] = useState({});
  const [departmentProducts, setDepartmentProducts] = useState({});
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingDeptProducts, setLoadingDeptProducts] = useState({});
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // 🖱️ Advanced Mouse Parallax System
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for mouse movement
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Parallax transform values
  const bgX = useTransform(springX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [25, -25]);
  const bgY = useTransform(springY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [25, -25]);

  const logoX = useTransform(springX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [-35, 35]);
  const logoY = useTransform(springY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [-35, 35]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Create a centralized coordinate system (-0.5 to 0.5)
      const x = (e.clientX - window.innerWidth / 2);
      const y = (e.clientY - window.innerHeight / 2);

      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    loadDepartments();
    loadProducts();
  }, []);

  useEffect(() => {
    if (departments.length > 0) {
      loadDepartmentProductCounts();
      loadDepartmentProducts();
    }
  }, [departments]);

  const loadDepartments = async () => {
    try {
      const depts = await api.entities.Department.list('sort_order');
      setDepartments(depts);
    } catch (error) {
      console.error('❌ Error loading departments:', error);
    } finally {
      setLoadingDepts(false);
    }
  };

  const loadDepartmentProductCounts = async () => {
    try {
      const counts = {};
      for (const dept of departments) {
        try {
          const deptProducts = await api.entities.Product.filter({ department_id: dept.id });
          counts[dept.id] = Array.isArray(deptProducts) ? deptProducts.length : 0;
        } catch (err) {
          counts[dept.id] = 0;
        }
      }
      setDepartmentProductCounts(counts);
    } catch (error) {
      console.error('❌ Error loading department product counts:', error);
    }
  };

  const loadDepartmentProducts = async () => {
    try {
      const loadingStates = {};
      const productsByDept = {};

      departments.forEach(dept => {
        loadingStates[dept.id] = true;
      });
      setLoadingDeptProducts(loadingStates);

      await Promise.all(
        departments.map(async (dept) => {
          try {
            const prods = await api.entities.Product.filter(
              { department_id: dept.id },
              '-created_at',
              8
            );
            productsByDept[dept.id] = Array.isArray(prods) ? prods : [];
          } catch (err) {
            // Fallback logic
            try {
              const fallbackProds = await api.entities.Product.list('-created_at', 8);
              productsByDept[dept.id] = Array.isArray(fallbackProds) ? fallbackProds : [];
            } catch (fallbackErr) {
              productsByDept[dept.id] = [];
            }
          } finally {
            loadingStates[dept.id] = false;
          }
        })
      );

      setDepartmentProducts(productsByDept);
      setLoadingDeptProducts(loadingStates);
    } catch (error) {
      console.error('❌ Critical error loading department products:', error);
      const loadingStates = {};
      departments.forEach(dept => {
        loadingStates[dept.id] = false;
      });
      setLoadingDeptProducts(loadingStates);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      let prods = await api.entities.Product.list('-created_at', 12);

      if (!Array.isArray(prods)) {
        if (prods && Array.isArray(prods.data)) {
          prods = prods.data;
        } else {
          prods = [];
        }
      }
      setProducts(prods);
    } catch (error) {
      console.error('❌ Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddToCart = async (product, quantity = 1, selectedOptions = {}) => {
    try {
      const user = await api.auth.me();
      if (!user) return;

      const existing = await api.entities.StarCartItem.filter({
        user_id: user.id,
        product_id: product.id
      });

      if (existing.length > 0) {
        await api.entities.StarCartItem.update(existing[0].id, {
          quantity: existing[0].quantity + quantity,
          selected_options: selectedOptions
        });
      } else {
        await api.entities.StarCartItem.create({
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
    <div className="min-h-screen relative overflow-hidden bg-[#050608]">
      <SEO
        title="Home"
        description="Willkommen bei Nebula Shop - Dein Premium Store für Shisha, Vapes & Lifestyle."
        image="/images/hero-logo.png"
        url={window.location.href}
      />

      {/* Living Cosmic Background */}
      <CosmicHeroBackground />

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden">

        {/* Animated Noise Overlay */}
        <div className="absolute inset-0 noise-bg opacity-30 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32 flex flex-col items-center">

          {/* Logo & Headline Wrapper */}
          <div className="perspective-1000 mb-8 w-full text-center">
            {/* Floating 3D Logo */}
            <motion.div
              style={{
                x: logoX,
                y: logoY,
                rotateX: useTransform(logoY, [-35, 35], [5, -5]),
                rotateY: useTransform(logoX, [-35, 35], [-5, 5])
              }}
              className="inline-block relative z-20 transform-preserve-3d"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 50px rgba(var(--gold-rgb), 0.3)',
                    '0 0 100px rgba(var(--gold-rgb), 0.5)',
                    '0 0 50px rgba(var(--gold-rgb), 0.3)',
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] p-5 mx-auto relative glass-strong border-gold/30"
              >
                <div className="absolute inset-0 rounded-[3rem] overflow-hidden">
                  <motion.div
                    className="absolute inset-0 z-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  />
                </div>

                <img
                  src="/images/hero-logo.png"
                  alt="Nebula"
                  className="relative w-full h-full object-contain drop-shadow-2xl z-10"
                  style={{ filter: 'drop-shadow(0 0 25px rgba(var(--gold-rgb), 0.4))' }}
                />
              </motion.div>

              {/* Orbital Elements */}
              <motion.div
                animate={{ rotateZ: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-12 border border-gold/20 rounded-full z-0"
                style={{ rotateX: 65, scaleY: 0.4 }}
              />
              <motion.div
                animate={{ rotateZ: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-24 border border-purple-500/20 rounded-full z-0"
                style={{ rotateX: 65, scaleY: 0.4 }}
              />
            </motion.div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              className="mt-12"
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-4 leading-none tracking-tighter">
                <span className="block text-gradient-silver text-shadow-lg">
                  NEBULA
                </span>
                <div className="relative inline-block mt-2">
                  <TypewriterEffect
                    words={['SUPPLY', 'LUXURY', 'FUTURE', 'VIBES']}
                    className="block text-gradient-gold drop-shadow-2xl"
                    cursorClassName="bg-gold h-12 md:h-20 w-1 md:w-2"
                  />
                </div>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl md:text-2xl mt-8 max-w-2xl mx-auto font-medium text-secondary"
              >
                Premium Lifestyle • <span className="text-gold font-bold">Exklusiv für dich</span> ✨
              </motion.p>
            </motion.div>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 relative z-30"
          >
            <Link to={createPageUrl('Products')}>
              <MagneticButton className="group">
                <Button className="btn-gold h-16 px-12 text-lg rounded-2xl relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    Jetzt Shoppen
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Button>
              </MagneticButton>
            </Link>

            <Link to={createPageUrl('VIP')}>
              <MagneticButton>
                <Button className="btn-glass h-16 px-10 text-lg rounded-2xl border-gold/30 text-gold hover:bg-gold/10">
                  <Crown className="w-5 h-5 mr-2" />
                  VIP Werden
                </Button>
              </MagneticButton>
            </Link>
          </motion.div>

          {/* New Delivery Bar (Glass) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="w-full max-w-4xl"
          >
            <DeliveryBar />
          </motion.div>

          {/* Trust Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 text-center w-full max-w-5xl"
          >
            {[
              { val: "500+", label: "Produkte", icon: Package },
              { val: "10k+", label: "Kunden", icon: Star },
              { val: "24/7", label: "Support", icon: Zap },
              { val: "100%", label: "Premium", icon: Trophy },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group cursor-default">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:border-gold/30 transition-colors">
                  <stat.icon className="w-6 h-6 text-zinc-400 group-hover:text-gold transition-colors" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{stat.val}</div>
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>

        </div>

        {/* Marquee at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity duration-700">
          <InfiniteMarquee />
        </div>
      </section>


      {/* --- DEPARTMENTS SECTION --- */}
      <section className="py-32 relative z-10 bg-[#050608]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <AnimatedSection className="mb-16 text-center">
            <span className="vip-badge mb-6">Explore Our Worlds</span>
            <h2 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tight">
              Kategorien
            </h2>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Tauche ein in unsere kuratierten Kollektionen für das ultimative Erlebnis.
            </p>
          </AnimatedSection>

          <div className="min-h-[500px]">
            {loadingDepts ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[500px]">
                <div className="md:col-span-2 md:row-span-2 skeleton rounded-3xl" />
                <div className="skeleton rounded-3xl" />
                <div className="skeleton rounded-3xl" />
                <div className="skeleton rounded-3xl" />
                <div className="skeleton rounded-3xl" />
              </div>
            ) : (
              <BentoGrid
                departments={departments}
                productCounts={departmentProductCounts}
              />
            )}
          </div>

          <div className="text-center mt-12">
            <Link to={createPageUrl('Products')}>
              <Button className="btn-glass px-8 h-12 rounded-xl text-sm uppercase tracking-widest border-white/10 hover:border-gold/50">
                Alle Produkte anzeigen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- CATEGORY PRODUCTS --- */}
      {departments.map((department, index) => (
        <AnimatedSection key={department.id} className="relative z-10">
          <CategoryProductsSection
            department={department}
            products={departmentProducts[department.id] || []}
            loading={loadingDeptProducts[department.id] || false}
            onQuickView={(p) => {
              setQuickViewProduct(p);
              setIsQuickViewOpen(true);
            }}
            onRetry={() => loadDepartmentProducts()}
          />
        </AnimatedSection>
      ))}

      {/* --- FRESH DROPS --- */}
      <AnimatedSection className="relative z-10 py-10">
        <FreshDropsSection
          products={products}
          loading={loadingProducts}
          onQuickView={(p) => {
            setQuickViewProduct(p);
            setIsQuickViewOpen(true);
          }}
        />
      </AnimatedSection>

      {/* --- VIDEO SPOTLIGHT --- */}
      <div className="relative z-10 my-20">
        <VideoSpotlight />
      </div>

      {/* --- VIP CLUB TEASER --- */}
      <section className="py-32 relative z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 relative z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="group relative rounded-[3rem] p-12 md:p-20 text-center overflow-hidden border border-gold/30"
          >
            {/* Glass Background */}
            <div className="absolute inset-0 glass-strong opacity-80" />

            {/* Animated Golden Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/5 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-gold to-gold-light rounded-3xl flex items-center justify-center shadow-lg shadow-gold/20"
              >
                <Crown className="w-12 h-12 text-black" />
              </motion.div>

              <h2 className="text-5xl md:text-7xl font-black mb-6 text-gradient-gold">
                NEBULA VIP
              </h2>
              <p className="text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
                Werde Teil der Elite. Erhalte <span className="text-white font-bold">Early Access</span>, exklusive <span className="text-white font-bold">Drops</span> und <span className="text-white font-bold">Secret Deals</span>, die nur für Mitglieder sichtbar sind.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link to={createPageUrl('VIP')}>
                  <Button className="btn-gold h-14 px-10 text-lg rounded-xl shadow-lg shadow-gold/20">
                    Jetzt Beitreten
                  </Button>
                </Link>
                <Link to={createPageUrl('Login')}>
                  <Button className="h-14 px-10 text-lg rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all">
                    Einloggen
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- MODALS --- */}
      <UnifiedProductModal
        product={quickViewProduct}
        open={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
        mode="full"
      />
    </div>
  );
}