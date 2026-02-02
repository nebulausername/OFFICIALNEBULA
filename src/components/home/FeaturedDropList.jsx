import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Star } from 'lucide-react';
import { createPageUrl } from '../../utils';

const MiniProductCard = ({ product, index }) => {
    if (!product) return null;
    const imageSrc = product.cover_image || (product.images && product.images[0]) || '/placeholder.png';

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className="group relative flex items-center gap-4 bg-[#0E1015] border border-white/10 hover:border-gold/30 p-3 rounded-2xl transition-all duration-300 hover:bg-white/5"
        >
            {/* Image */}
            <div className="relative w-20 h-20 shrink-0 bg-[#050608] rounded-xl overflow-hidden">
                <img
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                />
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    {index === 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Flame className="w-3 h-3" /> Hot
                        </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-1.5 py-0.5 rounded">
                        New
                    </span>
                </div>
                <h4 className="text-white font-bold truncate pr-2 group-hover:text-gold transition-colors">{product.name}</h4>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-zinc-400 text-sm font-medium">{product.price}€</span>
                    <Link to={`${createPageUrl('ProductDetail')}?id=${product.id}`}>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold group-hover:text-black transition-all">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default function FeaturedDropList({ products = [] }) {
    // If no products, showing a skeleton-like state or generic promo
    const displayProducts = products.slice(0, 3);

    return (
        <div className="w-full h-full flex flex-col justify-center">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-black text-white italic tracking-tighter">
                    FRESH <span className="text-gold">DROPS</span>
                </h3>
                <Link to="/products?sort=newest" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                    View All
                </Link>
            </div>

            <div className="flex flex-col gap-4">
                {displayProducts.length > 0 ? (
                    displayProducts.map((p, i) => (
                        <MiniProductCard key={p.id || i} product={p} index={i} />
                    ))
                ) : (
                    // Empty State / Loading
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
                    ))
                )}
            </div>

            {/* Mini Trust/Social Proof */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4">
                <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050608] bg-zinc-800" />
                    ))}
                </div>
                <div className="text-xs text-zinc-400">
                    <span className="text-white font-bold">1.2k+</span> Watching now
                </div>
            </div>
        </div>
    );
}
