import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Clock, ShoppingBag, Plus } from 'lucide-react';

// Countdown Timer Component
const CountdownTimer = () => {
    const [time, setTime] = useState({ hours: 2, minutes: 14, seconds: 33 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(prev => {
                let { hours, minutes, seconds } = prev;
                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                } else {
                    // Reset countdown
                    return { hours: 2, minutes: 14, seconds: 33 };
                }
                return { hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const pad = (n) => n.toString().padStart(2, '0');

    return (
        <div className="flex items-center gap-1 text-sm font-mono">
            <Clock className="w-3.5 h-3.5 text-gold mr-1" />
            <div className="flex items-center gap-1">
                <span className="bg-black/50 px-1.5 py-0.5 rounded text-white">{pad(time.hours)}</span>
                <span className="text-gold">:</span>
                <span className="bg-black/50 px-1.5 py-0.5 rounded text-white">{pad(time.minutes)}</span>
                <span className="text-gold">:</span>
                <span className="bg-black/50 px-1.5 py-0.5 rounded text-white">{pad(time.seconds)}</span>
            </div>
        </div>
    );
};

const MiniProductCard = ({ product, index, onQuickAdd }) => {
    if (!product) return null;
    const imageSrc = product.cover_image || (product.images && product.images[0]) || '/placeholder.png';
    const stockLow = product.stock_count && product.stock_count < 10;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className="group relative flex items-center gap-4 bg-[#0E1015] border border-white/10 hover:border-gold/30 p-3 rounded-2xl transition-all duration-300 hover:bg-white/5"
        >
            {/* Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-[#050608] rounded-xl overflow-hidden">
                <img
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                />
                {/* Quick Add Button */}
                <button
                    onClick={(e) => { e.preventDefault(); onQuickAdd?.(product); }}
                    className="absolute bottom-1 right-1 w-6 h-6 bg-gold text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {index === 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Flame className="w-3 h-3" /> Hot
                        </span>
                    )}
                    {product.badges?.includes('Drop') && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                            Drop
                        </span>
                    )}
                    {product.badges?.includes('Neu') && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-1.5 py-0.5 rounded">
                            Neu
                        </span>
                    )}
                    {product.badges?.includes('Limitiert') && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            Limitiert
                        </span>
                    )}
                </div>
                <h4 className="text-white font-bold truncate pr-2 group-hover:text-gold transition-colors">{product.name}</h4>
                <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-col">
                        <span className="text-gold font-bold">{product.price}€</span>
                        {stockLow && (
                            <span className="text-[10px] text-red-400 font-medium">{product.stock_status}</span>
                        )}
                    </div>
                    <button
                        onClick={(e) => { e.preventDefault(); onQuickAdd?.(product); }}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold group-hover:text-black transition-all"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default function FeaturedDropList({ products = [], onQuickAdd }) {
    // Always show products - use first 3
    const displayProducts = products.slice(0, 3);

    // Mock stats for "live" feel
    const watchingCount = 12400 + Math.floor(Math.random() * 500);
    const soldToday = 324 + Math.floor(Math.random() * 50);

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header with Countdown */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter">
                        FRESH <span className="text-gold">DROPS</span>
                    </h3>
                    <Link to="/products?sort=newest" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                        View All
                    </Link>
                </div>
                {/* Countdown Row */}
                <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Nächster Drop in
                    </span>
                    <CountdownTimer />
                </div>
            </div>

            {/* Product Cards */}
            <div className="flex flex-col gap-3 flex-grow">
                {displayProducts.length > 0 ? (
                    displayProducts.map((p, i) => (
                        <MiniProductCard key={p.id || i} product={p} index={i} onQuickAdd={onQuickAdd} />
                    ))
                ) : (
                    // Skeleton fallback - but this shouldn't happen
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
                    ))
                )}
            </div>

            {/* Enhanced Social Proof */}
            <div className="mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Avatar Stack */}
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div
                                    key={i}
                                    className="w-7 h-7 rounded-full border-2 border-[#0E1015] bg-cover bg-center"
                                    style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 20})` }}
                                />
                            ))}
                            <div className="w-7 h-7 rounded-full border-2 border-[#0E1015] bg-gold/20 flex items-center justify-center">
                                <span className="text-[10px] text-gold font-bold">+99</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white text-xs font-bold">{(watchingCount / 1000).toFixed(1)}k</span>
                            <span className="text-zinc-500 text-[10px]">schauen gerade</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                        <ShoppingBag className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-zinc-400">
                            <span className="text-white font-bold">{soldToday}</span> heute verkauft
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
