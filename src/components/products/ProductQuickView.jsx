import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Minus, ShoppingBag, ZoomIn, ChevronLeft, ChevronRight, Star, Package, Truck, MapPin, Clock } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(null);
  const [brand, setBrand] = useState(null);
  const [showZoom, setShowZoom] = useState(false);
  const { toast } = useToast();

  // Build allImages array first
  const allImages = product ? [product.cover_image, ...images.map(img => img.url)].filter(Boolean) : [];

  // Color variants intelligently mapped to available images
  const colorVariants = [
    { 
      name: 'Schwarz', 
      hex: '#000000', 
      imageIndex: 0,
      keywords: ['schwarz', 'black', 'dark']
    },
    { 
      name: 'Weiß', 
      hex: '#FFFFFF', 
      imageIndex: 1,
      keywords: ['weiß', 'white', 'light']
    },
    { 
      name: 'Rot', 
      hex: '#DC2626', 
      imageIndex: 2,
      keywords: ['rot', 'red']
    },
    { 
      name: 'Blau', 
      hex: '#2563EB', 
      imageIndex: 3,
      keywords: ['blau', 'blue']
    },
    { 
      name: 'Grün', 
      hex: '#16A34A', 
      imageIndex: 4,
      keywords: ['grün', 'green']
    }
  ].filter(variant => allImages[variant.imageIndex]);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-zinc-950 to-zinc-900 border-2 border-purple-500/30 p-0 rounded-3xl shadow-2xl shadow-purple-600/40">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid md:grid-cols-2 gap-0 relative"
        >
          {/* Gradient Background Glow */}
          <div className="absolute -inset-1 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-transparent rounded-3xl blur-2xl -z-10" />
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-gradient-to-br from-zinc-900/80 to-black/50 p-6 border-r border-purple-500/10"
          >
            {/* Main Image */}
            <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-zinc-800 group">
              {selectedImage ? (
                <>
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Zoom Button */}
                  <button
                    onClick={() => setShowZoom(true)}
                    className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur rounded-lg hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ZoomIn className="w-5 h-5 text-white" />
                  </button>

                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur rounded-full hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur rounded-full hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-zinc-700" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? 'border-purple-500 ring-2 ring-purple-500/50'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                </div>
                )}
                </motion.div>

                {/* Details Section */}
                <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="p-6 flex flex-col bg-gradient-to-br from-zinc-900/50 to-zinc-900/20"
                >
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="outline" className="text-purple-400 border-purple-500/50 font-mono font-black">
                  ID: {product.sku}
                </Badge>
                {brand && (
                  <Badge variant="outline" className="text-zinc-400">
                    {brand.name}
                  </Badge>
                )}
                {category && (
                  <Badge variant="outline" className="text-zinc-400">
                    {category.name}
                  </Badge>
                )}
                {product.in_stock ? (
                  <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                    Verfügbar
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                    Ausverkauft
                  </Badge>
                )}
              </div>
              
              <h2 className="text-3xl font-black mb-4">{product.name}</h2>
              
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {product.price}€
                </span>
                {product.currency && product.currency !== 'EUR' && (
                  <span className="text-sm text-zinc-500">{product.currency}</span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-zinc-400 leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Color Variants with Image Preview */}
            {colorVariants.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mb-6 p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-2xl"
              >
                <h3 className="font-black text-base text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  Verfügbare Farben
                </h3>
                
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {colorVariants.map((color, index) => {
                    const colorImage = getColorImage(color.imageIndex);
                    const isSelected = selectedColor === color.name;
                    
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.08, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedColor(color.name);
                          setSelectedImage(colorImage);
                        }}
                        className={`group relative aspect-square rounded-xl border-3 overflow-hidden transition-all ${
                          isSelected
                            ? 'border-purple-400 shadow-2xl shadow-purple-500/60 ring-2 ring-purple-400/50'
                            : 'border-zinc-700 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/30'
                        }`}
                      >
                        {/* Thumbnail Image */}
                        <img
                          src={colorImage}
                          alt={color.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        
                        {/* Color Overlay */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none"
                          style={{ backgroundColor: color.hex }}
                        />
                        
                        {/* Selection Indicator */}
                        {isSelected && (
                          <motion.div
                            layoutId="colorSelector"
                            className="absolute inset-0 border-3 border-purple-300 rounded-xl flex items-center justify-center bg-black/20"
                            transition={{ type: "spring", bounce: 0.3 }}
                          >
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              className="w-3 h-3 bg-purple-400 rounded-full"
                            />
                          </motion.div>
                        )}
                        
                        {/* Label */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1">
                          <p className="text-xs font-black text-white text-center truncate">
                            {color.name}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                
                {selectedColor && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 border border-purple-500/40 rounded-lg"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colorVariants.find(c => c.name === selectedColor)?.hex }}
                    />
                    <span className="text-sm font-bold text-purple-300">
                      Ausgewählt: <span className="text-purple-100">{selectedColor}</span>
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Shipping Info Card - Advanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              {/* Shipping Options */}
              <div className="space-y-3">
                {/* Germany Shipping */}
                <motion.div
                  whileHover={{ x: 4 }}
                  className="group relative p-4 bg-gradient-to-br from-green-500/15 via-emerald-500/10 to-green-600/10 border-2 border-green-500/40 rounded-2xl overflow-hidden hover:border-green-400/60 transition-all cursor-pointer"
                >
                  <div className="absolute -inset-px bg-gradient-to-br from-green-500/0 via-transparent to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl -z-10" />
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/50 transition-all">
                        <Truck className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-green-300 uppercase tracking-wider mb-1">Versand aus Deutschland</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-green-400" />
                            <span className="font-black text-sm text-green-200">1-5 Werktage</span>
                          </div>
                          <span className="text-green-500/60">•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-emerald-400" />
                            <span className="font-bold text-sm text-green-200">🇩🇪 DE</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-lg font-black flex-shrink-0"
                    >
                      ✓
                    </motion.div>
                  </div>
                </motion.div>

                {/* China Shipping */}
                <motion.div
                  whileHover={{ x: 4 }}
                  className="group relative p-4 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-yellow-600/10 border-2 border-orange-500/30 rounded-2xl overflow-hidden hover:border-orange-400/60 transition-all cursor-pointer"
                >
                  <div className="absolute -inset-px bg-gradient-to-br from-orange-500/0 via-transparent to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl -z-10" />
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-all">
                        <Truck className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-orange-300 uppercase tracking-wider mb-1">Versand aus China</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-orange-400" />
                            <span className="font-black text-sm text-orange-200">8-15 Werktage</span>
                          </div>
                          <span className="text-orange-500/60">•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-amber-400" />
                            <span className="font-bold text-sm text-orange-200">🇨🇳 CN</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-black flex-shrink-0"
                    >
                      BUDGET
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Info Banner */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-2"
              >
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-xs font-medium text-blue-200">
                  Der Versand wird bei Bestellung automatisch ausgewählt. Schneller Versand aus DE ist Standard.
                </p>
              </motion.div>
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

            {/* Quantity & Add to Cart */}
            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-zinc-400">Anzahl:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!product.in_stock}
                    className="h-10 w-10 border-zinc-700"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.in_stock}
                    className="h-10 w-10 border-zinc-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className="w-full h-14 text-lg neon-button bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-[1.02] transition-transform shadow-xl shadow-purple-500/50"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                In den Warenkorb
              </Button>
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