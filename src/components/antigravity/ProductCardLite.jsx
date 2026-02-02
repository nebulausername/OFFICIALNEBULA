import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, Sparkles } from 'lucide-react';
import { createPageUrl } from '../../utils';
import { Button } from '@/components/ui/button';

export default function ProductCardLite({ product, onQuickView }) {
    const [isHovered, setIsHovered] = useState(false);

    if (!product) return null;

    // Safe Data
    const imageSrc = product.cover_image || (product.images && product.images[0]) || '/placeholder.png';
    const secondImageSrc = (product.images && product.images[1]) || imageSrc;
    const isNew = new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const isSale = product.compare_at_price > product.price;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative flex flex-col h-full bg-[#0E1015] rounded-xl border border-white/5 hover:border-gold/30 transition-all duration-300"
        >
            {/* Image Area */}
            <div
                className="relative aspect-[4/5] overflow-hidden rounded-t-xl bg-[#050608] cursor-pointer"
                onClick={() => onQuickView && onQuickView(product)}
            >
                {/* Images */}
                <img
                    src={imageSrc}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
                />
                <img
                    src={secondImageSrc}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {isNew && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-wider backdrop-blur-md">
                            New
                        </span>
                    )}
                    {isSale && (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase tracking-wider backdrop-blur-md">
                            Sale
                        </span>
                    )}
                </div>

                {/* Quick View Button (Shows on Hover) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[1px]">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 text-black hover:bg-gold hover:text-black font-bold uppercase tracking-wider text-xs shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                    >
                        <Eye className="w-3 h-3 mr-2" />
                        Quick View
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                <h3
                    className="text-white text-sm font-bold leading-tight mb-2 line-clamp-2 group-hover:text-gold transition-colors cursor-pointer"
                    onClick={() => onQuickView && onQuickView(product)}
                >
                    {product.name}
                </h3>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{product.price}€</span>
                            {isSale && (
                                <span className="text-zinc-500 text-xs line-through">{product.compare_at_price}€</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
