// ... imports
import MotionWrapper from '@/components/ui/MotionWrapper';

// ... (keep other imports)

// Removed local AnimatedSection definition

export default function Home() {
  // ... (keep existing state and logic)

  return (
    <div className="relative min-h-screen bg-[#050608] text-white overflow-x-hidden selection:bg-gold/30">

      {/* SEO */}
      <SEO
        title="Nebula | Future Culture Supply"
        description="Discover the future of streetwear. Premium drops, exclusive designs, and a culture that defines tomorrow."
      />

      {/* --- HERO SECTION --- */}
      <section className="relative w-full h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
        {/* Live Cosmic Background */}
        <CosmicHeroBackground />

        <div className="absolute inset-0 z-10 container mx-auto px-4 flex flex-col justify-center items-center text-center">
          <div className="relative z-20">
            <motion.div
              style={{ y: heroTextY, scale: heroScale, opacity: heroOpacity }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-gold" />
                <span className="text-gold font-bold tracking-[0.3em] text-xs uppercase glow-gold">Official Supply</span>
                <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-gold" />
              </div>

              <motion.h1
                className="text-5xl sm:text-8xl xl:text-9xl font-black leading-[0.9] tracking-tighter text-white drop-shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                NEBULA
              </motion.h1>
              <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-amber-600 tracking-[0.4em] mt-2 uppercase">
                <TypewriterEffect
                  words={["FUTURE", "CULTURE", "NEBULA"]}
                  className="text-gold"
                  cursorClassName="bg-gold"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            >
              {/* Left Column: CTA & Trust */}
              <div className="lg:col-span-7 flex flex-col items-center lg:items-start gap-8 order-2 lg:order-1">
                <MagneticButton className="min-w-[200px]" onClick={() => window.location.href = '/products'}>
                  <Link to="/products" className="w-full h-full flex items-center justify-center px-8 py-4">
                    <span className="relative z-10 flex items-center gap-3 font-bold text-black text-lg">
                      SHOP DROPS <Zap className="w-5 h-5 fill-black" />
                    </span>
                  </Link>
                </MagneticButton>

                {/* Trust Row */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-zinc-500 text-sm font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-gold" /> Blitzversand</span>
                  <span className="flex items-center gap-2"><Crown className="w-4 h-4 text-gold" /> Premium Selection</span>
                  <span className="flex items-center gap-2"><Package className="w-4 h-4 text-gold" /> Discreet Pkg</span>
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
              <button onClick={() => freshDropsApi?.scrollPrev()} className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-gold hover:text-black hover:border-gold transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => freshDropsApi?.scrollNext()} className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-gold hover:text-black hover:border-gold transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <Carousel setApi={setFreshDropsApi} className="w-full">
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
            {/* Native arrows hidden as we use custom header controls */}
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
        onSwitchProduct={(p) => setQuickViewProduct(p)}
        mode="full"
      />
    </div>
  );
}
