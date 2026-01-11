import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Heart, Eye, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function PremiumProductCard({ product, onQuickView }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  useEffect(() => {
    checkWishlist();
    loadDeliveryInfo();
  }, [product.id]);

  const checkWishlist = async () => {
    try {
      const user = await base44.auth.me();
      const items = await base44.entities.WishlistItem.filter({
        user_id: user.id,
        product_id: product.id
      });
      setIsWishlisted(items.length > 0);
    } catch (error) {
      // User not logged in or error
    }
  };

  const loadDeliveryInfo = () => {
    const saved = localStorage.getItem('delivery_location');
    if (saved) {
      setDeliveryInfo(JSON.parse(saved));
    } else {
      setDeliveryInfo({ city: 'Berlin', eta_min: 1, eta_max: 3 });
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleQuickView = (e) => {
    e.preventDefault();
    onQuickView?.(product);
  };

  const getEtaText = () => {
    if (!deliveryInfo) return '';
    return `${deliveryInfo.eta_min}–${deliveryInfo.eta_max} Werktage`;
  };

  return (
    <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        className="premium-card group smooth-transition relative"
      >
        {/* Image Container */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-[var(--radius-lg)] bg-[hsl(var(--panel))]">
          {product.cover_image ? (
            <motion.img
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.4 }}
              src={product.cover_image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[hsl(var(--border))] opacity-40" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 smooth-transition" />
          
          {/* Availability Badge */}
          <div className="absolute top-3 right-3">
            {product.in_stock ? (
              <div className="badge-available backdrop-blur-sm">
                ✓ Verfügbar
              </div>
            ) : (
              <div className="badge-unavailable backdrop-blur-sm">
                Ausverkauft
              </div>
            )}
          </div>
          
          {/* Wishlist Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleWishlist}
            disabled={isPending}
            className="absolute top-3 left-3 w-10 h-10 glass-panel rounded-full flex items-center justify-center focus-ring smooth-transition hover:bg-[var(--glass-hover)]"
            aria-label={isWishlisted ? 'Von Merkliste entfernen' : 'Zu Merkliste hinzufügen'}
          >
            <Heart
              className={`w-5 h-5 smooth-transition ${
                isWishlisted ? 'fill-[hsl(var(--error))] text-[hsl(var(--error))]' : 'text-white'
              }`}
            />
          </motion.button>
          
          {/* Quick View Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            onClick={handleQuickView}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 smooth-transition btn-primary text-sm py-2 px-6 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Quick View
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Product Name */}
          <h3 className="font-bold text-base text-[hsl(var(--text))] line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>
          
          {/* Price & SKU Row */}
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-2xl font-black text-gradient-primary">
              {product.price}€
            </div>
            <div className="text-xs font-mono text-[hsl(var(--text-subtle))] bg-[hsl(var(--panel))] px-2 py-1 rounded">
              {product.sku}
            </div>
          </div>
          
          {/* Delivery Info */}
          {deliveryInfo && (
            <div className="space-y-1.5 pt-2 border-t border-[hsl(var(--border))]">
              <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-muted))]">
                <MapPin className="w-3.5 h-3.5 text-[hsl(var(--accent))] flex-shrink-0" />
                <span className="font-medium">Lieferung nach {deliveryInfo.city}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-muted))]">
                <Clock className="w-3.5 h-3.5 text-[hsl(var(--accent2))] flex-shrink-0" />
                <span className="font-medium">{getEtaText()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-[var(--radius-lg)] opacity-0 group-hover:opacity-100 smooth-transition pointer-events-none glow-accent" />
      </motion.div>
    </Link>
  );
}