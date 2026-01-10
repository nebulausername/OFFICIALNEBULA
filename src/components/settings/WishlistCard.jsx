import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import GlassCard from './GlassCard';
import { useWishlist } from '../wishlist/WishlistContext';

export default function WishlistCard() {
  const { wishlistCount } = useWishlist();

  return (
    <Link to={createPageUrl('Wishlist')}>
      <GlassCard hover className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/30"
            >
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </motion.div>
            <div>
              <h3 className="text-white font-black text-base mb-1">Merkliste</h3>
              <p className="text-zinc-400 text-sm font-medium">
                {wishlistCount} {wishlistCount === 1 ? 'Artikel' : 'Artikel'}
              </p>
            </div>
          </div>
          <motion.div
            whileHover={{ x: 4 }}
            className="w-9 h-9 bg-white/[0.05] rounded-xl flex items-center justify-center"
          >
            <ArrowRight className="w-5 h-5 text-zinc-400" />
          </motion.div>
        </div>
      </GlassCard>
    </Link>
  );
}