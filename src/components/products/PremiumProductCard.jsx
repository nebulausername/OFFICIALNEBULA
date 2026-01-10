import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Heart, Eye, MapPin, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PremiumProductCard({ product, onAddToCart, onQuickView, onRequestProduct }) {
  const [isFavorite, setIsFavorite] = React.useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.in_stock) {
      onRequestProduct(product);
    } else {
      onAddToCart(product, 1, {});
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView(product);
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Get default shipping option (Germany)
  const defaultShipping = product.shipping_options?.find(opt => opt.location === 'Germany') || 
                         product.shipping_options?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      <Link
        to={createPageUrl('ProductDetail') + `?id=${product.id}`}
        className="block glass backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800">
          {product.cover_image ? (
            <>
              <img
                src={product.cover_image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Gradient Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-zinc-700" />
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            {/* Limited/New Badge */}
            {product.tags?.includes('Limited') && (
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-black text-xs px-3 py-1.5 shadow-lg shadow-red-500/50 border-0">
                  🔥 LIMITED
                </Badge>
              </motion.div>
            )}
            {product.tags?.includes('New') && !product.tags?.includes('Limited') && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xs px-3 py-1.5 shadow-lg border-0">
                ✨ NEU
              </Badge>
            )}
            
            {/* Availability Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="ml-auto"
            >
              {product.in_stock ? (
                <Badge className="bg-green-500/90 backdrop-blur-sm text-white font-bold text-xs px-3 py-1.5 shadow-lg border-0">
                  ✓ Verfügbar
                </Badge>
              ) : (
                <Badge className="bg-red-500/90 backdrop-blur-sm text-white font-bold text-xs px-3 py-1.5 shadow-lg border-0">
                  Nicht verfügbar
                </Badge>
              )}
            </motion.div>
          </div>

          {/* Favorite Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavorite}
            className="absolute bottom-3 right-3 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 border border-white/10"
          >
            <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </motion.button>

          {/* Quick View Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleQuickView}
            className="absolute inset-x-4 bottom-4 py-3 bg-white/95 backdrop-blur-sm rounded-xl font-bold text-zinc-900 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-xl"
          >
            <Eye className="w-4 h-4" />
            Quick View
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Product ID Chip */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs font-mono font-bold border-zinc-700 text-zinc-400 px-2 py-0.5">
              {product.sku}
            </Badge>
            {product.tags && product.tags.slice(0, 2).map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs bg-zinc-800/50 text-zinc-400 px-2 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-lg leading-tight text-zinc-100 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Shipping Info Bar */}
          {defaultShipping && (
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
              <MapPin className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-zinc-300">
                {defaultShipping.location === 'Germany' ? '🇩🇪' : '🇨🇳'} {defaultShipping.location}
              </span>
              <span className="text-xs text-zinc-600">•</span>
              <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-zinc-300">
                {defaultShipping.days_min}-{defaultShipping.days_max} Tage
              </span>
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-800/50">
            <div>
              <div className="text-2xl font-black text-white">
                {product.price.toFixed(2)}€
              </div>
              {product.currency && product.currency !== 'EUR' && (
                <div className="text-xs text-zinc-500">{product.currency}</div>
              )}
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleAddToCart}
                size="sm"
                className={`font-bold shadow-lg ${
                  product.in_stock
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-purple-500/50'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-orange-500/50'
                }`}
              >
                {product.in_stock ? (
                  <>
                    <ShoppingBag className="w-4 h-4 mr-1.5" />
                    In den Warenkorb
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-1.5" />
                    Anfragen
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}