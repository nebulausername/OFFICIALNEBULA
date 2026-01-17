import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Heart, ShoppingBag, Check, ChevronLeft, ChevronRight, AlertCircle, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api';
import { useWishlist } from '../wishlist/WishlistContext';
import { toast } from 'sonner';

export default function ProductVariantModal({ product, isOpen, onClose, onAddToCart }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [isInWishlistState, setIsInWishlistState] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      // Initialize with first color
      if (product.colors?.length > 0) {
        const firstColor = product.colors[0];
        setSelectedColor(firstColor);
        updateImagesForColor(firstColor);
      } else {
        setImages([product.cover_image].filter(Boolean));
      }
      setSelectedSize(null);
      setQuantity(1);
      setCurrentImageIndex(0);
      
      if (product.id) {
        setIsInWishlistState(isInWishlist(product.id));
      }
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (selectedColor && selectedSize && product?.variants) {
      const variant = product.variants.find(v => 
        v.color_id === selectedColor.id && v.size === selectedSize && v.active !== false
      );
      setCurrentVariant(variant);
    } else {
      setCurrentVariant(null);
    }
  }, [selectedColor, selectedSize, product]);

  const updateImagesForColor = (color) => {
    if (color?.images?.length > 0) {
      setImages(color.images);
    } else if (product.cover_image) {
      setImages([product.cover_image]);
    } else {
      setImages([]);
    }
    setCurrentImageIndex(0);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setSelectedSize(null);
    updateImagesForColor(color);
  };

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      toast.error('Bitte wähle Farbe und Größe');
      return;
    }

    const variantData = {
      product_id: product.id,
      variant_id: currentVariant?.id,
      color_id: selectedColor.id,
      color_name: selectedColor.name,
      color_hex: selectedColor.hex,
      size: selectedSize,
      image: images[currentImageIndex] || product.cover_image,
      price: currentVariant?.price_override || product.price,
      sku: currentVariant?.sku || product.sku,
      quantity
    };

    await onAddToCart(variantData);
    onClose();
  };

  const navigateImage = (direction) => {
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const handleWishlistToggle = async () => {
    await toggleWishlist(product.id);
    setIsInWishlistState(!isInWishlistState);
    toast.success(isInWishlistState ? 'Von Merkliste entfernt' : 'Zur Merkliste hinzugefügt');
  };

  const getVariantStock = (size) => {
    if (!selectedColor || !product?.variants) return 0;
    const variant = product.variants.find(v => 
      v.color_id === selectedColor.id && v.size === size && v.active !== false
    );
    return variant?.stock ?? 0;
  };

  const currentPrice = currentVariant?.price_override || product?.price || 0;
  const isAvailable = currentVariant ? (currentVariant.stock > 0) : false;

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-6xl p-0 border-0 overflow-hidden bg-transparent"
        style={{ maxHeight: '95vh' }}
      >
        <div 
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 14, 0.98), rgba(15, 15, 20, 0.98))',
            border: '1px solid rgba(214, 178, 94, 0.2)',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.8)'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="grid md:grid-cols-2 gap-0 max-h-[95vh] overflow-y-auto">
            {/* Left: Image Gallery */}
            <div className="relative bg-gradient-to-br from-zinc-900 to-black p-8">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex] || product.cover_image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>

                {/* Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateImage('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      style={{
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={() => navigateImage('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      style={{
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}

                {/* Wishlist Heart */}
                <button
                  onClick={handleWishlistToggle}
                  className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: isInWishlistState ? 'rgba(214, 178, 94, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <Heart 
                    className="w-6 h-6" 
                    fill={isInWishlistState ? '#000' : 'none'}
                    stroke={isInWishlistState ? '#000' : '#000'}
                  />
                </button>

                {/* Image Counter */}
                {images.length > 1 && (
                  <div 
                    className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-sm font-bold text-white"
                    style={{
                      background: 'rgba(0, 0, 0, 0.7)',
                      backdropFilter: 'blur(8px)'
                    }}
                  >
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all ${
                        currentImageIndex === idx
                          ? 'ring-2 ring-gold ring-offset-2 ring-offset-black'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="p-8 flex flex-col">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{
                      background: 'rgba(214, 178, 94, 0.15)',
                      border: '1px solid rgba(214, 178, 94, 0.3)',
                      color: '#D6B25E'
                    }}
                  >
                    {currentVariant?.sku || product.sku}
                  </span>
                  {isAvailable ? (
                    <span 
                      className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                      style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        color: '#FFFFFF'
                      }}
                    >
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Verfügbar
                    </span>
                  ) : (
                    <span 
                      className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#FFFFFF'
                      }}
                    >
                      Ausverkauft
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-black text-white mb-4">{product.name}</h2>
                {product.description && (
                  <p className="text-zinc-300 text-sm leading-relaxed">{product.description}</p>
                )}
              </div>

              {/* Price */}
              <div 
                className="mb-6 p-4 rounded-xl"
                style={{
                  background: 'rgba(214, 178, 94, 0.08)',
                  border: '1px solid rgba(214, 178, 94, 0.2)'
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPrice}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-4xl font-black"
                    style={{
                      background: 'linear-gradient(135deg, #D6B25E, #F2D27C)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    {currentPrice.toFixed(2)}€
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Color Selection */}
              {product.colors?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-white mb-3">
                    Farbe: <span style={{ color: '#D6B25E' }}>{selectedColor?.name || 'Wählen'}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleColorChange(color)}
                        className={`relative w-12 h-12 rounded-xl transition-all ${
                          selectedColor?.id === color.id
                            ? 'ring-2 ring-gold ring-offset-2 ring-offset-black scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{
                          background: color.hex || '#888',
                          border: '2px solid rgba(255, 255, 255, 0.2)'
                        }}
                        title={color.name}
                      >
                        {selectedColor?.id === color.id && (
                          <Check className="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow-lg" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-white mb-3">
                    Größe: <span style={{ color: '#D6B25E' }}>{selectedSize || 'Wählen'}</span>
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {product.sizes.map((size) => {
                      const stock = getVariantStock(size);
                      const available = stock > 0 && selectedColor;

                      return (
                        <button
                          key={size}
                          onClick={() => available && setSelectedSize(size)}
                          disabled={!available}
                          className={`h-12 rounded-xl font-bold text-sm transition-all ${
                            selectedSize === size
                              ? 'bg-gold text-black'
                              : available
                                ? 'text-white hover:bg-white/10'
                                : 'opacity-30 cursor-not-allowed line-through text-white'
                          }`}
                          style={{
                            background: selectedSize === size ? undefined : 'rgba(255, 255, 255, 0.06)',
                            border: selectedSize === size ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>

                  {selectedColor && !selectedSize && (
                    <div 
                      className="mt-3 flex items-center gap-2 p-3 rounded-xl"
                      style={{
                        background: 'rgba(255, 180, 80, 0.1)',
                        border: '1px solid rgba(255, 180, 80, 0.3)'
                      }}
                    >
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                      <span className="text-sm font-bold text-amber-400">Bitte wähle eine Größe</span>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-white mb-3">Anzahl</h3>
                <div 
                  className="inline-flex items-center gap-3 p-2 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <Minus className="w-5 h-5 text-white" />
                  </button>
                  <span className="w-12 text-center text-xl font-black text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Sticky Bottom CTA */}
              <div 
                className="sticky bottom-0 pt-6 pb-2 -mx-8 px-8"
                style={{
                  background: 'linear-gradient(to top, rgba(10, 10, 14, 1) 80%, transparent)',
                  marginBottom: '-2rem',
                  paddingBottom: '2rem'
                }}
              >
                <div className="flex items-center justify-between mb-4 text-white">
                  <span className="text-sm font-medium">Gesamtpreis:</span>
                  <span className="text-3xl font-black" style={{ color: '#D6B25E' }}>
                    {(currentPrice * quantity).toFixed(2)}€
                  </span>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!selectedColor || !selectedSize || !isAvailable}
                  className="w-full h-14 text-lg font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: (selectedColor && selectedSize && isAvailable)
                      ? 'linear-gradient(135deg, #D6B25E, #F2D27C)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: (selectedColor && selectedSize && isAvailable) ? '#000' : 'rgba(255, 255, 255, 0.4)',
                    boxShadow: (selectedColor && selectedSize && isAvailable) ? '0 8px 24px rgba(214, 178, 94, 0.3)' : 'none'
                  }}
                >
                  <ShoppingBag className="w-6 h-6 mr-2" />
                  {!selectedColor || !selectedSize
                    ? 'Variante wählen'
                    : !isAvailable
                      ? 'Ausverkauft'
                      : 'In den Warenkorb'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}