import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Clock, ShoppingBag, Plus, Sparkles, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

// Countdown Timer Component — Premium Edition
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
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-mono bg-black/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-gold/20 shadow-[0_0_20px_rgba(214,178,94,0.1)] animate-glow-gold-pulse">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold" />
            <div className="flex items-center gap-1 sm:gap-1.5 text-gold">
                {[pad(time.hours), pad(time.minutes), pad(time.seconds)].map((digit, i) => (
                    <React.Fragment key={i}>
                        <span className="font-black text-sm sm:text-base bg-gold/10 px-1 sm:px-1.5 py-0.5 rounded" style={{ textShadow: '0 0 10px rgba(214,178,94,0.5)' }}>
                            {digit}
                        </span>
                        {i < 2 && <span className="opacity-40 text-xs">:</span>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const MiniProductCard = ({ product, index, onQuickAdd }) => {
    const [addingToCart, setAddingToCart] = useState(false);
    const [justAdded, setJustAdded] = useState(false);
    const { addToCart } = useCart();

    if (!product) return null;
    const imageSrc = product.cover_image || (product.images && product.images[0]) || '/placeholder.png';
    const isHot = index === 0;

    const handleDirectAdd = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (addingToCart || justAdded) return;
        setAddingToCart(true);
        try {
            await addToCart(product.id, 1, {});
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 2000);
        } catch (err) {
            console.error('Quick add failed:', err);
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex items-center gap-3 sm:gap-4 bg-[#09090b]/90 border border-white/5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl cursor-pointer hover:border-gold/40 hover:bg-[#0F1115] transition-all duration-500 overflow-hidden active:scale-[0.98]"
            onClick={(e) => { e.preventDefault(); onQuickAdd?.(product); }}
            style={{ backdropFilter: 'blur(12px)' }}
        >
            {/* Hover Sweep Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            {/* Bottom neon line */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-gold/80 to-gold/20 transition-all duration-700 ease-out" style={{ boxShadow: '0 0 8px rgba(214,178,94,0.4)' }} />

            {/* Hot Badge */}
            {isHot && (
                <div className="absolute -top-0.5 -right-0.5 z-10">
                    <span className="px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[8px] sm:text-[9px] font-black uppercase rounded-lg rounded-tr-xl shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                        <Flame className="w-2.5 h-2.5 inline mr-0.5" /> Hot
                    </span>
                </div>
            )}

            {/* Image */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900">
                <img
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 relative z-10">
                {product.brand && (
                    <span className="text-[8px] sm:text-[9px] text-gold/50 font-bold uppercase tracking-wider">
                        {typeof product.brand === 'object' ? product.brand.name : product.brand}
                    </span>
                )}
                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-gold/90 transition-colors">
                    {product.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                    <span className="text-sm sm:text-base font-black text-white">{product.price}€</span>
                    {product.sale_price > 0 && (
                        <span className="text-[10px] text-red-400 line-through">{product.sale_price}€</span>
                    )}
                </div>
            </div>

            {/* Quick Add — direct cart integration */}
            <button
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border flex items-center justify-center active:scale-90 transition-all duration-300 flex-shrink-0 ${justAdded
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-gold/10 border-gold/20 text-gold group-hover:bg-gold group-hover:text-black group-hover:border-gold'
                    }`}
                onClick={handleDirectAdd}
                disabled={addingToCart}
            >
                {justAdded ? (
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : addingToCart ? (
                    <div className="w-3.5 h-3.5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                ) : (
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
            </button>
        </motion.div>
    );
};

export default function FeaturedDropList({ products = [], onQuickAdd }) {
    const topProducts = products.slice(0, 3);

    return (
        <div className="flex flex-col h-full relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-lg sm:text-xl font-black uppercase tracking-wider animate-text-shimmer" style={{ backgroundImage: 'linear-gradient(90deg, #fff, #D6B25E, #fff)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', backgroundSize: '200% auto' }}>
                        🔥 DROPS
                    </span>
                    <CountdownTimer />
                </div>
            </div>

            {/* Products */}
            <div className="flex-1 flex flex-col gap-2.5 sm:gap-3">
                {topProducts.length > 0 ? (
                    topProducts.map((product, i) => (
                        <MiniProductCard key={product.id || i} product={product} index={i} onQuickAdd={onQuickAdd} />
                    ))
                ) : (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-16 sm:h-[72px] rounded-xl sm:rounded-2xl bg-white/5 animate-pulse" />
                    ))
                )}
            </div>

            {/* Social Proof */}
            <div className="mt-3 sm:mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="flex -space-x-1.5 sm:-space-x-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-gold/30 to-transparent border border-gold/20 flex items-center justify-center text-[7px] sm:text-[8px] text-gold font-bold">
                                {String.fromCharCode(65 + i)}
                            </div>
                        ))}
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-zinc-400">
                        <strong className="text-gold">234</strong> just bought
                    </span>
                </div>
                <Link to="/products?sort=newest" className="text-[10px] sm:text-xs text-gold font-bold flex items-center gap-1 hover:underline active:scale-95">
                    View All <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}
