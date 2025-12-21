import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ShoppingBag, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all hover:scale-[1.02]"
    >
      <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-zinc-800">
          {product.cover_image ? (
            <img
              src={product.cover_image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-zinc-700" />
            </div>
          )}
          
          {/* Stock Badge */}
          <div className="absolute top-3 right-3">
            {product.in_stock ? (
              <span className="px-3 py-1 bg-green-500/20 backdrop-blur border border-green-500/30 text-green-400 text-xs font-semibold rounded-full">
                Verfügbar
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-500/20 backdrop-blur border border-red-500/30 text-red-400 text-xs font-semibold rounded-full">
                Ausverkauft
              </span>
            )}
          </div>

          {/* SKU Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-purple-500/20 backdrop-blur border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-full">
              {product.sku}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{product.description}</p>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price and Action */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
            <div>
              <div className="text-2xl font-bold text-purple-400">{product.price}€</div>
              {product.currency && product.currency !== 'EUR' && (
                <div className="text-xs text-zinc-500">{product.currency}</div>
              )}
            </div>
            
            {product.in_stock && onAddToCart && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(product);
                }}
                className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:scale-110 transition-transform"
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}