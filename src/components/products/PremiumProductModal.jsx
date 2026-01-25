import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X, Heart, ShoppingBag, ChevronLeft, ChevronRight,
  Check, AlertCircle, Package, Truck, Clock,
  Plus, Minus, Zap, ShieldCheck
} from 'lucide-react';
import { api } from '@/api';
import { useToast } from '@/components/ui/use-toast';
import { useWishlist } from '../wishlist/WishlistContext';
import { createPageUrl } from '../../utils';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

export default function PremiumProductModal({ product, open, onClose, onAddToCart }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [expressDelivery, setExpressDelivery] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');

  const { toast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Initialize and Calculate Delivery Date
  useEffect(() => {
    if (product?.colors?.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]);
    }
    setSelectedSize(null);
    setCurrentImageIndex(0);
    setQuantity(1);
    setExpressDelivery(false);

    // Dynamic Delivery Date
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (expressDelivery ? 1 : 3));
    setDeliveryDate(targetDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }));

  }, [product, open, expressDelivery]);

  // Get current gallery images based on selected color
  const getGalleryImages = useCallback(() => {
    if (!product) return [];

    if (selectedColor?.images?.length > 0) {
      return selectedColor.images;
    }

    const imgs = [];
    if (product.cover_image) imgs.push(product.cover_image);
    return imgs.length > 0 ? imgs : [];
  }, [product, selectedColor]);

  const galleryImages = getGalleryImages();
  const currentImage = galleryImages[currentImageIndex] || product?.cover_image;

  // Get current variant
  const getCurrentVariant = useCallback(() => {
    if (!product?.variants || !selectedColor) return null;
    return product.variants.find(v =>
      v.color_id === selectedColor.id &&
      v.size === selectedSize &&
      v.active !== false
    );
  }, [product, selectedColor, selectedSize]);

  const currentVariant = getCurrentVariant();

  // Calculate price (variant override or base price)
  let basePrice = currentVariant?.price_override || product?.price || 0;
  const currentPrice = expressDelivery ? basePrice + 4.90 : basePrice;

  // Check stock for current variant
  const getStockForSize = (size) => {
    if (!product?.variants || !selectedColor) return 0;
    const variant = product.variants.find(v =>
      v.color_id === selectedColor.id && v.size === size && v.active !== false
    );
    return variant?.stock ?? 0;
  };

  // Total stock for selected color
  const totalColorStock = selectedColor
    ? product?.variants?.filter(v => v.color_id === selectedColor.id && v.active !== false)
      .reduce((sum, v) => sum + (v.stock || 0), 0) || 0
    : 0;

  // Handle color change
  const handleColorChange = (color) => {
    setSelectedColor(color);
    setSelectedSize(null);
    setCurrentImageIndex(0);
  };

  // Navigation
  const nextImage = () => {
    if (galleryImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }
  };

  const prevImage = () => {
    if (galleryImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
    setTouchStart(null);
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    // Check if size is required
    if (product.sizes?.length > 0 && !selectedSize) {
      toast({
        title: 'Größe wählen',
        description: 'Bitte wähle eine Größe aus',
        variant: 'destructive'
      });
      return;
    }

    setIsAdding(true);

    // Confetti Explosion
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D6B25E', '#ffffff', '#000000']
    });

    try {
      const user = await api.auth.me();

      const cartData = {
        user_id: user.id,
        product_id: product.id,
        quantity: quantity,
        selected_options: {
          variant_id: currentVariant?.id || null,
          color_id: selectedColor?.id || null,
          color_name: selectedColor?.name || null,
          color_hex: selectedColor?.hex || null,
          size: selectedSize || null,
          image: currentImage,
          price: currentPrice,
          sku: currentVariant?.sku || product.sku,
          is_express: expressDelivery // Save express option
        }
      };

      await api.entities.StarCartItem.create(cartData);

      toast({
        title: 'Hinzugefügt! ✓',
        description: `${quantity}x ${product.name}${expressDelivery ? ' (EXPRESS)' : ''}`,
      });

      if (onAddToCart) onAddToCart(cartData);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Fehler',
        description: 'Konnte nicht hinzugefügt werden',
        variant: 'destructive'
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Toggle wishlist
  const handleWishlistToggle = async () => {
    if (!product) return;
    try {
      await toggleWishlist(product.id);
      toast({
        title: isInWishlist(product.id) ? 'Entfernt' : 'Gespeichert ❤️',
        description: isInWishlist(product.id) ? 'Von Merkliste entfernt' : 'Zur Merkliste hinzugefügt'
      });
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  if (!product) return null;

  const isVariantComplete = !product.sizes?.length || selectedSize;
  const hasStock = product.in_stock && (currentVariant ? currentVariant.stock > 0 : totalColorStock > 0);

  // Stock Pressure Logic
  const currentStock = currentVariant?.stock || totalColorStock;
  const isLowStock = hasStock && currentStock <= 5;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 bg-zinc-950 border-zinc-800 overflow-hidden max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Section */}
          <div className="relative bg-gradient-to-br from-zinc-900 to-black">
            <div
              className="relative aspect-square overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full"
                >
                  <img src={currentImage || ''} alt={product.name} className="w-full h-full object-cover" />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <button
                onClick={handleWishlistToggle}
                className={`absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center transition-all ${isInWishlist(product.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-zinc-800 hover:bg-white'}`}
              >
                <Heart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>

              <div className="absolute bottom-4 left-4">
                {hasStock ? (
                  <div className="flex flex-col gap-1">
                    <Badge className="bg-emerald-500 text-white font-bold px-3 py-1.5 text-sm w-fit">
                      <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                      Verfügbar
                    </Badge>
                    {isLowStock && (
                      <Badge className="bg-amber-500 text-black font-black px-3 py-1.5 text-xs w-fit animate-pulse border-2 border-amber-400">
                        Fast ausverkauft! Nur noch {currentStock} Stück
                      </Badge>
                    )}
                  </div>
                ) : (
                  <Badge className="bg-red-500 text-white font-bold px-3 py-1.5 text-sm">Ausverkauft</Badge>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-medium">
                  {currentImageIndex + 1} / {galleryImages.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-gold ring-2 ring-gold/50' : 'border-zinc-700 hover:border-zinc-500'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col p-6 md:p-8">
            <div className="mb-6">
              <p className="text-sm font-bold text-gold mb-2">{product.sku}</p>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">{product.name}</h2>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-gold animate-in fade-in zoom-in duration-300">
                  {currentPrice.toFixed(2)}€
                </span>
                {expressDelivery && (
                  <span className="text-xs font-bold text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    inkl. Express
                  </span>
                )}
              </div>
            </div>

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-white mb-3">Farbe: <span className="text-gold">{selectedColor?.name || 'Wählen'}</span></label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleColorChange(color)}
                      className={`relative w-12 h-12 rounded-xl transition-all ${selectedColor?.id === color.id ? 'ring-2 ring-gold ring-offset-2 ring-offset-zinc-950 scale-110' : 'hover:scale-105'}`}
                      style={{ background: color.hex || '#666', border: '2px solid rgba(255,255,255,0.2)' }}
                      title={color.name}
                    >
                      {selectedColor?.id === color.id && <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-lg" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-white mb-3">Größe: <span className="text-gold">{selectedSize || 'Wählen'}</span></label>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => {
                    const stock = getStockForSize(size);
                    const available = stock > 0;
                    return (
                      <button
                        key={size}
                        onClick={() => available && setSelectedSize(size)}
                        disabled={!available}
                        className={`relative h-12 rounded-xl font-bold text-sm transition-all ${selectedSize === size ? 'bg-gold text-black' : available ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed line-through'}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-white mb-3">Anzahl</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-zinc-800 rounded-xl border border-zinc-700">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-white hover:bg-zinc-700 rounded-l-xl transition-colors"><Minus className="w-5 h-5" /></button>
                  <span className="w-12 text-center font-bold text-xl text-white">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-white hover:bg-zinc-700 rounded-r-xl transition-colors"><Plus className="w-5 h-5" /></button>
                </div>
              </div>
            </div>

            {/* Hype Delivery Section */}
            <div className="mb-6 p-1 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700">
              <div className="bg-zinc-950/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${expressDelivery ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                      <Zap className="w-5 h-5" fill={expressDelivery ? "currentColor" : "none"} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Express Lieferung</h4>
                      <p className="text-xs text-zinc-400">Bevorzugter Versand (+4,90€)</p>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${expressDelivery ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                    onClick={() => setExpressDelivery(!expressDelivery)}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${expressDelivery ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  <Clock className="w-4 h-4 text-gold" />
                  <p className="text-sm text-zinc-300">
                    Bestelle jetzt, erhalte es bis <span className="text-gold font-bold">{deliveryDate}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1" />

            <div className="sticky bottom-0 bg-zinc-950 pt-4 pb-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <p className="text-sm text-zinc-400">Gesamtpreis</p>
                  <p className="text-2xl font-black text-gold">{(currentPrice * quantity).toFixed(2)}€</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  Käuferschutz aktiv
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!hasStock || !isVariantComplete || isAdding}
                className="w-full h-14 text-lg font-black rounded-xl transition-all disabled:opacity-50 relative overflow-hidden group"
                style={{
                  background: hasStock && isVariantComplete ? 'linear-gradient(135deg, #D6B25E, #F2D27C)' : 'rgba(255,255,255,0.1)',
                  color: hasStock && isVariantComplete ? '#000' : 'rgba(255,255,255,0.4)'
                }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  {isAdding ? 'Wird hinzugefügt...' : !hasStock ? 'Ausverkauft' : !isVariantComplete ? 'Größe wählen' : <><ShoppingBag className="w-5 h-5" /> In den Warenkorb</>}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}