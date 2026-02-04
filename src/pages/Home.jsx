// Nebula Redesign - Premium Homepage
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { api } from '@/api';
import { Crown, Sparkles, Zap, Package, LayoutGrid, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
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

// Antigravity Components
import AntigravityProductCard from '../components/antigravity/AntigravityProductCard';
import CategoryTile from '../components/antigravity/CategoryTile';
import SectionHeader from '../components/antigravity/SectionHeader';
import FeaturedDropList from '../components/home/FeaturedDropList';
import ProductCardLite from '../components/antigravity/ProductCardLite';
import { ProductCardSkeleton, CategoryTileSkeleton } from '../components/antigravity/Skeletons';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const AnimatedSection = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

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

      // Set Featured Product
      if (prods.length > 0) {
        setFeaturedProduct(prods[0]);
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
      // Use UNDER_50 mock collection if no products found
      return filtered.length > 0 ? filtered.slice(0, 6) : UNDER_50.slice(0, 6);
    }
    if (activeTab === 'trending') {
      // Use TRENDING mock collection if products array is empty
      return products.length > 0 ? products.slice(0, 6) : TRENDING.slice(0, 6);
    }
    // "Bestseller" default
    if (products.length >= 6) {
      return products.slice(0, 6);
    }
    // Fallback to BESTSELLERS mock
    return BESTSELLERS.slice(0, 6);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050608]">
      <SEO
        title="Home"
        description="Nebula - Experience the Future of Smoking. Premium Vapes, Shishas & Accessories."
        image="/images/hero-logo.png"
        url={window.location.href}
      />

      <CosmicHeroBackground />
      {/* Global Vignette */}
      <div className="fixed inset-0 bg-gradient-radial from-transparent via-black/20 to-black/80 pointer-events-none z-0" />

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden">
        <div className="max-w-[1400px] w-full mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left: Text & Actions */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8"
            >
              <div className="relative">
                <div className="absolute -inset-10 bg-gold/10 blur-[80px] rounded-full pointer-events-none" />
                <h1 className="text-6xl sm:text-8xl xl:text-9xl font-black leading-[0.9] tracking-tighter text-white drop-shadow-2xl">
                  NEBULA
                </h1>
                <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-amber-600 tracking-[0.4em] mt-2 uppercase">
                  <TypewriterEffect words={['Future', 'Supply', 'Lifestyle']} />
                </div>
              </div>

              <p className="text-zinc-400 text-lg md:text-xl max-w-xl leading-relaxed">
                Entdecke die exklusivste Auswahl an Premium Shishas, Vapes und Accessoires.
                Qualität, die man spürt. Design, das bewegt.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link to={createPageUrl('Products')}>
                  <MagneticButton>
                    <Button className="btn-gold h-14 px-10 text-lg w-full sm:w-auto shadow-[0_0_40px_rgba(214,178,94,0.3)]">
                      Shop Öffnen
                    </Button>
                  </MagneticButton>
                </Link>
                <Link to="/products?sort=newest">
                  <Button variant="outline" className="h-14 px-10 text-lg w-full sm:w-auto border-white/20 hover:bg-white/10">
                    New Drops
                  </Button>
                </Link>
              </div>

              {/* Trust Row (Hero based) */}
              <div className="pt-8 flex flex-wrap justify-center lg:justify-start gap-6 text-zinc-500 text-sm font-medium uppercase tracking-wider">
                <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-gold" /> Blitzversand</span>
                <span className="flex items-center gap-2"><Crown className="w-4 h-4 text-gold" /> Premium Selection</span>
                <span className="flex items-center gap-2"><Package className="w-4 h-4 text-gold" /> Discreet Pkg</span>
              </div>
            </motion.div>

            {/* Right: Featured Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 w-full h-[500px] lg:h-[600px] bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
            >
              <FeaturedDropList products={products} />
            </motion.div>
          </div>

          {/* Delivery Bar Helper */}
          <div className="mt-16 w-full max-w-3xl mx-auto lg:mx-0">
            <DeliveryBar />
          </div>
        </div>

        {/* Marquee Background Element */}
        <div className="absolute bottom-10 left-0 right-0 z-0 opacity-20 pointer-events-none">
          <InfiniteMarquee />
        </div>
      </section>

      {/* --- SECTION: CATEGORIES --- */}
      <section className="py-20 relative z-10">
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
            <Carousel className="w-full">
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
      </section>

      {/* --- SECTION: FRESH DROPS --- */}
      <section className="py-24 relative z-10 bg-[#0E1015]/30 backdrop-blur-sm border-y border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex flex-col">
              <span className="text-gold font-bold uppercase tracking-widest text-sm mb-1">New Arrivals</span>
              <h2 className="text-4xl md:text-5xl font-black text-white">Fresh Drops</h2>
            </div>
            <div className="hidden md:flex gap-2">
              {/* Carousel controls usually inside, but here independent */}
            </div>
          </div>

          <Carousel className="w-full">
            <CarouselContent className="-ml-4 pb-12">
              {loadingProducts ? Array(5).fill(0).map((_, i) => (
                <CarouselItem key={i} className="pl-4 basis-[70%] sm:basis-[45%] md:basis-[30%] lg:basis-[22%]">
                  <ProductCardSkeleton />
                </CarouselItem>
              )) : products.length > 0 ? (
                products.slice(0, 12).map((product) => (
                  <CarouselItem key={product.id} className="pl-4 basis-[70%] sm:basis-[45%] md:basis-[30%] lg:basis-[22%]">
                    <div className="h-full">
                      <ProductCardLite
                        product={product}
                        onQuickView={(p) => { setQuickViewProduct(p); setIsQuickViewOpen(true); }}
                      />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <div className="col-span-full w-full py-12 flex flex-col items-center justify-center text-center">
                  <p className="text-zinc-500 mb-4">Gerade keine neuen Drops verfügbar.</p>
                  <Link to="/products">
                    <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-black">
                      Alle Produkte ansehen
                    </Button>
                  </Link>
                </div>
              )}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="left-0 bg-black/50 border-white/10 text-white hover:bg-gold hover:text-black" />
              <CarouselNext className="right-0 bg-black/50 border-white/10 text-white hover:bg-gold hover:text-black" />
            </div>
          </Carousel>
        </div>
      </section>

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
                  /* Premium Empty State - shouldn't happen with fallbacks but just in case */
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
                {/* Static image or dynamic from first bestseller */}
                <div className="absolute inset-0 bg-[#0E1015]">
                  <img
                    src="https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800&auto=format&fit=crop"
                    onError={(e) => e.target.src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop"}
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

      {/* --- TRUST FOOTER --- */}
      <section className="py-16 border-t border-white/5 bg-[#08090C]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: Zap, label: "24h Versand", sub: "Schnell & Zuverlässig" },
            { icon: Crown, label: "Premium Quality", sub: "Verified Authentic" },
            { icon: Package, label: "Sicher Verpackt", sub: "Neutraler Karton" },
            { icon: LayoutGrid, label: "Grosse Auswahl", sub: "1000+ Produkte" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-gold/50 group-hover:bg-gold/10 transition-all duration-300 shadow-lg">
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
