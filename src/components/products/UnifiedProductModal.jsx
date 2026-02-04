import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    X, Heart, ShoppingBag, ChevronLeft, ChevronRight,
    Check, AlertCircle, Plus, Minus, Zap, Truck, MapPin, Package, Bell
} from 'lucide-react';
import { api } from '@/api';
import { useToast } from '@/components/ui/use-toast';
import { useWishlist } from '../wishlist/WishlistContext';
import { useI18n } from '../i18n/I18nProvider';
import confetti from 'canvas-confetti';

/**
 * UnifiedProductModal - A single premium modal for all product views
 * 
 * @param {Object} product - Product data object
 * @param {boolean} open - Modal open state
 * @param {Function} onClose - Callback when modal closes
 * @param {Function} onAddToCart - Callback when item is added to cart
 * @param {'full'|'quick'|'minimal'} mode - Display mode
 */
export default function UnifiedProductModal({
    product,
    open,
    onClose,
    onAddToCart,
    mode = 'full'
}) {
    const { t, formatCurrency, isRTL } = useI18n();
    const { toast } = useToast();
    const { isInWishlist, toggleWishlist } = useWishlist();

    // State
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [expressDelivery, setExpressDelivery] = useState(false);
    const [deliveryDate, setDeliveryDate] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Initialize state when product changes
    useEffect(() => {
        if (product && open) {
            // Set default color
            if (product.colors?.length > 0 && !selectedColor) {
                setSelectedColor(product.colors[0]);
            }

            setSelectedSize(null);
            setCurrentImageIndex(0);
            setQuantity(product.min_order_quantity || 1);
            setExpressDelivery(false);
            setShowSuccess(false);

            // Calculate delivery date
            updateDeliveryDate(false);
        }
    }, [product, open]);

    // Update delivery date when express changes
    useEffect(() => {
        updateDeliveryDate(expressDelivery);
    }, [expressDelivery]);

    const updateDeliveryDate = (isExpress) => {
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (isExpress ? 1 : 3));
        setDeliveryDate(targetDate.toLocaleDateString('de-DE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        }));
    };

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
    const currentImage = galleryImages[currentImageIndex] || product?.cover_image || '/placeholder.png';

    // Get current variant
    // Get current variant
    const getCurrentVariant = useCallback(() => {
        if (!product?.variants) return null; // Added safety check
        // If no color selected and no sizes, maybe return first variant or null
        if (!selectedColor && product.colors?.length > 0) return null;

        return product.variants.find(v => {
            // New Model based on options
            if (v.options) {
                const vColor = v.options.Color || v.options.color || v.options.Farbe;
                const vSize = v.options.Size || v.options.size || v.options.Größe;

                // If we have a selected color, it must match
                if (selectedColor && vColor && vColor !== selectedColor.name) return false;

                // If we have a selected size, it must match
                if (selectedSize && vSize && vSize !== selectedSize) return false;

                // If variant has size but none selected, it is not the current refined variant (unless only 1 size exists?)
                if (!selectedSize && vSize) return false;

                return true;
            }

            // Legacy Model
            if (selectedColor) {
                return v.color_id === selectedColor.id &&
                    v.size === selectedSize &&
                    v.active !== false
            }
            return false;
        });
    }, [product, selectedColor, selectedSize]);

    const currentVariant = getCurrentVariant();

    // Calculate price with safety guards
    const basePrice = currentVariant?.price_override ?? product?.price ?? 0;
    const currentPrice = expressDelivery ? basePrice + 4.90 : basePrice;

    // Stock checking
    // Stock checking
    const getStockForSize = (size) => {
        if (!product?.variants || !selectedColor) return 0;
        const variant = product.variants.find(v => {
            if (v.options) {
                const vColor = v.options.Color || v.options.color || v.options.Farbe;
                const vSize = v.options.Size || v.options.size || v.options.Größe;
                return (vColor === selectedColor.name) && (vSize === size);
            }
            if (v.color_id && selectedColor) {
                return v.color_id === selectedColor.id && v.size === size && v.active !== false;
            }
            return false;
        });
        return variant?.stock ?? 0;
    };

    const totalColorStock = selectedColor
        ? product?.variants?.filter(v => {
            if (v.options) {
                const vColor = v.options.Color || v.options.color || v.options.Farbe;
                return vColor === selectedColor.name;
            }
            return v.color_id === selectedColor.id && v.active !== false;
        }).reduce((sum, v) => sum + (v.stock || 0), 0) || 0
        : 0;

    // Color change handler
    const handleColorChange = (color) => {
        setSelectedColor(color);
        setSelectedSize(null);
        setCurrentImageIndex(0);
    };

    // Image navigation
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
                title: t('product.pleaseSelectSize') || 'Größe wählen',
                description: t('product.pleaseSelect') || 'Bitte wähle eine Größe aus',
                variant: 'destructive'
            });
            return;
        }

        setIsAdding(true);

        // Confetti explosion
        confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D6B25E', '#F2D27C', '#FFFFFF', '#000000']
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
                    is_express: expressDelivery
                }
            };

            await api.entities.StarCartItem.create(cartData);

            setShowSuccess(true);

            toast({
                title: t('product.added') || 'Hinzugefügt! ✓',
                description: `${quantity}x ${product.name}${expressDelivery ? ' (EXPRESS)' : ''}`,
            });

            if (onAddToCart) onAddToCart(cartData);

            setTimeout(() => {
                setShowSuccess(false);
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
                title: isInWishlist(product.id)
                    ? (t('product.removed') || 'Entfernt')
                    : (t('product.saved') || 'Gespeichert ❤️'),
                description: isInWishlist(product.id)
                    ? 'Von Merkliste entfernt'
                    : 'Zur Merkliste hinzugefügt'
            });
        } catch (error) {
            console.error('Wishlist error:', error);
        }
    };

    // Tabs state
    const [activeTab, setActiveTab] = useState('details');

    if (!product) return null;

    const isVariantComplete = !product?.sizes?.length || selectedSize;
    const hasStock = product?.in_stock && (currentVariant ? currentVariant.stock > 0 : totalColorStock > 0 || !product?.variants?.length);
    const currentStock = currentVariant?.stock ?? totalColorStock ?? 0;
    const isLowStock = hasStock && currentStock <= 5 && currentStock > 0;
    const needsSizeSelection = (product?.sizes?.length ?? 0) > 0 && !selectedSize;
    const canAddToCart = hasStock && isVariantComplete && !showSuccess;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent
                className="max-w-5xl p-0 gap-0 overflow-hidden max-h-[95vh] overflow-y-auto border-0 bg-transparent shadow-2xl"
                style={{
                    animationDuration: '0.4s'
                }}
            >
                <div
                    className="relative w-full flex flex-col md:flex-row overflow-hidden rounded-3xl"
                    style={{
                        background: 'rgba(12, 12, 16, 0.85)',
                        backdropFilter: 'blur(40px)',
                        boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 32px 64px rgba(0,0,0,0.7)',
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className={`absolute top-5 ${isRTL ? 'left-5' : 'right-5'} z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-black/80 hover:text-white transition-all hover:scale-110 active:scale-95`}
                        aria-label={t('common.close') || 'Schließen'}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Gallery Section */}
                    <div className="relative md:w-1/2 bg-gradient-to-br from-zinc-900/50 to-black/50">
                        <div
                            className="relative aspect-[4/5] md:aspect-auto md:h-full overflow-hidden"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentImage}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="w-full h-full"
                                >
                                    <img
                                        src={currentImage || ''}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Vignette Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation Arrows */}
                            {galleryImages.length > 1 && (
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={prevImage}
                                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-all hover:scale-110"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-all hover:scale-110"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            {/* Wishlist Button */}
                            <button
                                onClick={handleWishlistToggle}
                                className={`absolute top-5 left-5 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 ${isInWishlist(product.id)
                                    ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                                    : 'bg-black/30 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                            </button>

                            {/* Tags / Badges */}
                            <div className="absolute top-5 left-16 flex gap-2">
                                {product.tags?.includes('Premium') && (
                                    <Badge className="bg-[#D6B25E]/90 text-black backdrop-blur-md border border-[#D6B25E]/50 shadow-lg">
                                        Premium
                                    </Badge>
                                )}
                                {product.tags?.includes('Bestseller') && (
                                    <Badge className="bg-purple-500/90 text-white backdrop-blur-md border border-purple-500/50 shadow-lg">
                                        Bestseller
                                    </Badge>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {galleryImages.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10">
                                    {galleryImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`relative w-10 h-10 rounded-lg overflow-hidden transition-all ${currentImageIndex === idx
                                                ? 'ring-2 ring-[#D6B25E] scale-110'
                                                : 'opacity-50 hover:opacity-100 hover:scale-105'
                                                }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info Section */}
                    <div className="flex flex-col md:w-1/2 max-h-[90vh] md:max-h-full overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold tracking-widest text-[#D6B25E] uppercase bg-[#D6B25E]/10 px-2 py-1 rounded">
                                        {product.brand_id || 'Nebula Premium'}
                                    </span>
                                    {hasStock ? (
                                        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            {t('shop.available') || 'Auf Lager'}
                                        </span>
                                    ) : (
                                        <span className="text-red-500 text-xs font-bold uppercase tracking-wider">
                                            {t('shop.soldOut') || 'Ausverkauft'}
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight tracking-tight">
                                    {product.name}
                                </h2>

                                <div className="flex items-baseline gap-4 pb-6 border-b border-white/5">
                                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D6B25E] to-[#F2D27C]">
                                        {formatCurrency ? formatCurrency(currentPrice) : `${currentPrice.toFixed(2)}€`}
                                    </span>
                                    {expressDelivery && (
                                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-500/20">
                                            <Zap className="w-3 h-3 fill-current" />
                                            EXPRESS
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-6 mb-6 border-b border-white/5">
                                {['details', 'reviews'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/70'
                                            }`}
                                    >
                                        {tab === 'details' ? (t('product.details') || 'Details') : (t('product.reviews') || 'Bewertungen')}
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D6B25E]"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'details' ? (
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        {/* Description */}
                                        <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                                            {product.description || 'Keine Beschreibung verfügbar.'}
                                        </p>

                                        {/* Configuration Area */}
                                        <div className="space-y-6">
                                            {/* Color/Variant Selector */}
                                            {product.colors?.length > 0 && (
                                                <div className="space-y-3">
                                                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                                                        {t('product.variant') || 'Variante'}: <span className="text-white">{selectedColor?.name}</span>
                                                    </span>
                                                    <div className="flex flex-wrap gap-3">
                                                        {product.colors.map((color) => {
                                                            const isSelected = selectedColor?.id === color.id;
                                                            return (
                                                                <button
                                                                    key={color.id}
                                                                    onClick={() => handleColorChange(color)}
                                                                    className={`
                                                                        group relative w-12 h-12 rounded-xl transition-all duration-300
                                                                        ${isSelected ? 'ring-2 ring-[#D6B25E] scale-110 shadow-lg shadow-[#D6B25E]/20' : 'ring-1 ring-white/10 hover:ring-white/30 hover:scale-105'}
                                                                    `}
                                                                    title={color.name}
                                                                >
                                                                    {color.thumbnail ? (
                                                                        <img src={color.thumbnail} alt={color.name} className="w-full h-full object-cover rounded-xl" />
                                                                    ) : (
                                                                        <div className="w-full h-full rounded-xl" style={{ backgroundColor: color.hex }} />
                                                                    )}
                                                                    {isSelected && (
                                                                        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                                                                            <Check className="w-5 h-5 text-white drop-shadow-md" />
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Size Selector */}
                                            {product.sizes?.length > 0 && (
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                                                            {t('product.size') || 'Größe'}
                                                        </span>
                                                        {needsSizeSelection && (
                                                            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded animate-pulse">
                                                                {t('product.pleaseSelect') || 'Bitte wählen'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {product.sizes.map((size) => {
                                                            const stock = getStockForSize(size);
                                                            const disabled = product.variants?.length > 0 && stock <= 0;
                                                            return (
                                                                <button
                                                                    key={size}
                                                                    onClick={() => !disabled && setSelectedSize(size)}
                                                                    disabled={disabled}
                                                                    className={`
                                                                        h-10 min-w-[3rem] px-3 rounded-lg text-sm font-bold border transition-all
                                                                        ${selectedSize === size
                                                                            ? 'border-[#D6B25E] bg-[#D6B25E] text-black shadow-lg shadow-[#D6B25E]/20'
                                                                            : disabled
                                                                                ? 'border-white/5 text-white/20 bg-white/5 cursor-not-allowed decoration-slice line-through'
                                                                                : 'border-white/10 text-white/60 hover:border-white/30 hover:bg-white/5'}
                                                                    `}
                                                                >
                                                                    {size}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Shipping & Delivery Info */}
                                            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-transparent border border-emerald-500/10">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Truck className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                                        {t('product.delivery') || 'Lieferung'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Delivery Time */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                            <Package className="w-4 h-4 text-zinc-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-zinc-500 uppercase">Lieferzeit</p>
                                                            <p className="text-sm font-bold text-white">
                                                                {product.lead_time_days
                                                                    ? `${product.lead_time_days} Tage`
                                                                    : expressDelivery ? '1 Tag' : '2-4 Tage'
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {/* Ship From */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                            <MapPin className="w-4 h-4 text-zinc-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-zinc-500 uppercase">Versand ab</p>
                                                            <p className="text-sm font-bold text-white">
                                                                {product.ship_from || 'Deutschland'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Estimated Delivery Date */}
                                                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                                                    <span className="text-xs text-zinc-500">Voraussichtlich bei dir:</span>
                                                    <span className="text-sm font-bold text-emerald-400">{deliveryDate}</span>
                                                </div>
                                            </div>

                                            {/* Quantity & Express Toggle */}
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center bg-black/30 rounded-lg p-1 border border-white/10">
                                                        <button
                                                            onClick={() => setQuantity(Math.max(product.min_order_quantity || 1, quantity - 1))}
                                                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-white transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-8 text-center font-mono font-bold text-white text-sm">{quantity}</span>
                                                        <button
                                                            onClick={() => setQuantity(quantity + 1)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-white transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    {(product.min_order_quantity ?? 0) > 1 && (
                                                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                                                            <AlertCircle className="w-3 h-3 text-amber-400" />
                                                            <span className="text-[10px] text-amber-400 font-bold">Min. {product.min_order_quantity} Stk.</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {mode === 'full' && (
                                                    <div
                                                        className="flex items-center gap-2 cursor-pointer group"
                                                        onClick={() => setExpressDelivery(!expressDelivery)}
                                                    >
                                                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${expressDelivery ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${expressDelivery ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className={`text-xs font-bold transition-colors ${expressDelivery ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>Express +4,90€</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="reviews"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="py-10 text-center"
                                    >
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4 border border-white/10">
                                            <span className="text-2xl">⭐</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">Noch keine Bewertungen</h3>
                                        <p className="text-zinc-400 text-sm max-w-xs mx-auto">
                                            Sei der Erste, der dieses Produkt bewertet und hilf anderen bei ihrer Entscheidung.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 md:p-8 bg-black/20 backdrop-blur-xl border-t border-white/5 z-10">
                            {/* Validation & Total */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-0.5">{t('product.total') || 'Gesamt'}</p>
                                    <div className="text-xl font-black text-white">
                                        {formatCurrency ? formatCurrency(currentPrice * quantity) : `${(currentPrice * quantity).toFixed(2)}€`}
                                    </div>
                                </div>

                                {needsSizeSelection && (
                                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-500/20 animate-pulse">
                                        <AlertCircle className="w-3 h-3" />
                                        Bitte Größe wählen
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleAddToCart}
                                disabled={!canAddToCart || isAdding}
                                className="w-full h-14 rounded-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    background: canAddToCart
                                        ? 'linear-gradient(135deg, #D6B25E 0%, #F2D27C 100%)'
                                        : 'rgba(255,255,255,0.05)',
                                    color: canAddToCart ? 'black' : 'rgba(255,255,255,0.3)',
                                    boxShadow: canAddToCart ? '0 8px 32px rgba(214, 178, 94, 0.25)' : 'none'
                                }}
                            >
                                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                <AnimatePresence mode="wait">
                                    {showSuccess ? (
                                        <motion.div
                                            key="success"
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            className="relative flex items-center justify-center gap-2 font-black text-lg"
                                        >
                                            <Check className="w-6 h-6 border-2 border-black rounded-full p-0.5" />
                                            Hinzugefügt!
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="default"
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            className="relative flex items-center justify-center gap-2 font-black text-lg tracking-wide uppercase"
                                        >
                                            {isAdding ? (
                                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <ShoppingBag className="w-5 h-5" />
                                                    {t('shop.addToCart') || 'In den Warenkorb'}
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>

                            {/* Notify Me Button for Out of Stock */}
                            {!hasStock && (
                                <Button
                                    onClick={() => {
                                        toast({
                                            title: '🔔 Du wirst benachrichtigt!',
                                            description: `Wir lassen es dich wissen, sobald "${product?.name}" wieder verfügbar ist.`,
                                        });
                                    }}
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
                                >
                                    <Bell className="w-4 h-4" />
                                    Benachrichtigen wenn verfügbar
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
