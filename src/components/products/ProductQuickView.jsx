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

  // Color variants with their images
  const colorVariants = [
    { name: 'Schwarz', hex: '#000000', image: product?.cover_image || images[0]?.url },
    { name: 'Weiß', hex: '#FFFFFF', image: images[1]?.url || product?.cover_image },
    { name: 'Rot', hex: '#DC2626', image: images[2]?.url || product?.cover_image },
    { name: 'Blau', hex: '#2563EB', image: images[3]?.url || product?.cover_image },
    { name: 'Grün', hex: '#16A34A', image: images[4]?.url || product?.cover_image }
  ].filter(v => v.image);

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

  const allImages = [product?.cover_image, ...images.map(img => img.url)].filter(Boolean);

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

            {/* Color Variants */}
            {colorVariants.length > 1 && (
              <div className="mb-6 p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-2xl">
                <h3 className="font-black text-base text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  Farbe wählen
                </h3>
                <div className="flex flex-wrap gap-3">
                  {colorVariants.map((color, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setSelectedColor(color.name);
                        setSelectedImage(color.image);
                      }}
                      className={`group relative w-16 h-16 rounded-2xl border-3 transition-all overflow-hidden ${
                        selectedColor === color.name
                          ? 'border-purple-400 shadow-2xl shadow-purple-500/60 scale-110'
                          : 'border-zinc-700 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/30'
                      }`}
                    >
                      <div 
                        className="absolute inset-0 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: color.hex }}
                      />
                      {selectedColor === color.name && (
                        <motion.div
                          layoutId="selectedColor"
                          className="absolute inset-0 border-4 border-purple-400 rounded-2xl"
                          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xs font-black ${color.hex === '#000000' ? 'text-white' : 'text-zinc-900'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                          {color.name[0]}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
                {selectedColor && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-sm font-bold text-purple-300 flex items-center gap-2"
                  >
                    <Star className="w-4 h-4 fill-purple-400 text-purple-400" />
                    Gewählt: {selectedColor}
                  </motion.p>
                )}
              </div>
            )}

            {/* Shipping Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 p-5 bg-gradient-to-br from-green-500/10 to-blue-500/10 border-2 border-green-500/30 rounded-2xl space-y-4"
            >
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-400" />
                <h3 className="font-black text-sm text-white uppercase tracking-wide">Versandinformationen</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <p className="text-xs font-bold text-zinc-400 uppercase">Lieferfrist</p>
                  </div>
                  <p className="text-lg font-black text-green-300">
                    {product.delivery_time || '2-5 Tage'}
                  </p>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <p className="text-xs font-bold text-zinc-400 uppercase">Lieferort</p>
                  </div>
                  <p className="text-lg font-black text-blue-300">
                    {product.delivery_location || 'Deutschland'}
                  </p>
                </div>
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