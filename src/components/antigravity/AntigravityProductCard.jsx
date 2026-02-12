import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Star, Flame, Check } from 'lucide-react';
import { createPageUrl } from '../../utils';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/components/wishlist/WishlistContext';

export default function AntigravityProductCard({ product, onQuickView }) {
    const [isHovered, setIsHovered] = useState(false);
    const [imgFailed, setImgFailed] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    if (!product) return null;

    const wishlisted = isInWishlist(product.id);
    const images = product.images || [];
    const mainImage = product.cover_image || images[0] || '/placeholder.png';
    const hoverImage = images.length > 1 ? images[1] : mainImage;
    const isNew = product.badges?.includes('New') || false;
    const isOnSale = product.sale_price > 0;
    const rating = product.rating || (4 + Math.random()).toFixed(1);

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isAdding || justAdded) return;
        setIsAdding(true);
        try {
            await addToCart(product.id, 1, {});
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 2000);
        } catch (err) {
            console.error('Quick add failed:', err);
        } finally {
            setIsAdding(false);
        }
    };

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product.id);
    };

    return (
        <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex flex-col h-full"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`} className="flex flex-col h-full">
                {/* Image Container */}
                <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-[#0a0a0c] border border-white/[0.06] group-hover:border-gold/40 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(214,178,94,0.15)]">
                    {/* Main Image */}
                    <img
                        src={isHovered ? hoverImage : mainImage}
                        alt={product.name}
                        onError={(e) => { setImgFailed(true); e.target.src = '/placeholder.png'; }}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Badges */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1.5 sm:gap-2 z-10">
                        {isNew && (
                            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-gradient-to-r from-gold to-yellow-300 text-black text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(214,178,94,0.5)]">
                                <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-0.5 mb-0.5" /> New
                            </span>
                        )}
                        {isOnSale && (
                            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-red-600 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                                -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                            </span>
                        )}
                    </div>

                    {/* Quick Actions — Always visible on mobile, hover on desktop */}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1.5 sm:gap-2 z-10 opacity-100 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-300">
                        <button
                            onClick={handleToggleWishlist}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl backdrop-blur-md border flex items-center justify-center transition-all duration-300 active:scale-90 ${wishlisted
                                    ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                                    : 'bg-black/60 border-white/10 text-white hover:bg-gold/20 hover:border-gold/50 hover:text-gold hover:shadow-[0_0_10px_rgba(214,178,94,0.3)]'
                                }`}
                        >
                            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${wishlisted ? 'fill-red-400' : ''}`} />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-gold/20 hover:border-gold/50 hover:text-gold transition-all duration-300 hover:shadow-[0_0_10px_rgba(214,178,94,0.3)] active:scale-90"
                        >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                    </div>

                    {/* Quick Add Button — slides up from bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out z-10">
                        <button
                            onClick={handleQuickAdd}
                            disabled={isAdding}
                            className={`w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 active:scale-95 ${justAdded
                                    ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                    : 'bg-gradient-to-r from-[#F2D27C] to-[#D6B25E] text-black hover:from-white hover:to-white shadow-[0_0_20px_rgba(214,178,94,0.4)]'
                                }`}
                        >
                            {justAdded ? (
                                <><Check className="w-3 h-3 sm:w-4 sm:h-4" /> Added!</>
                            ) : isAdding ? (
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <><ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" /> Quick Add</>
                            )}
                        </button>
                    </div>

                    {/* Bottom Gold Neon Line */}
                    <div className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-gold via-yellow-200 to-gold transition-all duration-600 ${isHovered ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
                        style={{ boxShadow: '0 0 10px #D6B25E, 0 0 20px rgba(214,178,94,0.3)' }}
                    />
                </div>

                {/* Product Info */}
                <div className="pt-2.5 sm:pt-4 pb-1 sm:pb-2 flex flex-col flex-grow">
                    {/* Brand */}
                    {product.brand && (
                        <span className="text-[8px] sm:text-[10px] font-bold text-gold/60 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-0.5 sm:mb-1">
                            {typeof product.brand === 'object' ? product.brand.name : product.brand}
                        </span>
                    )}

                    {/* Product Name */}
                    <h3 className="text-white font-bold text-xs sm:text-sm leading-tight line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-gold transition-colors duration-300">
                        {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gold" fill="#D6B25E" />
                        <span className="text-[10px] sm:text-xs text-zinc-400 font-medium">{rating}</span>
                    </div>

                    {/* Price */}
                    <div className="mt-auto flex items-center gap-1.5 sm:gap-2">
                        {isOnSale ? (
                            <>
                                <span className="text-sm sm:text-lg font-black text-gold glow-gold">{product.sale_price}€</span>
                                <span className="text-[10px] sm:text-sm text-zinc-500 line-through">{product.price}€</span>
                            </>
                        ) : (
                            <span className="text-sm sm:text-lg font-black text-white group-hover:text-gold transition-colors duration-300">{product.price}€</span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
