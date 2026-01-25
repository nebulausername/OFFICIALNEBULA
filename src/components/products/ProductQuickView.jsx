import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '@/api';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Heart, ShoppingCart, ExternalLink, MapPin, Clock, Truck, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useI18n } from '../i18n/I18nProvider';

export default function ProductQuickView({ product, isOpen, onClose, onAddToCart }) {
  const { t, formatCurrency, isRTL } = useI18n();
  const [selectedImage, setSelectedImage] = useState(0);
  const [images, setImages] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Variant Selection
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    if (product && isOpen) {
      loadProductData();
      // Set default color
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
      setSelectedSize(null);
      setQuantity(1);
    }
  }, [product, isOpen]);

  // Update images when color changes
  useEffect(() => {
    if (selectedColor && selectedColor.images && selectedColor.images.length > 0) {
      setImages(selectedColor.images);
      setSelectedImage(0);
    } else if (product?.cover_image) {
      setImages([product.cover_image]);
    }
  }, [selectedColor, product]);

  const loadProductData = async () => {
    try {
      // Load images if no colors defined
      if (!product.colors || product.colors.length === 0) {
        const productImages = await api.entities.ProductImage.filter({ product_id: product.id });
        const sortedImages = productImages.sort((a, b) => a.sort_order - b.sort_order);

        if (sortedImages.length > 0) {
          setImages(sortedImages.map(img => img.url));
        } else if (product.cover_image) {
          setImages([product.cover_image]);
        }
      }

      // Check wishlist
      const user = await api.auth.me();
      const wishlistItems = await api.entities.WishlistItem.filter({
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

  const getVariantStock = () => {
    if (!product.variants || product.variants.length === 0) return 999;
    if (!selectedColor) return 0;

    const variant = product.variants.find(v =>
      v.color_id === selectedColor.id &&
      (!selectedSize || v.size === selectedSize)
    );

    return variant?.stock || 0;
  };

  const isVariantAvailable = () => {
    if (!product.sizes || product.sizes.length === 0) return product.in_stock;
    if (!selectedSize) return false;
    return getVariantStock() > 0;
  };

  const getSizeOptions = () => {
    if (!product.sizes) return [];
    return product.sizes;
  };

  const isSizeAvailable = (size) => {
    if (!product.variants || product.variants.length === 0) return true;
    if (!selectedColor) return false;

    const variant = product.variants.find(v =>
      v.color_id === selectedColor.id && v.size === size
    );

    return variant && variant.stock > 0;
  };

  const toggleWishlist = async () => {
    if (isPending) return;

    setIsPending(true);
    const previousState = isWishlisted;
    setIsWishlisted(!isWishlisted);

    try {
      const user = await api.auth.me();

      if (previousState) {
        const items = await api.entities.WishlistItem.filter({
          user_id: user.id,
          product_id: product.id
        });
        if (items.length > 0) {
          await api.entities.WishlistItem.delete(items[0].id);
        }
      } else {
        await api.entities.WishlistItem.create({
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
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      return;
    }

    setIsAddingToCart(true);
    try {
      const options = {};
      if (selectedColor) options.color = selectedColor.name;
      if (selectedSize) options.size = selectedSize;

      await onAddToCart?.(product, quantity, options);
      setShowSuccess(true);

      // Explosion!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D6B25E', '#F2D27C', '#FFFFFF']
      });

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
  const hasVariants = (product.colors && product.colors.length > 0) || (product.sizes && product.sizes.length > 0);
  const needsSizeSelection = product.sizes && product.sizes.length > 0 && !selectedSize;
  const canAddToCart = product.in_stock && !needsSizeSelection && isVariantAvailable();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-5xl p-0 overflow-hidden border-0"
        style={{
          background: 'linear-gradient(180deg, rgba(12, 12, 16, 0.98), rgba(8, 8, 12, 0.98))',
          backdropFilter: 'blur(50px)',
          border: '1px solid rgba(214, 178, 94, 0.25)',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all`}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)'
          }}
          aria-label={t('common.close')}
        >
          <X className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.92)' }} />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative p-6 md:p-8" style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="aspect-square rounded-2xl overflow-hidden mb-4"
              style={{ background: 'rgba(255, 255, 255, 0.04)' }}
            >
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
                </div>
              )}
            </motion.div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all ${idx === selectedImage
                      ? 'ring-2 ring-gold ring-offset-2'
                      : 'opacity-60 hover:opacity-100'
                      }`}
                    style={{ ringOffsetColor: 'rgba(0, 0, 0, 0.5)' }}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-6 md:p-8 flex flex-col overflow-y-auto max-h-[80vh]">
            {/* Header */}
            <div className="space-y-4 mb-6">
              {/* Availability Badge */}
              <div>
                {product.in_stock ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: 'rgba(134, 239, 172, 1)'
                    }}
                  >
                    <Check className="w-4 h-4" /> {t('shop.available')}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: 'rgba(252, 165, 165, 1)'
                    }}
                  >
                    <AlertCircle className="w-4 h-4" /> {t('shop.soldOut')}
                  </div>
                )}
              </div>

              {/* Product Name */}
              <h2 className="text-2xl md:text-3xl font-black" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                {product.name}
              </h2>

              {/* Price & SKU */}
              <div className="flex items-baseline justify-between flex-wrap gap-3">
                <div className="text-3xl md:text-4xl font-black text-gold">{formatCurrency(product.price)}</div>
                <div className="text-sm font-mono px-3 py-1.5 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'rgba(255, 255, 255, 0.65)'
                  }}
                >
                  {t('product.sku')}: {product.sku}
                </div>
              </div>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <label className="text-base font-bold mb-3 block" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>
                  {t('product.selectColor')}: <span className="text-gold">{selectedColor?.name}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-12 h-12 rounded-xl transition-all ${selectedColor?.id === color.id
                        ? 'ring-2 ring-gold ring-offset-2'
                        : 'hover:scale-110'
                        }`}
                      style={{
                        background: color.hex || '#888',
                        ringOffsetColor: 'rgba(0, 0, 0, 0.5)'
                      }}
                      title={color.name}
                    >
                      {selectedColor?.id === color.id && (
                        <Check className="absolute inset-0 m-auto w-5 h-5"
                          style={{ color: color.hex === '#FFFFFF' || color.hex === '#FFF' ? '#000' : '#FFF' }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <label className="text-base font-bold mb-3 block" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>
                  {t('product.selectSize')}: {selectedSize && <span className="text-gold">{selectedSize}</span>}
                  {!selectedSize && <span style={{ color: 'rgba(255, 255, 255, 0.50)' }}> – {t('product.pleaseSelect')}</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {getSizeOptions().map((size) => {
                    const available = isSizeAvailable(size);
                    return (
                      <button
                        key={size}
                        onClick={() => available && setSelectedSize(size)}
                        disabled={!available}
                        className={`min-w-[52px] h-12 px-4 rounded-xl font-bold text-base transition-all ${selectedSize === size
                          ? 'bg-gold text-black'
                          : available
                            ? 'hover:border-gold'
                            : 'opacity-40 cursor-not-allowed line-through'
                          }`}
                        style={{
                          background: selectedSize === size ? undefined : 'rgba(255, 255, 255, 0.06)',
                          border: selectedSize === size ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                          color: selectedSize === size ? undefined : 'rgba(255, 255, 255, 0.85)'
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mb-6 pb-6" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.10)' }}>
                <p className="text-base leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.70)' }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Delivery Box */}
            {deliveryInfo && (
              <div className="rounded-xl p-4 mb-6 space-y-2.5"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(214, 178, 94, 0.15)'
                }}
              >
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
                  <span className="font-semibold" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{t('product.deliveryTo')}</span>
                  <span className="font-bold" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>{deliveryInfo.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gold flex-shrink-0" />
                  <span className="font-semibold" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{t('product.delivery')}</span>
                  <span className="font-bold" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>{getEtaText()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(34, 197, 94, 0.8)' }} />
                  <span className="font-semibold" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                    {t('product.freeShippingFrom')} {formatCurrency(deliveryInfo.free_shipping_threshold)}
                  </span>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="text-base font-bold mb-3 block" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>{t('product.quantity')}</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.10)'
                  }}
                >
                  <Minus className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.85)' }} />
                </button>
                <div className="w-16 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.10)',
                    color: 'rgba(255, 255, 255, 0.95)'
                  }}
                >
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.10)'
                  }}
                >
                  <Plus className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.85)' }} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 mt-auto">
              {/* Size Selection Warning */}
              {needsSizeSelection && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{
                    background: 'rgba(251, 191, 36, 0.10)',
                    border: '1px solid rgba(251, 191, 36, 0.25)',
                    color: 'rgba(253, 224, 71, 1)'
                  }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-bold">{t('product.pleaseSelectSize')}</span>
                </div>
              )}

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCart || isAddingToCart}
                className="w-full h-14 text-lg font-black relative overflow-hidden disabled:opacity-50"
                style={{
                  background: canAddToCart ? 'linear-gradient(135deg, #E8C76A, #F5D98B)' : 'rgba(255, 255, 255, 0.10)',
                  color: canAddToCart ? '#1A1A1A' : 'rgba(255, 255, 255, 0.50)',
                  border: 'none',
                  boxShadow: canAddToCart ? '0 4px 20px rgba(214, 178, 94, 0.3)' : 'none'
                }}
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
                      {t('product.added')}
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
                        className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                      />
                      {t('product.adding')}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {t('shop.addToCart')}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={toggleWishlist}
                  disabled={isPending}
                  className="h-12 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(214, 178, 94, 0.25)',
                    color: 'rgba(255, 255, 255, 0.85)'
                  }}
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${isWishlisted ? 'text-gold' : ''}`}
                    fill={isWishlisted ? 'var(--gold)' : 'none'}
                  />
                  <span>{isWishlisted ? t('product.saved') : t('product.save')}</span>
                </button>

                <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
                  <button className="h-12 w-full rounded-xl flex items-center justify-center gap-2 font-bold transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(214, 178, 94, 0.25)',
                      color: 'rgba(255, 255, 255, 0.85)'
                    }}
                  >
                    <ExternalLink className="w-5 h-5" />
                    {t('product.viewDetails')}
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