import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, Star } from 'lucide-react';
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
            className="group relative flex flex-col h-full glass-card rounded-2xl p-0 hover:-translate-y-1 transition-all duration-300"
        >
            {/* --- IMAGE AREA --- */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl bg-[#050608]">
                <div
                    onClick={(e) => { e.preventDefault(); onQuickView && onQuickView(product); }}
                    className="block w-full h-full cursor-pointer"
                >
                    {/* Primary Image */}
                    <motion.img
                        src={imageSrc}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                        alt={product.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'lg:opacity-0' : 'opacity-100'}`}
                    />
                    {/* Secondary Image (Hover - Desktop Only) */}
                    <motion.img
                        src={secondImageSrc}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                        alt={product.name}
                        className={`hidden lg:block absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                        style={{ filter: 'contrast(1.1)' }}
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1015] via-transparent to-transparent opacity-20" />
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {isNew && (
                        <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400 uppercase tracking-wider backdrop-blur-sm shadow-sm">
                            New
                        </div>
                    )}
                    {isSale && (
                        <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/30 text-[10px] font-bold text-red-400 uppercase tracking-wider backdrop-blur-sm shadow-sm">
                            -{discount}%
                        </div>
                    )}
                </div>

                {/* Quick Actions (Floating Right) - Visible on Mobile, Hover on Desktop */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 lg:translate-x-10 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={(e) => { e.preventDefault(); /* Add to wishlist logic */ }}
                        className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-gold hover:text-black hover:border-gold transition-colors shadow-lg"
                    >
                        <Heart className="w-4 h-4" />
                    </button>
                    {/* Size Badge for Mobile/Desktop */}
                    {hasSizes && (
                        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-[10px] font-bold text-zinc-300">
                            {product.sizes.length}S
                        </div>
                    )}
                </div>

                {/* Quick Add Button - Bottom of Image */}
                {/* Desktop: Slide up. Mobile: Always visible small button or integrated */}
                <div className="absolute bottom-3 right-3 lg:bottom-4 lg:left-4 lg:right-4 z-20">
                    {/* Mobile Icon Button */}
                    <button
                        onClick={(e) => { e.preventDefault(); onQuickView && onQuickView(product); }}
                        className="lg:hidden w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    >
                        <Eye className="w-5 h-5" />
                    </button>

                    {/* Desktop Full Button */}
                    <button
                        onClick={(e) => { e.preventDefault(); onQuickView && onQuickView(product); }}
                        className="hidden lg:block w-full py-3 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-gold transition-colors shadow-lg translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-300"
                    >
                        Quick Add
                    </button>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="p-4 lg:p-5 flex flex-col flex-grow">
                {/* Title */}
                <div
                    onClick={(e) => { e.preventDefault(); onQuickView && onQuickView(product); }}
                    className="group-hover:text-gold transition-colors duration-300 cursor-pointer"
                >
                    <h3 className="text-white font-medium text-sm lg:text-base leading-snug line-clamp-2 mb-2 min-h-[2.5rem]">
                        {product.name}
                    </h3>
                </div>

                {/* Rating & Brand */}
                <div className="flex items-center gap-2 mb-2 lg:mb-3">
                    <div className="flex items-center text-gold text-xs">
                        <Star className="w-3 h-3 fill-gold" />
                        <span className="ml-1 font-bold">4.8</span>
                    </div>
                </div>

                {/* Price Area */}
                <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-gold font-bold text-base lg:text-lg">{formatCurrency(product.price)}</span>
                            {isSale && (
                                <span className="text-zinc-500 text-xs line-through">{formatCurrency(product.compare_at_price)}</span>
                            )}
                        </div>
                    </div>

                    {/* Color Dots (Desktop Only to save space on mobile) */}
                    {product.colors && product.colors.length > 0 && (
                        <div className="hidden lg:flex -space-x-2">
                            {product.colors.slice(0, 3).map(c => (
                                <div key={c.id || c} className="w-4 h-4 rounded-full border border-white/10 ring-1 ring-[#0E1015]" style={{ background: c.hex || c }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
