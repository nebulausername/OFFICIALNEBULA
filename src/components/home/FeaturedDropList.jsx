import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Clock, ShoppingBag, Plus, Sparkles } from 'lucide-react';

// Countdown Timer Component
const CountdownTimer = () => {
    const [time, setTime] = useState({ hours: 2, minutes: 14, seconds: 33 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(prev => {
                let { hours, minutes, seconds } = prev;
                if (seconds > 0) seconds--;
                else if (minutes > 0) { minutes--; seconds = 59; }
                else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
                else return { hours: 2, minutes: 14, seconds: 33 };
                return { hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const pad = (n) => n.toString().padStart(2, '0');

    return (
        <div className="flex items-center gap-1.5 text-sm font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-gold/10 shadow-[0_0_10px_rgba(214,178,94,0.1)]">
            <Clock className="w-3.5 h-3.5 text-gold animate-pulse" />
            <div className="flex items-center gap-1 text-gold">
                <span className="font-bold">{pad(time.hours)}</span>
                <span className="opacity-50">:</span>
                <span className="font-bold">{pad(time.minutes)}</span>
                <span className="opacity-50">:</span>
                <span className="font-bold">{pad(time.seconds)}</span>
            </div>
        </div>
    );
};

const MiniProductCard = ({ product, index, onQuickAdd }) => {
    if (!product) return null;
    const imageSrc = product.cover_image || (product.images && product.images[0]) || '/placeholder.png';
    const isHot = index === 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className="group relative flex items-center gap-4 bg-[#09090b]/80 border border-white/5 p-3 rounded-2xl cursor-pointer hover:border-gold/30 hover:bg-[#0F1115] transition-all duration-300 overflow-hidden"
            onClick={(e) => { e.preventDefault(); onQuickAdd?.(product); }}
            style={{ backdropFilter: 'blur(10px)' }}
        >
            {/* Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-[#050608] rounded-xl overflow-hidden border border-white/5 group-hover:border-gold/20 transition-colors">
                <img
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                />
                {/* Hot Badge */}
                {isHot && (
                    <div className="absolute top-0 left-0 bg-red-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-br-lg shadow-[0_0_10px_rgba(239,68,68,0.5)] z-10 animate-pulse-slow">
                        Hot
                    </div>
                )}
                {/* Quick Add Button */}
                <button
                    className="absolute bottom-1 right-1 w-7 h-7 bg-gold text-black rounded-full flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110 z-20"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    {product.badges?.includes('Drop') && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded bg-purple-500/10 shadow-[0_0_5px_rgba(168,85,247,0.2)]">
                            Drop
                        </span>
                    )}
                    {isHot && <Sparkles className="w-3 h-3 text-gold animate-pulse" />}
                </div>

                <h4 className="text-white font-bold truncate pr-2 group-hover:text-gold transition-colors text-sm sm:text-base leading-tight">
                    {product.name}
                </h4>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col">
                        <span className="text-gold font-black text-lg drop-shadow-[0_0_10px_rgba(214,178,94,0.3)]">
                            {product.price}€
                        </span>
                    </div>
                    <div
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold group-hover:text-black transition-all border border-white/10 group-hover:border-gold shadow-[0_0_0_0_rgba(214,178,94,0)] group-hover:shadow-[0_0_15px_rgba(214,178,94,0.4)]"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function FeaturedDropList({ products = [], onQuickAdd }) {
    // Always show products - use first 3
    const displayProducts = products.slice(0, 3);

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gold uppercase tracking-[0.2em] mb-1">Live Feed</span>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none">
                            FRESH <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200">DROPS</span>
                        </h3>
                    </div>
                    <Link to="/products?sort=newest" className="group flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                        View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Countdown Row */}
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-2 border border-white/5 backdrop-blur-md">
                    <span className="flex items-center gap-2 pl-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">Next Drop</span>
                    </span>
                    <CountdownTimer />
                </div>
            </div>

            {/* Product Cards */}
            <div className="flex flex-col gap-3 flex-grow overflow-y-auto pr-1 scrollbar-hide relative z-10">
                {displayProducts.length > 0 ? (
                    displayProducts.map((p, i) => (
                        <MiniProductCard key={p.id || i} product={p} index={i} onQuickAdd={onQuickAdd} />
                    ))
                ) : (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                    ))
                )}
            </div>

            {/* Footer Stats - "Social Proof" */}
            <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[11, 12, 13, 14].map(i => (
                                <div
                                    key={i}
                                    className="w-7 h-7 rounded-full border-2 border-[#0E1015] bg-zinc-800 bg-cover bg-center"
                                    style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 30})` }}
                                />
                            ))}
                            <div className="w-7 h-7 rounded-full border-2 border-[#0E1015] bg-gold flex items-center justify-center">
                                <span className="text-[9px] text-black font-black">+12k</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white text-xs font-bold tracking-tight">Watching Now</span>
                            <span className="text-green-500 text-[10px] font-mono animate-pulse">● Live Activity</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
