import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Plus, Minus, ArrowLeft, ChevronLeft, ChevronRight, Star, Shield, Zap, Check, Timer } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast'; // Using standard toast for consistency, or sonner if preferred across app
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import WishlistButton from '../components/wishlist/WishlistButton';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import SEO from '@/components/seo/SEO';
import confetti from 'canvas-confetti';
import { insforge } from '@/lib/insforge';

function DetailDropCountdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = new Date(targetDate).getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(interval);
        window.location.reload(); // Refresh to enable buying
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="w-full p-6 rounded-2xl border border-purple-500/50 bg-gradient-to-br from-purple-900/40 via-black to-purple-900/40 backdrop-blur-xl mb-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
            <Timer className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider">Daily Drop</h3>
            <p className="text-purple-200 font-medium">Dieses Produkt droppt in:</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-center">
            <div className="bg-black/50 border border-purple-500/30 rounded-xl w-16 h-16 flex items-center justify-center mb-1">
              <span className="text-3xl font-black text-white">{timeLeft.days}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Tage</span>
          </div>
          <div className="text-center">
            <div className="bg-black/50 border border-purple-500/30 rounded-xl w-16 h-16 flex items-center justify-center mb-1">
              <span className="text-3xl font-black text-white">{timeLeft.hours.toString().padStart(2, '0')}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Std</span>
          </div>
          <div className="text-center">
            <div className="bg-black/50 border border-purple-500/30 rounded-xl w-16 h-16 flex items-center justify-center mb-1">
              <span className="text-3xl font-black text-white">{timeLeft.minutes.toString().padStart(2, '0')}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Min</span>
          </div>
          <div className="text-center">
            <div className="bg-black/50 border border-purple-500/30 rounded-xl w-16 h-16 flex items-center justify-center mb-1">
              <span className="text-3xl font-black text-white w-12">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Sek</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const { toast } = useToast();
  const { addRecentlyViewed } = useRecentlyViewed();
  const { addItem } = useCart();

  const { user } = useAuth();

  // Drag Gesture Logic for Gallery
  const x = useMotionValue(0);
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  useEffect(() => {
    loadProduct();
  }, []);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
  }, [product]);

  const loadProduct = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');

      if (!productId) {
        toast({ title: 'Fehler', description: 'Produkt nicht gefunden', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Fetch Product via InsForge
      const { data: prod, error: productError } = await insforge.database
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError || !prod) {
        console.error('Product load error:', productError);
        setLoading(false);
        return;
      }

      // Fetch Images
      const { data: productImages, error: imagesError } = await insforge.database
        .from('product_images')
        .select('*')
        .eq('product_id', productId);

      if (imagesError) {
        console.warn('Images load error:', imagesError);
      }

      setProduct(prod);
      const sortedImages = (productImages || []).sort((a, b) => a.sort_order - b.sort_order);
      setImages(sortedImages);

      // Auto-select first color/image
      if (prod.colors && prod.colors.length > 0) {
        const firstColor = prod.colors[0];
        setSelectedColor(firstColor);
        if (firstColor.images && firstColor.images.length > 0) {
          setSelectedImage(firstColor.images[0]);
        } else if (prod.cover_image) {
          setSelectedImage(prod.cover_image);
        } else if (sortedImages.length > 0) {
          setSelectedImage(sortedImages[0].url);
        }
      } else {
        if (prod.cover_image) {
          setSelectedImage(prod.cover_image);
        } else if (sortedImages.length > 0) {
          setSelectedImage(sortedImages[0].url);
        }
      }

    } catch (error) {
      console.error('[ProductDetail] Error loading product:', error);
      toast({
        title: 'Fehler beim Laden',
        description: 'Produkt konnte nicht geladen werden. Bitte versuche es erneut.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      if (!user) {
        toast({
          title: "Anmeldung erforderlich",
          description: "Bitte melde dich an, um Produkte in den Warenkorb zu legen.",
          variant: "destructive"
        });
        // Optionally redirect to login
        // window.location.href = createPageUrl('Login');
        return;
      }

      // Validation
      if (product.sizes?.length > 0 && !selectedSize) {
        toast({
          title: "Größe wählen",
          description: "Bitte wähle eine Größe aus.",
          variant: "destructive"
        });
        return;
      }

      // Confetti Effect
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };
      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      // Add to Cart Logic via Context
      const variant = product.variants?.find(v => v.color_id === selectedColor?.id && v.size === selectedSize);
      const price = variant?.price_override || product.price;

      const cartOptions = {
        variant_id: variant?.id || null,
        color_id: selectedColor?.id || null,
        color_name: selectedColor?.name || null,
        color_hex: selectedColor?.hex || null,
        size: selectedSize || null,
        image: selectedImage || product.cover_image || '/placeholder.png',
        sku: variant?.sku || product.sku || 'SKU-UNKNOWN'
      };

      await addItem({
        product: product,
        quantity: quantity,
        options: cartOptions,
        price: price // pass price explicitly if handling dynamic pricing
      });

      toast({
        title: 'Hinzugefügt! 🛒',
        description: `${quantity}x ${product.name} im Warenkorb.`,
        className: "bg-gold/10 border-gold/30 text-white"
      });

      // Quick delay to let animation play before redirecting
      setTimeout(() => {
        // window.location.href = createPageUrl('Cart'); // Optional: redirect to cart or stay
      }, 1500);

    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({ title: 'Fehler', description: 'Produkt konnte nicht hinzugefügt werden: ' + error.message, variant: 'destructive' });
    }
  };

  const calculatePrice = () => {
    if (!product) return 0;
    let basePrice = product.price;
    // Basic support for option pricing if schema exists
    if (product.option_schema?.options) {
      product.option_schema.options.forEach(option => {
        const selectedValue = selectedOptions[option.name];
        if (selectedValue && option.values) {
          const valueObj = option.values.find(v => v.value === selectedValue);
          if (valueObj?.price_modifier) {
            basePrice += valueObj.price_modifier;
          }
        }
      });
    }
    return basePrice;
  };

  const getGalleryImages = () => {
    if (!product) return [];
    const result = [];
    if (selectedColor?.images?.length > 0) {
      result.push(...selectedColor.images);
    } else {
      if (product.cover_image) result.push(product.cover_image);
      if (images && images.length > 0) {
        images.forEach(img => {
          if (img?.url && !result.includes(img.url)) result.push(img.url);
        });
      }
    }
    return result.filter(Boolean);
  };

  // Early return if product not loaded yet
  if (!product && !loading) {
    return (
      <div className="min-h-screen bg-[#050608] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produkt nicht gefunden</h1>
          <Link to={createPageUrl('Products')} className="text-[#D6B25E] underline">
            Zurück zum Shop
          </Link>
        </div>
      </div>
    );
  }

  const allImages = product ? getGalleryImages() : [];

  // Ensure selected image is in gallery
  if (selectedImage && !allImages.includes(selectedImage) && allImages.length > 0) {
    setSelectedImage(allImages[0]);
  }

  const navigateImage = (direction) => {
    const currentIndex = allImages.indexOf(selectedImage);
    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % allImages.length;
      setSelectedImage(allImages[nextIndex]);
    } else {
      const prevIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1;
      setSelectedImage(allImages[prevIndex]);
    }
  };

  const currentPrice = calculatePrice();
  const isDrop = product?.drop_date && new Date(product.drop_date) > new Date();

  if (loading) {
    // ... Skeleton Loading (kept simple for brevity, use same skeleton as before) ...
    return (
      <div className="min-h-screen bg-[#050608] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="w-32 h-8 bg-white/5 rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="aspect-square rounded-3xl bg-white/5 animate-pulse" />
            <div className="space-y-8">
              <div className="h-12 w-3/4 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-16 w-1/2 bg-gold/10 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] text-white selection:bg-gold/30">
      <SEO
        title={product.name}
        description={product.description || `Kaufe ${product.name} bei Nebula Shop.`}
        image={selectedImage || product.cover_image}
        url={window.location.href}
        type="product"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-32">
        {/* Back Button */}
        <Link
          to={createPageUrl('Products')}
          className="inline-flex items-center space-x-2 text-zinc-400 hover:text-white mb-8 group"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="font-medium">Zurück</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery Section */}
          <div className="space-y-6">
            <motion.div
              className="relative aspect-square rounded-3xl overflow-hidden glass-panel group cursor-grab active:cursor-grabbing"
              style={{ background: 'var(--bg2)' }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.img
                  key={selectedImage}
                  src={selectedImage}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold) {
                      navigateImage('next');
                    } else if (swipe > swipeConfidenceThreshold) {
                      navigateImage('prev');
                    }
                  }}
                />
              </AnimatePresence>

              {/* Desktop Arrows */}
              {allImages.length > 1 && (
                <>
                  <button onClick={() => navigateImage('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => navigateImage('next')} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="absolute top-4 right-4 z-10">
                <WishlistButton productId={product.id} size="lg" variant="glass" />
              </div>
            </motion.div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-gold shadow-lg shadow-gold/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4 text-zinc-400">
                <span className="bg-white/5 px-2 py-1 rounded text-xs font-mono border border-white/10">{product.sku}</span>
                {product.in_stock ? (
                  <span className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Auf Lager
                  </span>
                ) : (
                  <span className="text-red-400 text-sm font-bold">Ausverkauft</span>
                )}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex items-end gap-3 border-gold/10">
              <span className="text-4xl font-black text-gold">{currentPrice.toFixed(2)}€</span>
              {currentPrice !== product.price && (
                <span className="text-lg text-zinc-500 line-through mb-1">{product.price.toFixed(2)}€</span>
              )}
            </div>

            <p className="text-zinc-300 leading-relaxed text-lg font-medium">
              {product.description}
            </p>

            {/* Selections */}
            <div className="space-y-6">
              {/* Colors */}
              {product.colors?.length > 0 && (
                <div className="space-y-3">
                  <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Farbe</span>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map(color => (
                      <button
                        key={color.id}
                        onClick={() => {
                          setSelectedColor(color);
                          if (color.images?.length > 0) setSelectedImage(color.images[0]);
                        }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${selectedColor?.id === color.id ? 'ring-2 ring-offset-2 ring-offset-[#050608] ring-gold scale-110' : 'hover:scale-110'}`}
                        style={{ background: color.hex }}
                        title={color.name}
                      >
                        {selectedColor?.id === color.id && <Check className={`w-5 h-5 ${['#ffffff', '#fff'].includes(color.hex?.toLowerCase()) ? 'text-black' : 'text-white'}`} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div className="space-y-3">
                  <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Größe</span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedSize === size ? 'bg-gold text-black border-gold' : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Drop Countdown or Add to Cart */}
              {isDrop ? (
                <DetailDropCountdown targetDate={product.drop_date} />
              ) : (
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.in_stock || (product.sizes?.length > 0 && !selectedSize)}
                    className="flex-1 h-12 rounded-xl text-lg font-bold btn-gold shadow-lg shadow-gold/10"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    In den Warenkorb
                  </Button>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center gap-2">
                <Zap className="w-6 h-6 text-gold" />
                <span className="text-xs font-bold text-zinc-400">Blitzversand</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center gap-2">
                <Shield className="w-6 h-6 text-gold" />
                <span className="text-xs font-bold text-zinc-400">Sicher Bezahlen</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center gap-2">
                <Star className="w-6 h-6 text-gold" />
                <span className="text-xs font-bold text-zinc-400">Premium Qualität</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Action Bar */}
      <AnimatePresence>
        {!isDrop && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:hidden glass-panel border-t border-gold/20"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-400 font-medium">Gesamt</span>
                <span className="text-xl font-black text-white">{(currentPrice * quantity).toFixed(2)}€</span>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={!product.in_stock || (product.sizes?.length > 0 && !selectedSize)}
                className="flex-1 h-12 rounded-xl font-bold btn-gold shadow-lg"
              >
                In den Warenkorb
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}