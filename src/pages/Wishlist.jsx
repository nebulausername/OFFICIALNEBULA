import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useWishlist } from '../components/wishlist/WishlistContext';
import { Heart, ShoppingBag, Sparkles, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import WishlistButton from '../components/wishlist/WishlistButton';

export default function Wishlist() {
  const { wishlistIds, loading: wishlistLoading } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

      const allProducts = await base44.entities.Product.list();
      const wishlistProducts = allProducts.filter(p => wishlistIds.includes(p.id));
      setProducts(wishlistProducts);
    } catch (error) {
      console.error('Error loading wishlist products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const user = await base44.auth.me();
      const existing = await base44.entities.StarCartItem.filter({
        user_id: user.id,
        product_id: product.id
      });

      if (existing.length > 0) {
        await base44.entities.StarCartItem.update(existing[0].id, {
          quantity: existing[0].quantity + 1
        });
      } else {
        await base44.entities.StarCartItem.create({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
          selected_options: {}
        });
      }
      
      window.location.reload();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (wishlistLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="skeleton h-10 w-48 rounded mb-2" />
          <div className="skeleton h-6 w-64 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="skeleton aspect-[3/4] rounded-2xl" />
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-7 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to={createPageUrl('Profile')} 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Profil
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <h1 className="text-4xl font-black text-white">Meine Merkliste</h1>
          </div>
          <p className="text-zinc-300 text-lg">
            {products.length} {products.length === 1 ? 'Produkt' : 'Produkte'} gespeichert
          </p>
        </motion.div>
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-zinc-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Noch keine Favoriten</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Klicke auf das Herz-Symbol bei Produkten, um sie hier zu speichern
          </p>
          <Link to={createPageUrl('Products')}>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-xl hover:shadow-purple-500/30">
              <Sparkles className="w-5 h-5 mr-2" />
              Produkte entdecken
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Products Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="relative group">
                <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`} className="block">
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="glass backdrop-blur-xl rounded-2xl overflow-hidden border-2 border-zinc-800/50 shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 hover:border-purple-500/60 transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800">
                      {product.cover_image ? (
                        <img
                          src={product.cover_image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-16 h-16 text-zinc-600" />
                        </div>
                      )}
                      
                      {/* Wishlist Button */}
                      <div className="absolute top-3 right-3 z-10">
                        <WishlistButton productId={product.id} variant="ghost" />
                      </div>

                      {/* Availability Badge */}
                      {product.in_stock ? (
                        <div className="absolute top-3 left-3 px-3 py-1.5 bg-green-500/90 backdrop-blur-sm text-white text-xs font-black rounded-full shadow-lg">
                          ✓ Verfügbar
                        </div>
                      ) : (
                        <div className="absolute top-3 left-3 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-black rounded-full shadow-lg">
                          Ausverkauft
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-base text-white line-clamp-2 leading-snug group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-black text-white">
                          {product.price}€
                        </div>
                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          {product.sku}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {/* Add to Cart Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="mt-3"
                >
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.in_stock}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    In den Warenkorb
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}