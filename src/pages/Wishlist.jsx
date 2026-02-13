import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { api } from '@/api';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../components/wishlist/WishlistContext';
import {
  Heart, ShoppingBag, Sparkles, ArrowLeft, Truck, Clock,
  Package, Trash2, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { insforge } from '@/lib/insforge';
import WishlistButton from '../components/wishlist/WishlistButton';

export default function Wishlist() {
  const { wishlistIds, loading: wishlistLoading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    if (!wishlistLoading) {
      loadProducts();
    }
  }, [wishlistIds, wishlistLoading]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      if (wishlistIds.length === 0) {
        setProducts([]);
        return;
      }

      // Fetch only the products in the wishlist directly from DB
      const { data, error } = await insforge.database
        .from('products')
        .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
        .in('id', wishlistIds);

      if (error) throw error;
      setProducts(data || []);

    } catch (error) {
      console.error('Error loading wishlist products:', error);
      toast.error("Fehler beim Laden der Merkliste");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    setAddingToCart(product.id);
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      // Toast handled in addToCart
    } finally {
      setAddingToCart(null);
    }
  };

  const handleRemoveAll = async () => {
    if (!confirm('Alle Produkte von der Merkliste entfernen?')) return;

    for (const productId of wishlistIds) {
      await toggleWishlist(productId);
    }
    toast.success('Merkliste geleert');
  };

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc': return (a.price || 0) - (b.price || 0);
      case 'price_desc': return (b.price || 0) - (a.price || 0);
      case 'available': return (b.in_stock ? 1 : 0) - (a.in_stock ? 1 : 0);
      default: return 0; // newest - keep original order
    }
  });

  if (wishlistLoading || loading) {
    return (
      <div className="min-h-screen" style={{ background: '#0B0D12' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-10 w-48 rounded animate-pulse mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="h-6 w-64 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-5 w-3/4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-7 w-1/2 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0B0D12' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={createPageUrl('Profile')}
            className="inline-flex items-center gap-2 mb-4 transition-colors text-sm font-medium"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Profil
          </Link>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #EC4899)',
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
                }}
              >
                <Heart className="w-7 h-7 text-white" fill="white" />
              </div>
              <div>
                <h1
                  className="text-3xl md:text-4xl font-black"
                  style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                >
                  Meine Merkliste
                </h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Deine gespeicherten Produkte
                </p>
              </div>
            </div>
          </motion.div>

          {/* Controls Row */}
          {products.length > 0 && (
            <div
              className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-lg font-bold"
                  style={{ color: '#F2D27C' }}
                >
                  {products.length}
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {products.length === 1 ? 'Produkt' : 'Produkte'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-10 pl-4 pr-10 rounded-lg text-sm font-semibold appearance-none cursor-pointer"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF'
                    }}
                  >
                    <option value="newest" style={{ background: '#12151C' }}>Neueste</option>
                    <option value="price_asc" style={{ background: '#12151C' }}>Preis ↑</option>
                    <option value="price_desc" style={{ background: '#12151C' }}>Preis ↓</option>
                    <option value="available" style={{ background: '#12151C' }}>Verfügbar</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  />
                </div>

                {/* Remove All Button */}
                <Button
                  onClick={handleRemoveAll}
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 rounded-lg"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#FCA5A5'
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Alle entfernen
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        <AnimatePresence>
          {products.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-20"
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(255, 255, 255, 0.06)' }}
              >
                <Heart className="w-12 h-12" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
              </div>
              <h2
                className="text-2xl font-bold mb-3"
                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
              >
                Noch keine Favoriten
              </h2>
              <p
                className="mb-8 max-w-md mx-auto"
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              >
                Klicke auf das Herz-Symbol bei Produkten, um sie hier zu speichern
              </p>
              <Link to={createPageUrl('Products')}>
                <Button
                  className="h-12 px-8 rounded-xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #D6B25E, #F2D27C)',
                    color: '#0B0D12'
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Produkte entdecken
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        {sortedProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    className="rounded-[20px] overflow-hidden transition-all duration-300 hover:shadow-lg group"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    {/* Image */}
                    <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
                      <div className="relative aspect-square overflow-hidden">
                        {product.cover_image ? (
                          <img
                            src={product.cover_image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                          >
                            <Package className="w-16 h-16" style={{ color: 'rgba(255,255,255,0.2)' }} />
                          </div>
                        )}

                        {/* Gradient Overlay */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.5) 100%)' }}
                        />

                        {/* Wishlist Button - Top Left */}
                        <div className="absolute top-3 left-3 z-10">
                          <WishlistButton productId={product.id} size="md" variant="ghost" />
                        </div>

                        {/* Availability - Top Right */}
                        <div
                          className="absolute top-3 right-3 px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10"
                          style={{
                            background: product.in_stock !== false ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            backdropFilter: 'blur(8px)',
                            border: `1px solid ${product.in_stock !== false ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: product.in_stock !== false ? '#22C55E' : '#EF4444' }}
                          />
                          <span
                            className="text-xs font-bold"
                            style={{ color: product.in_stock !== false ? '#86EFAC' : '#FCA5A5' }}
                          >
                            {product.in_stock !== false ? 'Verfügbar' : 'Ausverkauft'}
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Product Name */}
                      <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
                        <h3
                          className="font-bold text-base line-clamp-2 leading-tight hover:text-gold transition-colors"
                          style={{ color: 'rgba(255, 255, 255, 0.92)' }}
                        >
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price + SKU */}
                      <div className="flex items-end justify-between">
                        <div
                          className="text-2xl font-black"
                          style={{ color: '#F2D27C' }}
                        >
                          {(product.price || 0).toFixed(2)}€
                        </div>
                        {product.sku && (
                          <span
                            className="text-xs font-medium"
                            style={{ color: 'rgba(255, 255, 255, 0.45)' }}
                          >
                            {product.sku}
                          </span>
                        )}
                      </div>

                      {/* Shipping Info */}
                      <div
                        className="flex items-center gap-4 pt-2"
                        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
                      >
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                          <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>China</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                          <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>8–17 Tage</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`} className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full h-10 rounded-lg font-semibold text-sm"
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              color: 'rgba(255, 255, 255, 0.85)'
                            }}
                          >
                            Zum Produkt
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.in_stock || addingToCart === product.id}
                          className="h-10 px-4 rounded-lg font-semibold text-sm"
                          style={{
                            background: 'linear-gradient(135deg, #D6B25E, #F2D27C)',
                            color: '#0B0D12'
                          }}
                        >
                          {addingToCart === product.id ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          ) : (
                            <ShoppingBag className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}