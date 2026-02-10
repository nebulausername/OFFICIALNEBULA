// Nebula Redesign - Premium Homepage
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '../utils';
import { api } from '@/api';
import { Crown, Sparkles, Zap, Package, LayoutGrid, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  getMockProducts,
  MOCK_CATEGORIES,
  BESTSELLERS,
  TRENDING,
  UNDER_50
} from '../utils/mockData';

// Components
import UnifiedProductModal from '../components/products/UnifiedProductModal';
import DeliveryBar from '../components/delivery/DeliveryBar';
import VideoSpotlight from '../components/home/VideoSpotlight';
import TypewriterEffect from '@/components/ui/TypewriterEffect';
import CosmicHeroBackground from '../components/home/CosmicHeroBackground';
import InfiniteMarquee from '../components/home/InfiniteMarquee';
import MagneticButton from '@/components/ui/MagneticButton';
import SEO from '@/components/seo/SEO';
import MotionWrapper from '@/components/ui/MotionWrapper';
import WelcomeOverlay from '@/components/onboarding/WelcomeOverlay';
import IntroWizard from '@/components/onboarding/IntroWizard';

import { aiService } from '@/services/AIService';
import { realtimeService } from '@/services/RealtimeService';

// Antigravity Components
import AntigravityProductCard from '../components/antigravity/AntigravityProductCard';
import CategoryTile from '../components/antigravity/CategoryTile';
import SectionHeader from '../components/antigravity/SectionHeader';
import FeaturedDropList from '../components/home/FeaturedDropList';
import ProductCardLite from '../components/antigravity/ProductCardLite';
import { ProductCardSkeleton, CategoryTileSkeleton } from '../components/antigravity/Skeletons';
import NebulaFooter from '../components/home/NebulaFooter';
import FreshDropsSection from '../components/home/FreshDropsSection';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoryApi, setCategoryApi] = useState(null); // Added for carousel API
  const [freshDropsApi, setFreshDropsApi] = useState(null); // Added for Fresh Drops API
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Onboarding State
  const { user, isAuthenticated } = useAuth();
  const [onboardingStep, setOnboardingStep] = useState('none'); // 'welcome', 'intro', 'none'

  useEffect(() => {
    if (isAuthenticated && user) {
      const hasSeenOnboarding = localStorage.getItem(`onboarding_complete_${user.id}`);
      if (!hasSeenOnboarding) {
        // Delay slightly for dramatic effect
        setTimeout(() => setOnboardingStep('welcome'), 1000);
      }
    }
  }, [isAuthenticated, user]);

  const handleWelcomeStart = () => {
    setOnboardingStep('intro');
  };

  const handleWelcomeSkip = () => {
    if (user) {
      localStorage.setItem(`onboarding_complete_${user.id}`, 'true');
    }
    setOnboardingStep('none');
  };

  const handleIntroComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_complete_${user.id}`, 'true');
    }
    setOnboardingStep('none');
  };

  // AI & Realtime State
  const [aiHypeText, setAiHypeText] = useState("");
  const [activeViewers, setActiveViewers] = useState(0);

  // Mouse Parallax for Hero
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const moveX = clientX - window.innerWidth / 2;
    const moveY = clientY - window.innerHeight / 2;
    setMousePosition({ x: moveX, y: moveY });
  };

  // Smooth Parallax Springs
  const springConfig = { damping: 25, stiffness: 150 };
  const moveX = useSpring(0, springConfig);
  const moveY = useSpring(0, springConfig);

  useEffect(() => {
    moveX.set(mousePosition.x * 0.05);
    moveY.set(mousePosition.y * 0.05);
  }, [mousePosition, moveX, moveY]);

  // Scroll Animations
  const { scrollY } = useScroll();
  const heroTextY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Content Organization
  const [activeTab, setActiveTab] = useState('bestseller');

  useEffect(() => {
    loadDepartments();
    loadProducts();
  }, []);

  const loadDepartments = async () => {
    try {
      const depts = await api.entities.Department.list('sort_order');
      // Enrich with mock data for "Live" feel
      const enrichedDepts = (Array.isArray(depts) ? depts : []).map(d => ({
        ...d,
        product_count: Math.floor(Math.random() * 50) + 10,
        description: "Premium Selection from the Nebula Universe."
      }));

      // FALLBACK: If no departments, use MOCK_CATEGORIES
      if (enrichedDepts.length < 4) {
        setDepartments(MOCK_CATEGORIES);
      } else {
        setDepartments(enrichedDepts);
      }
    } catch (error) {
      console.error('❌ Error loading departments:', error);
      // Use mock categories on error
      setDepartments(MOCK_CATEGORIES);
    } finally {
      setLoadingDepts(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      // Fetch more to populate all new sections densely
      let prods = await api.entities.Product.list('-created_at', 40);

      if (!Array.isArray(prods)) {
        prods = (prods && prods.data) ? prods.data : [];
      }

      // AGGRESSIVE FALLBACK / HYBRID MODE
      // If we have very few products, the homepage looks broken. 
      // We will ensure we always have at least 12 products for the layout.
      if (prods.length < 12) {
        console.log('⚠️ Low product count (' + prods.length + '), augmenting with Mock Data.');
        const missingCount = 12 - prods.length;
        const mocks = getMockProducts(20).slice(0, 15); // Get enough mocks
        // Filter out mocks that might conflict by ID if necessary, but mocks have 'mock-' prefix
        prods = [...prods, ...mocks];
      }

      setProducts(prods);

      // Set Featured Product and generate AI Hype
      if (prods.length > 0) {
        setFeaturedProduct(prods[0]);
        // Trigger AI Hype generation
        aiService.getProductHype(prods[0]).then(hype => {
          setAiHypeText(hype);
        });

        // Subscribe to live viewers for the homepage (simulated "store traffic")
        realtimeService.subscribeToProduct('homepage-traffic', (data) => {
          if (data.type === 'viewers') {
            // Multiply for "store wide" feeling
            setActiveViewers(prev => Math.max(prev, data.count * 12 + 42));
          }
        });
      }
    } catch (error) {
      console.error('❌ Error loading products, using fallback:', error);
      setProducts(getMockProducts(20));
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddToCart = async (product, quantity = 1, selectedOptions = {}) => {
    try {
      const user = await api.auth.me();
      if (!user) {
        // Allow mock add to cart (or redirect to login)
        console.warn('User not logged in or using mock product');
        return;
      }

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

  // Filter Logic - using proper mock collections as fallback
  const getFilteredProducts = () => {
    if (activeTab === 'under50') {
      const filtered = products.filter(p => parseFloat(p.price) < 50);
      return filtered.length > 0 ? filtered.slice(0, 6) : UNDER_50.slice(0, 6);
    }
    if (activeTab === 'trending') {
      return products.length > 0 ? products.slice(0, 6) : TRENDING.slice(0, 6);
    }
    // "Bestseller" default
    if (products.length >= 6) {
      return products.slice(0, 6);
    }
    return BESTSELLERS.slice(0, 6);
  };

  return (
    <MotionWrapper className="relative min-h-screen bg-[#050608] text-white overflow-x-hidden selection:bg-gold/30">

      {/* SEO */}
      <SEO
        title="Nebula | Future Culture Supply"
        description="Discover the future of streetwear. Premium drops, exclusive designs, and a culture that defines tomorrow."
        image="/og-image.jpg"
        url={window.location.href}
      />

      {/* --- HERO SECTION --- */}
      <section className="relative w-full h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
        {/* Live Cosmic Background */}
        <ErrorBoundary>
          <CosmicHeroBackground />
        </ErrorBoundary>

        <div className="absolute inset-0 z-10 container mx-auto px-4 flex flex-col justify-center items-center text-center">
          <div className="relative z-20">
            <motion.div
              style={{ y: heroTextY, scale: heroScale, opacity: heroOpacity }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-gold" />
                <span className="text-gold font-bold tracking-[0.3em] text-xs uppercase glow-gold">
                  {user ? `Willkommen zurück` : 'Official Supply'}
                </span>
                <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-gold" />
              </div>

              <motion.h1
                className="text-6xl sm:text-8xl xl:text-9xl font-black leading-[0.9] tracking-tighter text-white drop-shadow-2xl relative z-10 mix-blend-overlay"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ textShadow: '0 0 80px rgba(214,178,94,0.5)' }}
              >
                {user ? (user.user_metadata?.full_name?.split(' ')[0] || 'LEGEND') : 'NEBULA'}
              </motion.h1>
              <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 tracking-[0.5em] mt-4 uppercase drop-shadow-lg">
                <TypewriterEffect
                  words={user ? ["READY TO COP?", "CHECK THE DROP", "STAY HYDRATED"] : ["FUTURE", "CULTURE", "SUPPLY"]}
                  className="text-white"
                  cursorClassName="bg-gold"
                />
              </div>

              {/* Next Action Card for User */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="mt-12 p-1 rounded-2xl bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700/50 backdrop-blur-md"
                >
                  <div className="bg-[#0A0C10]/80 rounded-xl p-4 flex items-center gap-4 pr-6">
                    <div className="w-10 h-10 rounded-full bg-[#D6B25E]/20 flex items-center justify-center text-[#D6B25E]">
                      <Sparkles size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Next Mission</div>
                      <div className="font-bold text-white">Dein Feed checken</div>
                    </div>
                    <ChevronRight className="text-zinc-600 ml-2" size={16} />
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            >
              {/* Left Column: CTA & Trust */}
              <div className="lg:col-span-7 flex flex-col items-center lg:items-start gap-10 order-2 lg:order-1">

                {/* Ultra Bright "Geil" Button */}
                <MagneticButton className="min-w-[240px] group relative" onClick={() => window.location.href = '/products'}>
                  <div className="absolute inset-0 bg-gold blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                  <Link to="/products" className="relative z-10 w-full h-full bg-gold hover:bg-white text-black flex items-center justify-center px-10 py-5 rounded-full transition-all duration-300 border-2 border-transparent hover:border-gold hover:scale-105">
                    <span className="flex items-center gap-3 font-black text-lg tracking-widest uppercase">
                      Shop Drops <Zap className="w-5 h-5 fill-black group-hover:fill-gold transition-colors" />
                    </span>
                  </Link>
                </MagneticButton>

                {/* Trust Row - Brighter & More Visible */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-zinc-300 text-sm font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-2 group hover:text-white transition-colors">
                    <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-gold/20"><Zap className="w-4 h-4 text-gold" /></div>
                    Blitzversand
                  </span>
                  <span className="flex items-center gap-2 group hover:text-white transition-colors">
                    <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-gold/20"><Crown className="w-4 h-4 text-gold" /></div>
                    Premium Selection
                  </span>
                  <span className="flex items-center gap-2 group hover:text-white transition-colors">
                    <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-gold/20"><Package className="w-4 h-4 text-gold" /></div>
                    Discreet Pkg
                  </span>
                </div>
              </div>

              {/* Right Column: Featured Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-5 w-full min-h-[400px] lg:h-[500px] glass-card p-6 flex flex-col order-1 lg:order-2"
              >
                <FeaturedDropList
                  products={products}
                  onQuickAdd={(p) => { setQuickViewProduct(p); setIsQuickViewOpen(true); }}
                />
              </motion.div>
            </motion.div>

            {/* Delivery Bar Helper */}
            <div className="mt-16 w-full max-w-3xl mx-auto lg:mx-0">
              <DeliveryBar />
            </div>
          </div>
        </div>

        {/* Marquee Background Element */}
        <div className="absolute bottom-10 left-0 right-0 z-0 opacity-20 pointer-events-none">
          <InfiniteMarquee />
        </div>
      </section >

      {/* --- SECTION: CATEGORIES --- */}
      < section className="py-20 relative z-10" >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <SectionHeader title="Explore Categories" subtitle="Find Your Vibe" linkTo={createPageUrl('Products')} />

          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {loadingDepts ? (
              Array(8).fill(0).map((_, i) => <CategoryTileSkeleton key={i} />)
            ) : (
              departments.slice(0, 8).map((dept, index) => (
                <CategoryTile
                  key={dept.id}
                  category={dept}
                  className="aspect-square"
                />
              ))
            )}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <Carousel setApi={setCategoryApi} className="w-full">
              <CarouselContent className="-ml-4">
                {loadingDepts ? Array(4).fill(0).map((_, i) => (
                  <CarouselItem key={i} className="pl-4 basis-2/3"><CategoryTileSkeleton /></CarouselItem>
                )) : departments.map(dept => (
                  <CarouselItem key={dept.id} className="pl-4 basis-2/3">
                    <CategoryTile category={dept} className="aspect-square" />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </section >

      {/* --- SECTION: FRESH DROPS (NEW) --- */}
      < FreshDropsSection
        products={products}
        loading={loadingProducts}
        onQuickView={(p) => { setQuickViewProduct(p); setIsQuickViewOpen(true); }
        }
      />

      {/* --- VIDEO SPOTLIGHT --- */}
      <div className="py-12">
        <VideoSpotlight />
      </div>

      {/* --- SECTION: HIGHLIGHTS (Split View) --- */}
      <section className="py-20 relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-12 gap-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2">Editor's Picks</h2>
              <p className="text-zinc-400">Unsere persönlichen Favoriten und Bestseller der Woche.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['bestseller', 'trending', 'under50'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider border transition-all ${activeTab === tab
                    ? 'bg-gold text-black border-gold shadow-[0_0_15px_rgba(214,178,94,0.4)]'
                    : 'bg-transparent text-zinc-400 border-white/10 hover:border-gold/30 hover:text-white'
                    }`}
                >
                  {tab === 'under50' ? 'Under 50€' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Product Grid (Left) */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingProducts ? Array(6).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
                : getFilteredProducts().length > 0 ? (
                  getFilteredProducts().map(product => (
                    <AntigravityProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => { setQuickViewProduct(p); setIsQuickViewOpen(true); }}
                    />
                  ))
                ) : (
                  /* Premium Empty State */
                  <div className="col-span-full py-16 text-center border border-gold/20 rounded-3xl bg-gradient-to-b from-gold/5 to-transparent">
                    <Sparkles className="w-12 h-12 text-gold mx-auto mb-4 opacity-50" />
                    <p className="text-zinc-400 mb-2">Gerade keine Produkte in dieser Kollektion.</p>
                    <p className="text-zinc-500 text-sm mb-6">Aber unsere Bestseller sind ready!</p>
                    <div className="flex gap-3 justify-center">
                      <Link to="/products?sort=bestseller">
                        <Button className="btn-gold">Bestseller ansehen</Button>
                      </Link>
                      <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                        <Bell className="w-4 h-4 mr-2" /> Drop Alarm
                      </Button>
                    </div>
                  </div>
                )}
            </div>

            {/* Sticky Highlight Card (Right) */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-28 h-[600px] w-full rounded-3xl overflow-hidden relative group border border-white/10">
                <div className="absolute inset-0 bg-[#0E1015]">
                  <img
                    src="https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800&auto=format&fit=crop"
                    onError={(e) => e.currentTarget.src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop"}
                    alt="Nebula Premium Collection"
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>

                <div className="absolute inset-0 p-8 flex flex-col justify-end text-center items-center pb-12">
                  <span className="bg-gold text-black text-xs font-black uppercase px-3 py-1 rounded mb-4">
                    Staff Pick
                  </span>
                  <h3 className="text-3xl font-black text-white leading-none mb-2">
                    TOP<br />TIER
                  </h3>
                  <p className="text-zinc-300 text-sm mb-6 max-w-[200px]">
                    Die beliebtesten Produkte der Woche.
                  </p>
                  <Link to="/products?sort=bestseller" className="w-full">
                    <Button className="w-full glass-gloss border-white/30 text-white hover:bg-white hover:text-black">
                      View Collection
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TRUST FOOTER (NEW) --- */}
      <NebulaFooter />

      {/* --- MODALS --- */}
      <UnifiedProductModal
        product={quickViewProduct}
        open={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
        onSwitchProduct={(p) => setQuickViewProduct(p)}
        mode="full"
      />
      <AnimatePresence>
        {onboardingStep === 'welcome' && (
          <WelcomeOverlay
            userName={user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
            onStart={handleWelcomeStart}
            onSkip={handleWelcomeSkip}
          />
        )}
        {onboardingStep === 'intro' && (
          <IntroWizard
            onComplete={handleIntroComplete}
          />
        )}
      </AnimatePresence>
    </MotionWrapper >
  );
}
