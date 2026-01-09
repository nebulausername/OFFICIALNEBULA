import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Plus, Minus, ArrowLeft, ChevronLeft, ChevronRight, Heart, Star, Shield, Zap, Package, Truck, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [brand, setBrand] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');

      if (!productId) {
        toast({
          title: 'Fehler',
          description: 'Produkt nicht gefunden',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      const [productData, productImages] = await Promise.all([
        base44.entities.Product.filter({ id: productId }),
        base44.entities.ProductImage.filter({ product_id: productId })
      ]);

      if (productData.length === 0) {
        toast({
          title: 'Fehler',
          description: 'Produkt nicht gefunden',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      const prod = productData[0];
      setProduct(prod);
      setImages(productImages.sort((a, b) => a.sort_order - b.sort_order));
      setSelectedImage(prod.cover_image || (productImages[0]?.url));

      // Load related data
      if (prod.category_id) {
        const cats = await base44.entities.Category.filter({ id: prod.category_id });
        if (cats.length > 0) setCategory(cats[0]);
      }

      if (prod.brand_id) {
        const brands = await base44.entities.Brand.filter({ id: prod.brand_id });
        if (brands.length > 0) setBrand(brands[0]);
      }

      // Load related products (same category)
      if (prod.category_id) {
        const related = await base44.entities.Product.filter({ category_id: prod.category_id });
        const filteredRelated = related.filter(rp => rp.id !== prod.id).slice(0, 4);
        setRelatedProducts(filteredRelated);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: 'Fehler',
        description: 'Produkt konnte nicht geladen werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const user = await base44.auth.me();

      // Check if item already in cart
      const existing = await base44.entities.StarCartItem.filter({
        user_id: user.id,
        product_id: product.id
      });

      if (existing.length > 0) {
        await base44.entities.StarCartItem.update(existing[0].id, {
          quantity: existing[0].quantity + quantity,
          selected_options: selectedOptions
        });
      } else {
        await base44.entities.StarCartItem.create({
          user_id: user.id,
          product_id: product.id,
          quantity: quantity,
          selected_options: selectedOptions
        });
      }

      toast({
        title: 'Zum Warenkorb hinzugefügt',
        description: `${quantity}x ${product.name}`
      });

      setTimeout(() => {
        window.location.href = createPageUrl('Cart');
      }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Fehler',
        description: 'Produkt konnte nicht hinzugefügt werden',
        variant: 'destructive'
      });
    }
  };

  const calculatePrice = () => {
    let basePrice = product.price;
    
    if (product.option_schema?.options) {
      product.option_schema.options.forEach(option => {
        const selectedValue = selectedOptions[option.name];
        if (selectedValue && option.values) {
          const valueObj = option.values.find(v => v.value === selectedValue);
          if (valueObj?.price_modifier) {
            basePrice += valueObj.price_modifier;
          }
        }
      });
    }
    
    return basePrice;
  };

  const navigateImage = (direction) => {
    const allImages = [product.cover_image, ...images.map(img => img.url)].filter(Boolean);
    const currentIndex = allImages.indexOf(selectedImage);
    
    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % allImages.length;
      setSelectedImage(allImages[nextIndex]);
    } else {
      const prevIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1;
      setSelectedImage(allImages[prevIndex]);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square skeleton rounded-2xl" />
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square skeleton rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-12 skeleton rounded-lg w-3/4" />
            <div className="h-8 skeleton rounded-lg w-1/4" />
            <div className="h-32 skeleton rounded-lg" />
            <div className="h-16 skeleton rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Produkt nicht gefunden</h2>
        <Link to={createPageUrl('Products')}>
          <Button>Zurück zu Produkten</Button>
        </Link>
      </div>
    );
  }

  const allImages = [product.cover_image, ...images.map(img => img.url)].filter(Boolean);
  const currentPrice = calculatePrice();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to={createPageUrl('Products')}
        className="inline-flex items-center space-x-2 text-zinc-400 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Zurück zu Produkten</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Gallery */}
        <div className="space-y-4">
          {/* Main Image with Navigation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl overflow-hidden border border-zinc-800 group"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-24 h-24 text-zinc-700" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => navigateImage('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Favorite Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute top-4 right-4 w-12 h-12 bg-black/60 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </motion.button>

            {/* Image Counter */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur rounded-full text-sm font-medium">
                {allImages.indexOf(selectedImage) + 1} / {allImages.length}
              </div>
            )}
          </motion.div>

          {/* Image Thumbnails Gallery */}
          {allImages.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-5 gap-2"
            >
              {allImages.map((imgUrl, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === imgUrl
                      ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/30'
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link to={createPageUrl('Products')} className="text-zinc-400 hover:text-purple-400 transition-colors">
              Shop
            </Link>
            {category && (
              <>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-400">{category.name}</span>
              </>
            )}
            {brand && (
              <>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-400">{brand.name}</span>
              </>
            )}
          </div>

          {/* Title & Status */}
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">{product.name}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <Badge variant="outline" className="px-3 py-1 bg-zinc-800 text-zinc-400 font-mono font-semibold border-zinc-700">
                {product.sku}
              </Badge>
              {product.in_stock ? (
                <Badge className="px-4 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 font-bold">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1.5" />
                  Auf Lager
                </Badge>
              ) : (
                <Badge className="px-4 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 font-bold">
                  Ausverkauft
                </Badge>
              )}
              {brand && (
                <Badge variant="outline" className="px-3 py-1 bg-purple-500/10 text-purple-400 border-purple-500/30">
                  {brand.name}
                </Badge>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="py-6 border-y border-zinc-800">
            <div className="flex items-baseline gap-3">
              <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                {currentPrice.toFixed(2)}€
              </div>
              {currentPrice !== product.price && (
                <div className="text-2xl text-zinc-500 line-through">
                  {product.price}€
                </div>
              )}
            </div>
            {product.currency && product.currency !== 'EUR' && (
              <div className="text-sm text-zinc-500 mt-2">Preis in {product.currency}</div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative group"
            >
              <div className="absolute -inset-px bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative glass backdrop-blur-xl border border-purple-500/30 group-hover:border-purple-400/60 rounded-2xl p-6 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    Produktbeschreibung
                  </h3>
                </div>
                <p className="text-zinc-300 leading-relaxed text-base font-medium">{product.description}</p>

                {/* Additional Info Bar */}
                <div className="mt-4 pt-4 border-t border-zinc-700 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-purple-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    <span>Premium Material</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    <span>Qualitätsgeprüft</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Shipping Info Card - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50"
              >
                <Truck className="w-5 h-5 text-white" />
              </motion.div>
              <h3 className="text-xl font-black bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                Versandoptionen
              </h3>
            </div>

            {/* Germany Shipping */}
            <motion.div
              whileHover={{ x: 4, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-5 bg-gradient-to-br from-green-500/15 via-emerald-500/10 to-green-600/10 border-2 border-green-500/40 rounded-2xl overflow-hidden hover:border-green-400/60 hover:shadow-lg hover:shadow-green-500/30 transition-all cursor-pointer"
            >
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl group-hover:opacity-100 opacity-0 transition-opacity" />

              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/50 flex-shrink-0"
                  >
                    <Truck className="w-7 h-7 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-green-300 uppercase tracking-widest mb-2">🚚 Express aus Deutschland</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 bg-green-500/20 px-2.5 py-1 rounded-lg">
                        <Clock className="w-4 h-4 text-green-400" />
                        <span className="font-black text-sm text-green-200">1-5 Werktage</span>
                      </motion.div>
                      <div className="flex items-center gap-1.5 bg-green-500/20 px-2.5 py-1 rounded-lg">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-sm text-green-200">DE</span>
                      </div>
                    </div>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-lg font-black flex-shrink-0 shadow-lg"
                >
                  ✓
                </motion.div>
              </div>
            </motion.div>

            {/* China Shipping */}
            <motion.div
              whileHover={{ x: 4, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-5 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-yellow-600/10 border-2 border-orange-500/30 rounded-2xl overflow-hidden hover:border-orange-400/60 hover:shadow-lg hover:shadow-orange-500/30 transition-all cursor-pointer"
            >
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl group-hover:opacity-100 opacity-0 transition-opacity" />

              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: -360 }}
                    transition={{ duration: 0.6 }}
                    className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/50 flex-shrink-0"
                  >
                    <Truck className="w-7 h-7 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-orange-300 uppercase tracking-widest mb-2">🌍 Budget aus China</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 bg-orange-500/20 px-2.5 py-1 rounded-lg">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="font-black text-sm text-orange-200">8-15 Werktage</span>
                      </motion.div>
                      <div className="flex items-center gap-1.5 bg-orange-500/20 px-2.5 py-1 rounded-lg">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-sm text-orange-200">CN</span>
                      </div>
                    </div>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-black flex-shrink-0 shadow-lg shadow-orange-500/50"
                >
                  BUDGET
                </motion.div>
              </div>
            </motion.div>

            {/* Info Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
              <p className="text-xs font-medium text-blue-200">
                Versand wird bei Bestellung automatisch ausgewählt. Standard ist der schnelle Versand aus Deutschland mit DHL/DPD.
              </p>
            </motion.div>
          </motion.div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-zinc-800 text-zinc-300">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Options with Price Impact */}
          {product.option_schema?.options && product.option_schema.options.length > 0 && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-white">Optionen wählen</h3>
              {product.option_schema.options.map((option, index) => (
                <div key={index} className="space-y-3">
                  <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    {option.name}
                    {selectedOptions[option.name] && (
                      <span className="text-xs text-purple-400">
                        • {selectedOptions[option.name]}
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {option.values?.map((val, valIndex) => {
                      const isSelected = selectedOptions[option.name] === val.value;
                      const priceModifier = val.price_modifier || 0;
                      
                      return (
                        <motion.button
                          key={valIndex}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            setSelectedOptions({ ...selectedOptions, [option.name]: val.value })
                          }
                          className={`relative px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                            isSelected
                              ? 'border-purple-500 bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/30'
                              : 'border-zinc-800 hover:border-zinc-600 text-zinc-300'
                          }`}
                        >
                          <div className="text-sm">{val.label || val.value}</div>
                          {priceModifier !== 0 && (
                            <div className={`text-xs mt-1 ${isSelected ? 'text-purple-300' : 'text-zinc-500'}`}>
                              {priceModifier > 0 ? '+' : ''}{priceModifier}€
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4 pt-6">
            <div>
              <label className="text-sm font-bold text-white mb-3 block">Anzahl</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 glass backdrop-blur border border-zinc-800 rounded-xl p-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-purple-500/20 rounded-lg transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </motion.button>
                  <span className="w-12 text-center font-bold text-xl">{quantity}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-purple-500/20 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.in_stock}
                    className="w-full h-14 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:shadow-2xl hover:shadow-purple-500/50 text-lg font-black shadow-xl shadow-purple-500/30 rounded-xl transition-all animate-gradient disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-6 h-6 mr-2" />
                    {product.in_stock ? 'In den Warenkorb' : 'Ausverkauft'}
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Total Price Preview */}
            <div className="glass backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Gesamtpreis:</span>
                <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {(currentPrice * quantity).toFixed(2)}€
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <motion.div 
              whileHover={{ y: -5 }}
              className="flex flex-col items-center text-center p-5 glass backdrop-blur border border-zinc-800 rounded-xl hover:border-purple-500/50 transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-zinc-300">Schneller Versand</span>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="flex flex-col items-center text-center p-5 glass backdrop-blur border border-zinc-800 rounded-xl hover:border-purple-500/50 transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-zinc-300">100% Authentisch</span>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="flex flex-col items-center text-center p-5 glass backdrop-blur border border-zinc-800 rounded-xl hover:border-purple-500/50 transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-3">
                <Star className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-zinc-300">Premium Qualität</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-20"
        >
          <div className="mb-8 relative">
            <div className="absolute -top-10 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent rounded-full blur-3xl -z-10" />
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
            >
              Das könnte dir auch gefallen
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-zinc-300 font-medium"
            >
              Ähnliche Produkte aus der gleichen Kategorie
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct, index) => (
              <motion.div
                key={relatedProduct.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Link
                  to={createPageUrl('ProductDetail') + `?id=${relatedProduct.id}`}
                  className="group block glass backdrop-blur border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/40 transition-all hover:scale-105"
                >
                  {relatedProduct.cover_image && (
                    <div className="aspect-square overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 relative">
                      <img
                        src={relatedProduct.cover_image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {relatedProduct.in_stock ? (
                        <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white text-xs font-black shadow-lg shadow-green-500/50">
                          ✓ Verfügbar
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 rounded-full text-white text-xs font-black shadow-lg shadow-red-500/50">
                          Ausverkauft
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-purple-400 font-black uppercase tracking-wider mb-1">{relatedProduct.sku}</div>
                        <h3 className="font-black text-base mb-2 line-clamp-2 text-white group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                          {relatedProduct.name}
                        </h3>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-zinc-700 group-hover:border-purple-500/40 transition-colors">
                      <span className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                        {relatedProduct.price}€
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}