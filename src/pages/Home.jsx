import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { api } from '@/api';
import { Crown, Sparkles, Zap, Package, Star, TrendingUp, Filter } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import UnifiedProductModal from '../components/products/UnifiedProductModal';
import DeliveryBar from '../components/delivery/DeliveryBar';
import VideoSpotlight from '../components/home/VideoSpotlight';
import TypewriterEffect from '@/components/ui/TypewriterEffect';
import CosmicHeroBackground from '../components/home/CosmicHeroBackground';
import InfiniteMarquee from '../components/home/InfiniteMarquee';
import MagneticButton from '@/components/ui/MagneticButton';
import SEO from '@/components/seo/SEO';

// Antigravity Components
import AntigravityProductCard from '../components/antigravity/AntigravityProductCard';
import CategoryTile from '../components/antigravity/CategoryTile';
import SectionHeader from '../components/antigravity/SectionHeader';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

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
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Bestseller Section State
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadDepartments();
    loadProducts();
  }, []);

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

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      // Fetching more products to populate different sections
      let prods = await api.entities.Product.list('-created_at', 24);

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
      if (!user) return; // Should likely redirect to login or show toast

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
      window.location.reload(); // Simple reload for now
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Filter Logic for Bestsellers
  const getFilteredBestsellers = () => {
    if (activeTab === 'under50') return products.filter(p => p.price < 50).slice(0, 8);
    if (activeTab === 'trending') return products.slice(0, 8); // Mocking trending with just products for now
    return products.slice(8, 16); // Different set for "All/Bestseller"
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050608]">
      <SEO
        title="Home"
        description="Willkommen bei Nebula Shop - Dein Premium Store für Shisha, Vapes & Lifestyle."
        image="/images/hero-logo.png"
        url={window.location.href}
      />

      <CosmicHeroBackground />
      {/* Global Vignette */}
      <div className="fixed inset-0 bg-gradient-radial from-transparent via-black/20 to-black/80 pointer-events-none z-0" />

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 py-20 flex flex-col items-center text-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8 relative"
          >
            <div className="absolute inset-0 bg-gold/20 blur-[100px] rounded-full" />
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black leading-none tracking-tighter text-white relative z-10 drop-shadow-2xl">
              NEBULA
            </h1>
            <div className="text-2xl md:text-4xl font-bold text-gold tracking-[0.5em] mt-2 uppercase">
              <TypewriterEffect words={['Future', 'Supply', 'Lifestyle']} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-6 mt-12 relative z-20"
          >
            <Link to={createPageUrl('Products')}>
              <MagneticButton>
                <Button className="h-16 px-12 text-lg rounded-full btn-gold font-black tracking-wider shadow-[0_0_40px_rgba(214,178,94,0.4)] hover:shadow-[0_0_60px_rgba(214,178,94,0.6)] transition-all">
                  JETZT SHOPPEN
                </Button>
              </MagneticButton>
            </Link>
          </motion.div>

          {/* Delivery Bar moved here */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-20 w-full max-w-3xl"
          >
            <DeliveryBar />
          </motion.div>
        </div>

        {/* Marquee at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 opacity-30">
          <InfiniteMarquee />
        </div>
      </section>


      {/* --- SECTION A: CATEGORIES --- */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <SectionHeader
              title="Kategorien"
              subtitle="Explore Our Worlds"
              linkTo={createPageUrl('Products')}
            />

            {/* Desktop Grid / Mobile Slider */}
            <div className="hidden md:grid grid-cols-4 gap-6">
              {/* If we have specific highlights, we can span cols. For now standard grid. */}
              {departments.slice(0, 8).map((dept, i) => (
                <CategoryTile
                  key={dept.id}
                  category={dept}
                  className={i === 0 || i === 3 ? "col-span-2 aspect-[2/1]" : "aspect-square"}
                />
              ))}
              {departments.length === 0 && Array(4).fill(0).map((_, i) => (
                <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-3xl" />
              ))}
            </div>

            {/* Mobile Slider using Carousel */}
            <div className="md:hidden">
              <Carousel className="w-full">
                <CarouselContent className="-ml-4">
                  {departments.map(dept => (
                    <CarouselItem key={dept.id} className="pl-4 basis-2/3">
                      <CategoryTile category={dept} aspect="square" />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* --- SECTION B: FRESH DROPS --- */}
      <section className="py-24 relative z-10 bg-[#0E1015]/50 border-y border-white/5 backdrop-blur-sm">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <SectionHeader
              title="Fresh Drops"
              subtitle="New Arrivals"
              linkTo="/products?sort=newest"
            />

            <Carousel className="w-full">
              <CarouselContent className="-ml-4 pb-10">
                {products.slice(0, 10).map((product) => (
                  <CarouselItem key={product.id} className="pl-4 basis-[80%] md:basis-[40%] lg:basis-[25%]">
                    <div className="h-full pr-4"> {/* Padding for hover overflow safety/shadows */}
                      <AntigravityProductCard
                        product={product}
                        onQuickView={(p) => { setQuickViewProduct(p); setIsQuickViewOpen(true); }}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </Carousel>
          </AnimatedSection>
        </div>
      </section>

      {/* --- SECTION C: BESTSELLERS / TRENDING --- */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-[2px] bg-gold/50 shadow-[0_0_10px_#D6B25E]" />
                  <span className="text-gold text-xs md:text-sm font-bold uppercase tracking-[0.2em]">Curated For You</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none uppercase">
                  Highlights
                </h2>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap gap-2">
                {['all', 'trending', 'under50'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider border transition-all ${activeTab === tab
                        ? 'bg-gold text-black border-gold shadow-[0_0_20px_rgba(214,178,94,0.3)]'
                        : 'bg-transparent text-zinc-400 border-white/10 hover:border-gold/50 hover:text-white'
                      }`}
                  >
                    {tab === 'all' ? 'Bestseller' : tab === 'under50' ? 'Under 50€' : 'Trending'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Highlight Banner (Left or Right - let's do Left for 1/4 width or Right?) */}
              {/* Let's try: 3 cols grid + 1 col banner on the right? Or Banner First. */}

              {/* Grid Logic */}
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredBestsellers().map(product => (
                  <AntigravityProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => { setQuickViewProduct(p); setIsQuickViewOpen(true); }}
                  />
                ))}
              </div>

              {/* Sticky/Fixed Highlight Banner */}
              <div className="lg:col-span-1 hidden lg:block">
                <div className="sticky top-24 h-[600px] rounded-3xl overflow-hidden relative group">
                  <img
                    src="/images/highlight-banner.jpg"
                    onError={(e) => e.target.src = "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1000&auto=format&fit=crop"} // Fallback
                    alt="Highlight"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-center items-center pb-12">
                    <span className="bg-gold text-black text-xs font-black uppercase px-3 py-1 rounded mb-4">
                      Top Pick
                    </span>
                    <h3 className="text-3xl font-black text-white mb-4 leading-none">
                      NEBULA<br />ELITE
                    </h3>
                    <Link to="/products?category=shishas">
                      <Button className="btn-glass border-white/30 text-white hover:bg-white hover:text-black hover:border-white w-full">
                        Entdecken
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </AnimatedSection>
        </div>
      </section>

      {/* --- VIDEO SPOTLIGHT --- */}
      <div className="relative z-10 my-20">
        <VideoSpotlight />
      </div>

      {/* --- TRUST ICONS --- */}
      <section className="py-16 border-t border-white/5 bg-[#08090C]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: Zap, label: "Blitzversand", sub: "1-3 Werktage" },
            { icon: Crown, label: "Premium Quality", sub: "Certified Goods" },
            { icon: Package, label: "Sicher verpackt", sub: "Discreet & Safe" },
            { icon: Sparkles, label: "Exklusive Drops", sub: "Members Only" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-gold/50 group-hover:bg-gold/10 transition-all duration-300">
                <item.icon className="w-8 h-8 text-zinc-400 group-hover:text-gold transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">{item.label}</h4>
                <p className="text-zinc-500 text-xs uppercase tracking-wider">{item.sub}</p>
              </div>
            </div>
          ))}
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
