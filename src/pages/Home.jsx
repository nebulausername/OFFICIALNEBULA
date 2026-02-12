// Nebula Redesign - Premium Homepage
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '../utils';
import { api } from '@/api';
import { Crown, Sparkles, Zap, Package, LayoutGrid, Bell, ChevronLeft, ChevronRight, Shield, Truck, Star, Heart, Gift } from 'lucide-react';
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
import { useCart } from '@/contexts/CartContext';

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
    let timer;
    if (isAuthenticated && user) {
      const hasSeenOnboarding = localStorage.getItem(`onboarding_complete_${user.id}`);
      if (!hasSeenOnboarding) {
        // Delay slightly for dramatic effect
        timer = setTimeout(() => setOnboardingStep('welcome'), 1000);
      }
    }
    return () => clearTimeout(timer);
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

  const handleIntroComplete = async (data) => {
    if (user) {
      localStorage.setItem(`onboarding_complete_${user.id}`, 'true');

      // Persist preferences if data is provided
      if (data) {
        try {
          await api.auth.updateMe({
            user_metadata: {
              ...user.user_metadata,
              preferences: data,
              onboarding_completed_at: new Date().toISOString()
            }
          });
          // console.log("Preferences saved:", data);
        } catch (e) {
          console.warn("Failed to save preferences:", e);
        }
      }
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

  // Use CartContext for proper cart management
  const { addToCart } = useCart();

  const handleAddToCart = async (cartData) => {
    try {
      // cartData comes from UnifiedProductModal with full options
      if (cartData && cartData.product_id) {
        await addToCart(cartData.product_id, cartData.quantity || 1, cartData.selected_options || {});
      }
      setIsQuickViewOpen(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleQuickAdd = async (product) => {
    if (!product || !product.id) return;
    // For quick add from product cards, add 1 unit with no options
    await addToCart(product.id, 1, {});
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
      <section className="relative w-full min-h-[90vh] md:min-h-[800px] flex flex-col overflow-hidden pt-20 pb-8 md:pt-28 md:pb-12">
        {/* Live Cosmic Background */}
        <ErrorBoundary>
          <CosmicHeroBackground />
        </ErrorBoundary>

        <div className="relative z-10 container mx-auto px-4 flex flex-col flex-1">
          <div className="relative z-20 flex flex-col flex-1">
            {/* Top Section: Title & Typewriter */}
            <motion.div
              style={{ scale: heroScale, opacity: heroOpacity }}
              className="flex flex-col items-center text-center pt-4 md:pt-8"
            >
              <div className="flex items-center gap-3 mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-gold" />
                <span className="text-gold font-bold tracking-[0.3em] text-xs uppercase glow-gold">
                  {user ? `Willkommen zurück` : 'Official Supply'}
                </span>
                <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-gold" />
              </div>

              <motion.h1
                className="text-5xl sm:text-7xl md:text-8xl xl:text-9xl font-black leading-[0.85] tracking-tighter text-white relative z-10 glow-gold-strong"
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ textShadow: '0 0 80px rgba(214,178,94,0.5), 0 0 160px rgba(214,178,94,0.2)' }}
              >
                {user ? (user.user_metadata?.full_name?.split(' ')[0] || 'LEGEND') : 'NEBULA'}
              </motion.h1>
              <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 tracking-[0.2em] md:tracking-[0.4em] mt-3 uppercase drop-shadow-lg min-h-[2em]">
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
                  className="mt-6 p-1 rounded-2xl bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700/50 backdrop-blur-md"
                >
                  <Link to="/products" className="bg-[#0A0C10]/80 rounded-xl p-4 flex items-center gap-4 pr-6 hover:bg-[#0A0C10] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#D6B25E]/20 flex items-center justify-center text-[#D6B25E]">
                      <Sparkles size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Next Mission</div>
                      <div className="font-bold text-white">Shop die neuesten Drops</div>
                    </div>
                    <ChevronRight className="text-zinc-600 ml-2" size={16} />
                  </Link>
                </motion.div>
              )}
            </motion.div>

            {/* Main Content Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 sm:mt-10 lg:mt-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start flex-1"
            >
              {/* Left Column: CTA & Trust */}
              <div className="lg:col-span-7 flex flex-col items-center lg:items-start gap-8 order-2 lg:order-1">

                {/* Ultra Bright "Geil" Button */}
                <MagneticButton className="min-w-[220px] sm:min-w-[260px] group relative" onClick={() => window.location.href = '/products'}>
                  <div className="absolute inset-0 bg-gold blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-700 animate-glow-gold-pulse" />
                  <Link to="/products" className="relative z-10 w-full h-full bg-gradient-to-r from-[#F2D27C] to-[#D6B25E] hover:from-white hover:to-white text-black flex items-center justify-center px-12 py-5 rounded-full transition-all duration-500 border-2 border-transparent hover:border-gold hover:scale-105 shadow-[0_0_30px_rgba(214,178,94,0.4)]">
                    <span className="flex items-center gap-3 font-black text-lg tracking-widest uppercase">
                      Shop Drops <Zap className="w-5 h-5 fill-black group-hover:fill-gold transition-colors" />
                    </span>
                  </Link>
                </MagneticButton>

                {/* Trust Row */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-x-4 sm:gap-x-8 gap-y-3 text-zinc-200 text-xs sm:text-sm font-bold uppercase tracking-wider sm:tracking-widest">
                  {[
                    { icon: Zap, label: 'Blitzversand' },
                    { icon: Crown, label: 'Premium Selection' },
                    { icon: Package, label: 'Discreet Pkg' },
                  ].map((item, i) => (
                    <span key={i} className="flex items-center gap-2.5 group hover:text-white transition-all duration-300">
                      <div className="p-2 rounded-full bg-gold/15 border border-gold/30 group-hover:bg-gold/25 group-hover:border-gold/50 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(214,178,94,0.3)]">
                        <item.icon className="w-4 h-4 text-gold" />
                      </div>
                      {item.label}
                    </span>
                  ))}
                </div>

                {/* Delivery Bar */}
                <div className="w-full max-w-full lg:max-w-xl">
                  <DeliveryBar />
                </div>
              </div>

              {/* Right Column: Featured Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-5 w-full min-h-[350px] lg:h-[460px] glass-panel rounded-2xl p-5 flex flex-col order-1 lg:order-2"
              >
                <FeaturedDropList
                  products={products}
                  onQuickAdd={(p) => { setQuickViewProduct(p); setIsQuickViewOpen(true); }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Marquee Background Element — Higher Opacity */}
        <div className="absolute bottom-4 left-0 right-0 z-0 opacity-40 pointer-events-none">
          <InfiniteMarquee />
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-4" />

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

      {/* Section Divider */}
      <div className="section-divider my-4" />

      {/* --- SECTION: FRESH DROPS (NEW) --- */}
      < FreshDropsSection
        products={products}
        loading={loadingProducts}
        onQuickView={(p) => { setQuickViewProduct(p); setIsQuickViewOpen(true); }
        }
      />

      {/* Section Divider */}
      <div className="section-divider my-4" />

      {/* --- VIDEO SPOTLIGHT --- */}
      <div className="py-12">
        <VideoSpotlight />
      </div>

      {/* Section Divider */}
      <div className="section-divider my-4" />

      {/* --- SECTION: HIGHLIGHTS (Split View) --- */}
      <section className="py-20 relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-12 gap-6 lg:gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-[2px] bg-gradient-to-r from-gold/80 to-gold/20 shadow-[0_0_10px_#D6B25E]" />
                <span className="text-gold text-xs font-bold uppercase tracking-[0.25em]" style={{ textShadow: '0 0 15px rgba(214,178,94,0.3)' }}>Kuratiert</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">Editor's Picks</h2>
              <p className="text-zinc-400 text-sm sm:text-base">Unsere persönlichen Favoriten und Bestseller der Woche.</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide whitespace-nowrap -mx-1 px-1">
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

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Product Grid (Left) */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-3 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
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

            {/* Sticky Highlight Card (Right — Desktop Only) */}
            <div className="hidden lg:block lg:col-span-1">
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

      {/* --- WHY NEBULA USP SECTION --- */}
      <section className="py-16 sm:py-24 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 relative">
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-10 h-[2px] bg-gradient-to-r from-transparent to-gold/60" />
              <span className="text-gold text-xs font-bold uppercase tracking-[0.25em]" style={{ textShadow: '0 0 15px rgba(214,178,94,0.3)' }}>Warum Nebula?</span>
              <span className="w-10 h-[2px] bg-gradient-to-l from-transparent to-gold/60" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">Dein Premium Supply</h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">Mehr als ein Shop — eine Community für Streetwear Kultur.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Shield, title: '100% Sicher', desc: 'Verschlüsselte Zahlung & diskreter Versand', color: 'from-emerald-500 to-green-600' },
              { icon: Truck, title: 'Blitz-Versand', desc: 'Express Lieferung in 1-3 Werktagen', color: 'from-blue-500 to-cyan-500' },
              { icon: Star, title: 'Premium Only', desc: 'Nur handverlesene Top-Produkte', color: 'from-gold to-yellow-400' },
              { icon: Gift, title: 'VIP Rewards', desc: 'Punkte sammeln & exklusive Drops', color: 'from-purple-500 to-pink-500' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative glass-panel rounded-2xl p-5 sm:p-6 text-center border border-white/5 hover:border-gold/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(214,178,94,0.1)]"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-white font-bold text-sm sm:text-base mb-1.5 group-hover:text-gold transition-colors">{item.title}</h3>
                <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-4" />

      {/* --- CTA Banner Section --- */}
      <section className="py-12 sm:py-16 relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0E1015] via-[#141820] to-[#0E1015] border border-gold/20 p-8 sm:p-12 lg:p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(214,178,94,0.08)_0%,transparent_70%)]" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-300 to-gold">Nebula</span></h2>
              <p className="text-zinc-400 text-sm sm:text-base mb-8 max-w-md mx-auto">Werde Teil der Community und verpasse keine Drops, VIP-Deals & exklusive Releases.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link to="/products" className="px-10 py-4 bg-gradient-to-r from-[#F2D27C] to-[#D6B25E] hover:from-white hover:to-white text-black rounded-full font-black text-base tracking-wider uppercase transition-all duration-300 shadow-[0_0_25px_rgba(214,178,94,0.3)] hover:shadow-[0_0_40px_rgba(214,178,94,0.5)]">
                  Jetzt Shoppen
                </Link>
                <Link to="/VIP" className="px-10 py-4 border border-gold/30 text-gold hover:bg-gold/10 rounded-full font-bold text-sm tracking-wider uppercase transition-all duration-300">
                  VIP Programm
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- TRUST FOOTER --- */}
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
