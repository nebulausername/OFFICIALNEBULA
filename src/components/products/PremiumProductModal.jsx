import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, Heart, ShoppingBag, ChevronLeft, ChevronRight, 
  Check, AlertCircle, Package, Truck, Clock,
  Plus, Minus
} from 'lucide-react';
import { api } from '@/api';
import { useToast } from '@/components/ui/use-toast';
import { useWishlist } from '../wishlist/WishlistContext';
import { createPageUrl } from '../../utils';
import { Link } from 'react-router-dom';

export default function PremiumProductModal({ product, open, onClose, onAddToCart }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  
  const { toast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  // Initialize selected color
  useEffect(() => {
    if (product?.colors?.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]);
    }
    setSelectedSize(null);
    setCurrentImageIndex(0);
    setQuantity(1);
  }, [product, open]);

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
  const currentPrice = currentVariant?.price_override || product?.price || 0;
  
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
          sku: currentVariant?.sku || product.sku
        }
      };

      await api.entities.StarCartItem.create(cartData);

      toast({
        title: 'Hinzugefügt! ✓',
        description: `${quantity}x ${product.name}${selectedColor ? ` - ${selectedColor.name}` : ''}${selectedSize ? ` (${selectedSize})` : ''}`,
      });

      if (onAddToCart) onAddToCart(cartData);
      
      setTimeout(() => {
        onClose();
      }, 800);
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
        description: isInWishlist(product.id) 
          ? 'Von Merkliste entfernt' 
          : 'Zur Merkliste hinzugefügt'
      });
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  if (!product) return null;

  const isVariantComplete = !product.sizes?.length || selectedSize;
  const hasStock = product.in_stock && (currentVariant ? currentVariant.stock > 0 : totalColorStock > 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 bg-zinc-950 border-zinc-800 overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Section */}
          <div className="relative bg-gradient-to-br from-zinc-900 to-black">
            {/* Main Image */}
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
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                      <Package className="w-20 h-20 text-zinc-700" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                className={`absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isInWishlist(product.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 text-zinc-800 hover:bg-white'
                }`}
              >
                <Heart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>

              {/* Availability Badge */}
              <div className="absolute bottom-4 left-4">
                {hasStock ? (
                  <Badge className="bg-emerald-500 text-white font-bold px-3 py-1.5 text-sm">
                    <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                    Verfügbar
                  </Badge>
                ) : (
                  <Badge className="bg-red-500 text-white font-bold px-3 py-1.5 text-sm">
                    Ausverkauft
                  </Badge>
                )}
              </div>

              {/* Image Counter */}
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
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx
                        ? 'border-gold ring-2 ring-gold/50'
                        : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col p-6 md:p-8">
            {/* Header */}
            <div className="mb-6">
              <p className="text-sm font-bold text-gold mb-2">{product.sku}</p>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
                {product.name}
              </h2>
              
              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl md:text-4xl font-black text-gold">
                  {currentPrice.toFixed(2)}€
                </span>
                {currentVariant?.price_override && currentVariant.price_override !== product.price && (
                  <span className="text-lg text-zinc-500 line-through">
                    {product.price.toFixed(2)}€
                  </span>
                )}
              </div>
            </div>

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-white mb-3">
                  Farbe: <span className="text-gold">{selectedColor?.name || 'Wählen'}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleColorChange(color)}
                      className={`relative w-12 h-12 rounded-xl transition-all ${
                        selectedColor?.id === color.id
                          ? 'ring-2 ring-gold ring-offset-2 ring-offset-zinc-950 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ 
                        background: color.hex || '#666',
                        border: '2px solid rgba(255,255,255,0.2)'
                      }}
                      title={color.name}
                    >
                      {selectedColor?.id === color.id && (
                        <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-lg" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-white mb-3">
                  Größe: <span className="text-gold">{selectedSize || 'Wählen'}</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => {
                    const stock = getStockForSize(size);
                    const available = stock > 0;
                    const isSelected = selectedSize === size;
                    
                    return (
                      <button
                        key={size}
                        onClick={() => available && setSelectedSize(size)}
                        disabled={!available}
                        className={`relative h-12 rounded-xl font-bold text-sm transition-all ${
                          isSelected
                            ? 'bg-gold text-black'
                            : available
                              ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                              : 'bg-zinc-900 text-zinc-600 cursor-not-allowed line-through border border-zinc-800'
                        }`}
                      >
                        {size}
                        {available && stock <= 3 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-black text-xs font-black rounded-full flex items-center justify-center">
                            {stock}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Size warning */}
                {!selectedSize && (
                  <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-amber-400">Bitte wähle eine Größe</span>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-white mb-3">Anzahl</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-zinc-800 rounded-xl border border-zinc-700">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-white hover:bg-zinc-700 rounded-l-xl transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-bold text-xl text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-white hover:bg-zinc-700 rounded-r-xl transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-zinc-400 text-sm">
                  = <span className="font-bold text-white">{(currentPrice * quantity).toFixed(2)}€</span>
                </span>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="mb-6 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-white">Versand</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>🇩🇪 1-5 Tage</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>🇨🇳 8-15 Tage</span>
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* CTA Section - Sticky on mobile */}
            <div className="sticky bottom-0 bg-zinc-950 pt-4 -mx-6 md:-mx-8 px-6 md:px-8 pb-2 border-t border-zinc-800 md:border-none md:bg-transparent md:pt-0 md:static">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <p className="text-sm text-zinc-400">Gesamtpreis</p>
                  <p className="text-2xl font-black text-gold">
                    {(currentPrice * quantity).toFixed(2)}€
                  </p>
                </div>
                <Link 
                  to={createPageUrl('ProductDetail') + `?id=${product.id}`}
                  className="text-sm text-zinc-400 hover:text-white underline"
                  onClick={onClose}
                >
                  Details ansehen
                </Link>
              </div>
              
              <Button
                onClick={handleAddToCart}
                disabled={!hasStock || !isVariantComplete || isAdding}
                className="w-full h-14 text-lg font-black rounded-xl transition-all disabled:opacity-50"
                style={{
                  background: hasStock && isVariantComplete
                    ? 'linear-gradient(135deg, #D6B25E, #F2D27C)'
                    : 'rgba(255,255,255,0.1)',
                  color: hasStock && isVariantComplete ? '#000' : 'rgba(255,255,255,0.4)'
                }}
              >
                {isAdding ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                    />
                    Wird hinzugefügt...
                  </span>
                ) : !hasStock ? (
                  'Ausverkauft'
                ) : !isVariantComplete ? (
                  'Größe wählen'
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    In den Warenkorb
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}