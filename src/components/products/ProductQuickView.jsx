import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Heart, ShoppingCart, ExternalLink, MapPin, Clock, Truck, Plus, Minus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function ProductQuickView({ product, isOpen, onClose, onAddToCart }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [images, setImages] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      loadProductData();
    }
  }, [product, isOpen]);

  const loadProductData = async () => {
    try {
      // Load images
      const productImages = await base44.entities.ProductImage.filter({ product_id: product.id });
      const sortedImages = productImages.sort((a, b) => a.sort_order - b.sort_order);
      
      if (sortedImages.length > 0) {
        setImages(sortedImages.map(img => img.url));
      } else if (product.cover_image) {
        setImages([product.cover_image]);
      }

      // Check wishlist
      const user = await base44.auth.me();
      const wishlistItems = await base44.entities.WishlistItem.filter({
        user_id: user.id,
        product_id: product.id
      });
      setIsWishlisted(wishlistItems.length > 0);

      // Load delivery info
      const saved = localStorage.getItem('delivery_location');
      if (saved) {
        setDeliveryInfo(JSON.parse(saved));
      } else {
        setDeliveryInfo({ city: 'Berlin', eta_min: 1, eta_max: 3, free_shipping_threshold: 200 });
      }
    } catch (error) {
      console.error('Error loading product data:', error);
    }
  };

  const toggleWishlist = async () => {
    if (isPending) return;
    
    setIsPending(true);
    const previousState = isWishlisted;
    setIsWishlisted(!isWishlisted);

    try {
      const user = await base44.auth.me();
      
      if (previousState) {
        const items = await base44.entities.WishlistItem.filter({
          user_id: user.id,
          product_id: product.id
        });
        if (items.length > 0) {
          await base44.entities.WishlistItem.delete(items[0].id);
        }
      } else {
        await base44.entities.WishlistItem.create({
          user_id: user.id,
          product_id: product.id
        });
      }
    } catch (error) {
      setIsWishlisted(previousState);
      console.error('Wishlist error:', error);
    } finally {
      setIsPending(false);
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await onAddToCart?.(product, quantity);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getEtaText = () => {
    if (!deliveryInfo) return '';
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + deliveryInfo.eta_min);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + deliveryInfo.eta_max);
    
    return `${days[startDate.getDay()]}–${days[endDate.getDay()]} (${deliveryInfo.eta_min}–${deliveryInfo.eta_max} Werktage)`;
  };

  if (!product) return null;

  const currentImage = images[selectedImage] || product.cover_image;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-[var(--glass-border)] max-w-5xl p-0 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 glass-panel rounded-full flex items-center justify-center hover:bg-[var(--glass-hover)] smooth-transition focus-ring"
          aria-label="Schließen"
        >
          <X className="w-5 h-5 text-[hsl(var(--text))]" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative bg-[hsl(var(--panel))] p-8">
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="aspect-square rounded-[var(--radius-lg)] overflow-hidden mb-4 bg-black/20"
            >
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-[hsl(var(--border))] opacity-40" />
                </div>
              )}
            </motion.div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden smooth-transition focus-ring ${
                      idx === selectedImage
                        ? 'ring-2 ring-[hsl(var(--accent))] ring-offset-2 ring-offset-[hsl(var(--panel))]'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-8 flex flex-col">
            {/* Header */}
            <div className="space-y-4 mb-6">
              {/* Availability Badge */}
              <div>
                {product.in_stock ? (
                  <div className="badge-available">✓ Verfügbar</div>
                ) : (
                  <div className="badge-unavailable">Ausverkauft</div>
                )}
              </div>

              {/* Product Name */}
              <h2 className="text-heading text-[hsl(var(--text))]">{product.name}</h2>

              {/* Price & SKU */}
              <div className="flex items-baseline justify-between">
                <div className="text-4xl font-black text-gradient-primary">{product.price}€</div>
                <div className="text-sm font-mono text-[hsl(var(--text-subtle))] bg-[hsl(var(--panel))] px-3 py-1.5 rounded-lg">
                  ID: {product.sku}
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6 pb-6 border-b border-[hsl(var(--border))]">
                <p className="text-body text-[hsl(var(--text-muted))] leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Delivery Box */}
            {deliveryInfo && (
              <div className="glass-panel rounded-[var(--radius-md)] p-4 mb-6 space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-[hsl(var(--accent))] flex-shrink-0" />
                  <span className="text-[hsl(var(--text-muted))] font-medium">Lieferung nach</span>
                  <span className="text-[hsl(var(--text))] font-bold">{deliveryInfo.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-[hsl(var(--accent2))] flex-shrink-0" />
                  <span className="text-[hsl(var(--text-muted))] font-medium">Lieferzeit</span>
                  <span className="text-[hsl(var(--text))] font-bold">{getEtaText()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-[hsl(var(--success))] flex-shrink-0" />
                  <span className="text-[hsl(var(--text-muted))] font-medium">
                    Gratis Versand ab {deliveryInfo.free_shipping_threshold}€
                  </span>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-[hsl(var(--text))] mb-2 block">Anzahl</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 glass-panel rounded-lg flex items-center justify-center hover:bg-[var(--glass-hover)] smooth-transition focus-ring disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-16 h-10 glass-panel rounded-lg flex items-center justify-center text-[hsl(var(--text))] font-bold">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 glass-panel rounded-lg flex items-center justify-center hover:bg-[var(--glass-hover)] smooth-transition focus-ring"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 mt-auto">
              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={!product.in_stock || isAddingToCart}
                className="w-full h-12 btn-primary text-base relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {showSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Hinzugefügt!
                    </motion.div>
                  ) : isAddingToCart ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Wird hinzugefügt...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      In den Warenkorb
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={toggleWishlist}
                  disabled={isPending}
                  className="h-12 btn-secondary flex items-center justify-center gap-2"
                >
                  <Heart
                    className={`w-5 h-5 smooth-transition ${
                      isWishlisted ? 'fill-[hsl(var(--error))] text-[hsl(var(--error))]' : ''
                    }`}
                  />
                  <span>{isWishlisted ? 'Gemerkt' : 'Merken'}</span>
                </button>

                <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
                  <button className="h-12 w-full btn-secondary flex items-center justify-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Details
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}