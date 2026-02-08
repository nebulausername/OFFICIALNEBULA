import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Heart, Star } from 'lucide-react';
import { createPageUrl } from '../../utils';
import { useI18n } from '../i18n/I18nProvider';

export default function AntigravityProductCard({ product, onQuickView }) {
    const { formatCurrency } = useI18n();
    const [isHovered, setIsHovered] = useState(false);

    // Helper for safe image source
    const imageSrc = product.cover_image || (product.images && product.images[0]) || '/placeholder.png';

    const secondImageSrc = (product.images && product.images[1]) || imageSrc;
    const hasSizes = product.sizes && product.sizes.length > 0;
    const sizeLabel = hasSizes ? (product.sizes.length === 1 ? product.sizes[0] : `${product.sizes.length} Sizes`) : null;

    const isNew = new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    const isSale = product.compare_at_price > product.price;
    const discount = isSale ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative flex flex-col h-full bg-[#0E1015]/80 backdrop-blur-md rounded-2xl border border-white/5 hover:border-gold/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(214,178,94,0.1)]"
        >
            {/* --- IMAGE AREA --- */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl bg-[#050608]">
                <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`} className="block w-full h-full">
                    {/* Primary Image */}
                    <motion.img
                        src={imageSrc}
                        alt={product.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
                    />
                    {/* Secondary Image (Hover) */}
                    <motion.img
                        src={secondImageSrc}
                        alt={product.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                        style={{ filter: 'contrast(1.1)' }}
                    />

                    {/* Overlay Gradient (Always subtle for text readability if needed) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1015] via-transparent to-transparent opacity-20" />
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {isNew && (
                        <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400 uppercase tracking-wider backdrop-blur-sm">
                            New
                        </div>
                    )}
                    {isSale && (
                        <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/30 text-[10px] font-bold text-red-400 uppercase tracking-wider backdrop-blur-sm">
                            -{discount}%
                        </div>
                    )}
                    {hasSizes && (
                        <div className="px-2 py-1 rounded bg-zinc-800/80 border border-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-wider backdrop-blur-sm">
                            {sizeLabel}
                        </div>
                    )}
                </div>

                {/* Quick Actions (Floating Right) */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={(e) => { e.preventDefault(); /* Add to wishlist logic */ }}
                        className="w-10 h-10 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-gold hover:text-black hover:border-gold transition-colors"
                    >
                        <Heart className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); onQuickView && onQuickView(product); }}
                        className="w-10 h-10 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-gold hover:text-black hover:border-gold transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>

                {/* Desktop Quick Add Button (Bottom of Image) */}
                <div className="absolute bottom-4 left-4 right-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    <button
                        onClick={(e) => { e.preventDefault(); onQuickView && onQuickView(product); }}
                        className="w-full py-3 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-gold transition-colors shadow-lg"
                    >
                        Quick Add
                    </button>
                </div>

                {/* SKU Badge */}
                {product.sku && (
                    <div className="absolute bottom-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="font-mono text-[9px] bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-zinc-300 border border-white/10">
                            {product.sku}
                        </span>
                    </div>
                )}
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Title */}
                <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`} className="group-hover:text-gold transition-colors duration-300">
                    <h3 className="text-white font-medium text-base leading-snug line-clamp-2 mb-2 min-h-[2.5rem]">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating & Brand (Optional) */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center text-gold text-xs">
                        <Star className="w-3 h-3 fill-gold" />
                        <span className="ml-1 font-bold">4.8</span>
                        <span className="text-zinc-500 ml-1">(24)</span>
                    </div>
                </div>

                {/* Price Area */}
                <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-gold font-bold text-lg">{formatCurrency(product.price)}</span>
                            {isSale && (
                                <span className="text-zinc-500 text-xs line-through">{formatCurrency(product.compare_at_price)}</span>
                            )}
                        </div>
                    </div>

                    {/* Color Dots */}
                    {product.colors && product.colors.length > 0 && (
                        <div className="flex -space-x-2">
                            {product.colors.slice(0, 3).map(c => (
                                <div key={c.id || c} className="w-4 h-4 rounded-full border border-white/10 ring-1 ring-[#0E1015]" style={{ background: c.hex || c }} />
                            ))}
                            {product.colors.length > 3 && (
                                <div className="w-4 h-4 rounded-full bg-zinc-800 border border-white/10 ring-1 ring-[#0E1015] flex items-center justify-center text-[8px] text-zinc-400">
                                    +{product.colors.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
