import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Heart, ShoppingBag, ChevronLeft, ChevronRight, 
  Package, Truck, Check, AlertCircle, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '../wishlist/WishlistContext';

export default function ProductVariantModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart 
}) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { isInWishlist, toggleWishlist } = useWishlist();

  const colors = product?.colors || [];
  const sizes = product?.sizes || [];
  const variants = product?.variants || [];

  // Auto-select first color
  useEffect(() => {
    if (isOpen && colors.length > 0 && !selectedColor) {
      setSelectedColor(colors[0]);
      setCurrentImageIndex(0);
    }
  }, [isOpen, colors]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedColor(null);
      setSelectedSize(null);
      setCurrentImageIndex(0);
      setQuantity(1);
    }
  }, [isOpen]);

  // Get current images based on selected color
  const currentImages = selectedColor?.images?.length > 0 
    ? selectedColor.images 
    : product?.cover_image 
      ? [product.cover_image] 
      : [];

  // Get variant stock
  const getVariantStock = (colorId, size) => {
    const variant = variants.find(v => v.color_id === colorId && v.size === size && v.active !== false);
    return variant?.stock ?? 0;
  };

  // Check if size is available for selected color
  const isSizeAvailable = (size) => {
    if (!selectedColor) return false;
    return getVariantStock(selectedColor.id, size) > 0;
  };

  // Get total stock for selected variant
  const selectedVariantStock = selectedColor && selectedSize 
    ? getVariantStock(selectedColor.id, selectedSize) 
    : 0;

  const canAddToCart = selectedColor && selectedSize && selectedVariantStock > 0;

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    onAddToCart(product, quantity, {
      color: selectedColor,
      size: selectedSize,
      variant_id: variants.find(v => v.color_id === selectedColor.id && v.size === selectedSize)?.id
    });
    onClose();
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[70]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[95%] md:max-w-5xl md:max-h-[90vh] z-[71] overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(180deg, rgba(12, 12, 16, 0.98), rgba(8, 8, 12, 0.98))',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(214, 178, 94, 0.2)',
              borderRadius: '24px',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)'
            }}
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <X className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
            </motion.button>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Gallery */}
                <div className="relative bg-black/30 p-4 md:p-6">
                  {/* Main Image */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                    {currentImages.length > 0 ? (
                      <motion.img
                        key={currentImages[currentImageIndex]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={currentImages[currentImageIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        <Package className="w-16 h-16 text-zinc-700" />
                      </div>
                    )}

                    {/* Navigation Arrows */}
                    {currentImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                        >
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    {currentImages.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-sm font-bold"
                        style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.9)' }}>
                        {currentImageIndex + 1} / {currentImages.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {currentImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {currentImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all ${
                            idx === currentImageIndex 
                              ? 'ring-2 ring-gold ring-offset-2 ring-offset-black' 
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-5 md:p-8 flex flex-col">
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold" 
                        style={{ background: 'rgba(214, 178, 94, 0.15)', color: '#D6B25E' }}>
                        {product.sku}
                      </span>
                      {product.in_stock !== false ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                          style={{ background: 'rgba(100, 230, 150, 0.15)', color: 'rgba(100, 230, 150, 0.9)' }}>
                          <Check className="w-3 h-3" /> Auf Lager
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{ background: 'rgba(255, 100, 120, 0.15)', color: 'rgba(255, 100, 120, 0.9)' }}>
                          Ausverkauft
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black mb-3" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                      {product.name}
                    </h2>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl md:text-4xl font-black text-gold">
                        {product.price?.toFixed(2)} €
                      </span>
                    </div>
                  </div>

                  {/* Color Selection */}
                  {colors.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-base font-bold mb-3" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                        Farbe: <span className="text-gold">{selectedColor?.name || 'Wählen'}</span>
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {colors.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => {
                              setSelectedColor(color);
                              setCurrentImageIndex(0);
                              setSelectedSize(null);
                            }}
                            className={`relative w-12 h-12 rounded-xl transition-all ${
                              selectedColor?.id === color.id 
                                ? 'ring-2 ring-gold ring-offset-2 ring-offset-black scale-110' 
                                : 'hover:scale-105'
                            }`}
                            style={{ 
                              background: color.hex || '#888',
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
                  {sizes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-base font-bold mb-3" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                        Größe: <span className="text-gold">{selectedSize || 'Wählen'}</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => {
                          const available = isSizeAvailable(size);
                          const stock = selectedColor ? getVariantStock(selectedColor.id, size) : 0;
                          return (
                            <button
                              key={size}
                              onClick={() => available && setSelectedSize(size)}
                              disabled={!available}
                              className={`min-w-[52px] h-12 px-4 rounded-xl font-bold text-base transition-all ${
                                selectedSize === size
                                  ? 'bg-gold text-black'
                                  : available
                                    ? 'hover:bg-white/10'
                                    : 'opacity-30 cursor-not-allowed line-through'
                              }`}
                              style={{
                                background: selectedSize === size ? undefined : 'rgba(255,255,255,0.06)',
                                border: selectedSize === size ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                color: selectedSize === size ? undefined : available ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)'
                              }}
                            >
                              {size}
                              {available && stock <= 3 && stock > 0 && (
                                <span className="block text-xs text-amber-400 font-semibold">Nur {stock}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Shipping Info */}
                  <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-gold" />
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                          Lieferung: 1-5 Tage (DE) • 8-15 Tage (CN)
                        </p>
                        <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          Kostenloser Versand ab 100€
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mb-6">
                    <h3 className="text-base font-bold mb-3" style={{ color: 'rgba(255,255,255,0.85)' }}>Anzahl</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }}
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-xl font-black" style={{ color: 'rgba(255,255,255,0.95)' }}>
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(selectedVariantStock || 10, quantity + 1))}
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto space-y-3">
                    {!canAddToCart && selectedColor && !selectedSize && (
                      <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(255, 180, 80, 0.1)', border: '1px solid rgba(255, 180, 80, 0.3)' }}>
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                        <span className="text-sm font-bold text-amber-400">Bitte wähle eine Größe</span>
                      </div>
                    )}

                    <Button
                      onClick={handleAddToCart}
                      disabled={!canAddToCart}
                      className="w-full h-14 text-lg font-black rounded-xl transition-all"
                      style={{
                        background: canAddToCart 
                          ? 'linear-gradient(135deg, #D6B25E, #F2D27C)' 
                          : 'rgba(255,255,255,0.1)',
                        color: canAddToCart ? '#000' : 'rgba(255,255,255,0.4)',
                        boxShadow: canAddToCart ? '0 8px 24px rgba(214, 178, 94, 0.3)' : 'none'
                      }}
                    >
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      {canAddToCart ? 'In den Warenkorb' : 'Nicht verfügbar'}
                    </Button>

                    <Button
                      onClick={() => toggleWishlist(product.id)}
                      variant="outline"
                      className="w-full h-12 text-base font-bold rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: isInWishlist(product.id) ? '#ff6b8a' : 'rgba(255,255,255,0.85)'
                      }}
                    >
                      <Heart className={`w-5 h-5 mr-2 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                      {isInWishlist(product.id) ? 'Auf der Merkliste' : 'Zur Merkliste'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}