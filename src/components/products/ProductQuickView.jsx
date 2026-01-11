import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Minus, ShoppingBag, ZoomIn, ChevronLeft, ChevronRight, Star, Package, Truck, MapPin, Clock, Shield, CheckCircle2, Heart, ExternalLink, Palette, Ruler, Box, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ProductQuickView({ product, isOpen, onClose, onAddToCart }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(null);
  const [brand, setBrand] = useState(null);
  const [showZoom, setShowZoom] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toast } = useToast();

  // Build allImages array first
  const allImages = product ? [product.cover_image, ...images.map(img => img.url)].filter(Boolean) : [];

  // Extended color variants with more options
  const colorVariants = [
    { name: 'Schwarz', hex: '#000000', imageIndex: 0, gradient: 'from-zinc-900 to-black' },
    { name: 'Weiß', hex: '#FFFFFF', imageIndex: 1, gradient: 'from-zinc-100 to-white' },
    { name: 'Rot', hex: '#DC2626', imageIndex: 2, gradient: 'from-red-600 to-red-700' },
    { name: 'Blau', hex: '#2563EB', imageIndex: 3, gradient: 'from-blue-600 to-blue-700' },
    { name: 'Grün', hex: '#16A34A', imageIndex: 4, gradient: 'from-green-600 to-green-700' },
    { name: 'Grau', hex: '#6B7280', imageIndex: 5, gradient: 'from-gray-500 to-gray-600' },
    { name: 'Gelb', hex: '#EAB308', imageIndex: 6, gradient: 'from-yellow-500 to-yellow-600' },
    { name: 'Pink', hex: '#EC4899', imageIndex: 7, gradient: 'from-pink-500 to-pink-600' },
    { name: 'Lila', hex: '#9333EA', imageIndex: 8, gradient: 'from-purple-600 to-purple-700' },
    { name: 'Orange', hex: '#F97316', imageIndex: 9, gradient: 'from-orange-500 to-orange-600' }
  ].filter(variant => allImages[variant.imageIndex]);

  // Size options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const getColorImage = (imageIndex) => allImages[imageIndex] || selectedImage;

  useEffect(() => {
    if (product && isOpen) {
      loadProductDetails();
      setQuantity(1);
      setSelectedOptions({});
      setSelectedColor(null);
    }
  }, [product, isOpen]);

  const loadProductDetails = async () => {
    setLoading(true);
    try {
      // Load images
      const productImages = await base44.entities.ProductImage.filter({ product_id: product.id });
      setImages(productImages.sort((a, b) => a.sort_order - b.sort_order));
      setSelectedImage(product.cover_image || (productImages[0]?.url));

      // Load category
      if (product.category_id) {
        const cats = await base44.entities.Category.filter({ id: product.category_id });
        if (cats.length > 0) setCategory(cats[0]);
      }

      // Load brand
      if (product.brand_id) {
        const brands = await base44.entities.Brand.filter({ id: product.brand_id });
        if (brands.length > 0) setBrand(brands[0]);
      }
    } catch (error) {
      console.error('Error loading product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevImage = () => {
    const currentIndex = allImages.indexOf(selectedImage);
    const prevIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1;
    setSelectedImage(allImages[prevIndex]);
  };

  const handleNextImage = () => {
    const currentIndex = allImages.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % allImages.length;
    setSelectedImage(allImages[nextIndex]);
  };

  const handleAddToCart = async () => {
    if (!product.in_stock) return;

    try {
      await onAddToCart(product, quantity, selectedOptions);
      toast({
        title: '✨ Zum Warenkorb hinzugefügt!',
        description: `${quantity}x ${product.name}`
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Produkt konnte nicht hinzugefügt werden',
        variant: 'destructive'
      });
    }
  };

  if (!product) return null;

  const handleToggleWishlist = async () => {
    try {
      const user = await base44.auth.me();
      if (isWishlisted) {
        const items = await base44.entities.WishlistItem.filter({ user_id: user.id, product_id: product.id });
        if (items.length > 0) {
          await base44.entities.WishlistItem.delete(items[0].id);
        }
        setIsWishlisted(false);
        toast({ title: 'Von Wunschliste entfernt', duration: 2000 });
      } else {
        await base44.entities.WishlistItem.create({ user_id: user.id, product_id: product.id });
        setIsWishlisted(true);
        toast({ title: '💜 Zur Wunschliste hinzugefügt', duration: 2000 });
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-2 border-purple-500/20 p-0 rounded-3xl shadow-2xl shadow-purple-500/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid md:grid-cols-[1.2fr,1fr] gap-0 relative overflow-hidden"
        >
          {/* Gallery Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8 overflow-y-auto max-h-[95vh]"
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-6 left-6 z-10 px-4 py-2 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl shadow-purple-500/50"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-xs font-black text-white uppercase tracking-wider">Premium</span>
              </div>
            </motion.div>

            {/* Main Product Image */}
            <div className="relative aspect-square mb-6 rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 group shadow-2xl border-2 border-zinc-800/50">
              {selectedImage ? (
                <>
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Floating Action Buttons */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowZoom(true)}
                      className="p-3 bg-zinc-900/90 backdrop-blur-xl rounded-xl hover:bg-zinc-800 shadow-xl border border-white/10"
                    >
                      <ZoomIn className="w-5 h-5 text-white" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleToggleWishlist}
                      className={`p-3 backdrop-blur-xl rounded-xl shadow-xl border ${
                        isWishlisted 
                          ? 'bg-pink-500/90 border-pink-400/50' 
                          : 'bg-zinc-900/90 border-white/10 hover:bg-zinc-800'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'text-white fill-current' : 'text-white'}`} />
                    </motion.button>
                  </div>

                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1, x: -4 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-zinc-900/90 backdrop-blur-xl rounded-full hover:bg-zinc-800 shadow-xl transition-all opacity-0 group-hover:opacity-100 border border-white/10"
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1, x: 4 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-zinc-900/90 backdrop-blur-xl rounded-full hover:bg-zinc-800 shadow-xl transition-all opacity-0 group-hover:opacity-100 border border-white/10"
                      >
                        <ChevronRight className="w-6 h-6 text-white" />
                      </motion.button>
                    </>
                  )}

                  {/* Image Counter */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 backdrop-blur-xl rounded-full border border-white/10">
                      <span className="text-xs font-bold text-white">
                        {allImages.indexOf(selectedImage) + 1} / {allImages.length}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-zinc-300" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((img, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all shadow-xl ${
                      selectedImage === img
                        ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-purple-500/50'
                        : 'border-zinc-700 hover:border-purple-500/50'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {selectedImage === img && (
                      <motion.div
                        layoutId="activeThumb"
                        className="absolute inset-0 bg-purple-500/20 border-2 border-purple-400 rounded-2xl"
                        transition={{ type: "spring", bounce: 0.2 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 md:p-8 flex flex-col overflow-y-auto max-h-[95vh]"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-6 right-6 p-3 bg-zinc-900/80 hover:bg-zinc-800 rounded-xl transition-colors z-10 border border-white/10 shadow-xl backdrop-blur-xl"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>

            {/* Product Header */}
            <div className="mb-6 space-y-4">
              {/* Brand & Category */}
              <div className="flex items-center gap-3 flex-wrap">
                {brand && (
                  <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300 font-black uppercase tracking-wider">
                    {brand.name}
                  </Badge>
                )}
                {category && (
                  <Badge variant="outline" className="border-zinc-700 text-zinc-400 font-semibold">
                    {category.name}
                  </Badge>
                )}
                <Badge variant="outline" className="border-zinc-700 text-zinc-500 font-mono text-xs">
                  {product.sku}
                </Badge>
              </div>
              
              {/* Product Name */}
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight"
              >
                {product.name}
              </motion.h2>
              
              {/* Price & Availability */}
              <div className="flex items-center justify-between">
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                >
                  {product.price}€
                </motion.div>
                {product.in_stock ? (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-500/20 border-2 border-green-500/40 rounded-xl backdrop-blur-xl"
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-lg shadow-green-500/50" 
                    />
                    <span className="text-sm font-black text-green-300">Verfügbar</span>
                  </motion.div>
                ) : (
                  <div className="px-4 py-2.5 bg-red-500/20 border-2 border-red-500/40 rounded-xl backdrop-blur-xl">
                    <span className="text-sm font-black text-red-300">Ausverkauft</span>
                  </div>
                )}
              </div>

              {/* Short Description */}
              {product.description && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-zinc-400 leading-relaxed text-sm"
                >
                  {product.description}
                </motion.p>
              )}
            </div>

            {/* Color Selection - Premium Design */}
            {colorVariants.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mb-6 p-6 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border-2 border-purple-500/30 rounded-3xl backdrop-blur-xl shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-base text-white uppercase tracking-wide flex items-center gap-3">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50"
                    >
                      <Palette className="w-5 h-5 text-white" />
                    </motion.div>
                    Farbe wählen
                  </h3>
                  {selectedColor && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs font-bold text-purple-300 px-3 py-1.5 bg-purple-500/20 rounded-full"
                    >
                      {selectedColor}
                    </motion.span>
                  )}
                </div>
                
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {colorVariants.map((color, index) => {
                    const colorImage = getColorImage(color.imageIndex);
                    const isSelected = selectedColor === color.name;
                    
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.12, y: -6 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => {
                          setSelectedColor(color.name);
                          setSelectedImage(colorImage);
                        }}
                        className={`group relative aspect-square rounded-2xl overflow-hidden transition-all ${
                          isSelected
                            ? 'ring-4 ring-purple-400 shadow-2xl shadow-purple-500/70'
                            : 'ring-2 ring-zinc-700 hover:ring-purple-500/60 hover:shadow-xl hover:shadow-purple-500/40'
                        }`}
                      >
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${color.gradient} opacity-80`} />
                        
                        {/* Product Preview Thumbnail */}
                        <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity">
                          <img
                            src={colorImage}
                            alt={color.name}
                            className="w-full h-full object-cover mix-blend-overlay"
                          />
                        </div>
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Selection Check */}
                        {isSelected && (
                          <motion.div
                            layoutId="colorCheck"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                          >
                            <motion.div
                              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/80"
                            >
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </motion.div>
                          </motion.div>
                        )}
                        
                        {/* Color Name */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-2 py-2 backdrop-blur-sm">
                          <p className="text-xs font-black text-white text-center drop-shadow-lg">
                            {color.name}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Size Selection - Premium */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 p-6 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-500/10 border-2 border-blue-500/30 rounded-3xl backdrop-blur-xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-base text-white uppercase tracking-wide flex items-center gap-3">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50"
                  >
                    <Ruler className="w-5 h-5 text-white" />
                  </motion.div>
                  Größe wählen
                </h3>
                {selectedSize && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs font-bold text-blue-300 px-3 py-1.5 bg-blue-500/20 rounded-full"
                  >
                    {selectedSize}
                  </motion.span>
                )}
              </div>
              
              <div className="grid grid-cols-6 gap-3">
                {sizeOptions.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.1, y: -4 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedSize(size)}
                      className={`relative aspect-square rounded-2xl font-black text-sm transition-all overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white ring-4 ring-blue-400 shadow-2xl shadow-blue-500/70'
                          : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 ring-2 ring-zinc-700 hover:ring-blue-500/60 hover:text-white'
                      }`}
                    >
                      {/* Shimmer Effect */}
                      {isSelected && (
                        <motion.div
                          animate={{ x: [-100, 100] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                        />
                      )}
                      
                      <span className="relative z-10">{size}</span>
                      
                      {isSelected && (
                        <motion.div
                          layoutId="sizeCheck"
                          className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full"
                          transition={{ type: "spring", bounce: 0.4 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Shipping Info - Redesigned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-6 p-6 bg-zinc-900/50 border-2 border-zinc-800 rounded-3xl backdrop-blur-xl"
            >
              <h3 className="font-black text-sm text-white uppercase tracking-wide flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-purple-400" />
                Versandoptionen
              </h3>
              
              <div className="space-y-3">
                {/* Germany Shipping */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="group relative p-4 bg-gradient-to-r from-green-500/15 to-emerald-500/10 border-2 border-green-500/30 rounded-2xl overflow-hidden hover:border-green-400/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-xl shadow-green-500/30">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-green-400 uppercase">🇩🇪 Deutschland</p>
                      <p className="text-sm font-bold text-white">1-5 Werktage</p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="ml-auto w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-black"
                    >
                      ✓
                    </motion.div>
                  </div>
                </motion.div>

                {/* China Shipping */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="group relative p-4 bg-gradient-to-r from-orange-500/15 to-amber-500/10 border-2 border-orange-500/30 rounded-2xl overflow-hidden hover:border-orange-400/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-xl shadow-orange-500/30">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-orange-400 uppercase">🇨🇳 China</p>
                      <p className="text-sm font-bold text-white">8-15 Werktage</p>
                    </div>
                    <span className="ml-auto px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-black">
                      -15%
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-zinc-800 hover:bg-purple-500/20 transition-colors">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Options */}
            {product.option_schema && product.option_schema.options && (
              <div className="space-y-4 mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-wide">Optionen</h3>
                {product.option_schema.options.map((option, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium mb-2">{option.label}</label>
                    <Input
                      placeholder={option.placeholder || ''}
                      value={selectedOptions[option.name] || ''}
                      onChange={(e) =>
                        setSelectedOptions({ ...selectedOptions, [option.name]: e.target.value })
                      }
                      className="bg-zinc-900 border-zinc-700"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Quantity & CTA */}
            <div className="mt-auto space-y-4 pt-6 border-t border-zinc-800">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between p-4 bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl">
                <span className="text-sm font-black text-zinc-400 uppercase tracking-wider">Anzahl</span>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!product.in_stock}
                    className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center text-white disabled:opacity-50 border border-zinc-700"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.span 
                    key={quantity}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="w-16 text-center font-black text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  >
                    {quantity}
                  </motion.span>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.in_stock}
                    className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center text-white disabled:opacity-50 border border-zinc-700"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className="relative w-full h-16 rounded-2xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {/* Animated Background */}
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%]"
                />
                
                {/* Shine Effect */}
                <motion.div
                  animate={{ x: [-300, 300] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                />
                
                {/* Content */}
                <div className="relative z-10 flex items-center justify-center gap-3 h-full">
                  <ShoppingBag className="w-6 h-6 text-white drop-shadow-lg" />
                  <span className="text-lg font-black text-white uppercase tracking-wider drop-shadow-lg">
                    In den Warenkorb
                  </span>
                </div>
                
                {/* Border Glow */}
                <div className="absolute inset-0 rounded-2xl ring-2 ring-purple-400/50 group-hover:ring-4 transition-all" />
              </motion.button>

              {/* Product Link */}
              <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  className="w-full h-12 bg-zinc-900/50 hover:bg-zinc-800/50 border-2 border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-all font-bold"
                >
                  Vollständige Details ansehen
                  <ExternalLink className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
              </motion.div>

              {/* Zoom Modal */}
              <AnimatePresence>
              {showZoom && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
                onClick={() => setShowZoom(false)}
              >
                <button
                  className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-colors"
                  onClick={() => setShowZoom(false)}
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
              </motion.div>
              )}
              </AnimatePresence>
              </motion.div>
              </DialogContent>
              </Dialog>
              );
              }