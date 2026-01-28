import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useI18n } from '../i18n/I18nProvider';

const RECENTLY_VIEWED_KEY = 'nebula_recently_viewed';
const MAX_RECENT_ITEMS = 8;

/**
 * RecentlyViewedSection - Shows recently viewed products
 * Tracks product views in localStorage
 */
export default function RecentlyViewedSection({
    currentProductId,
    className = ''
}) {
    const { t, formatCurrency } = useI18n();
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [isVisible, setIsVisible] = useState(true);

    // Load recently viewed on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);
            if (saved) {
                const items = JSON.parse(saved);
                // Filter out current product
                const filtered = items.filter(p => p.id !== currentProductId);
                setRecentlyViewed(filtered);
            }
        } catch (e) {
            console.error('Error loading recently viewed:', e);
        }
    }, [currentProductId]);

    if (recentlyViewed.length === 0 || !isVisible) {
        return null;
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`py-12 relative overflow-hidden ${className}`}
        >
            {/* Background Glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(214, 178, 94, 0.03) 0%, transparent 70%)'
                }}
            />

            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">
                                {t('shop.recentlyViewed') || 'Zuletzt angesehen'}
                            </h3>
                            <p className="text-xs text-zinc-500">
                                {t('shop.continueWhereyouleftoff') || 'Hier weiterstöbern'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                        aria-label="Ausblenden"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Products Row */}
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mask-linear-fade">
                    {recentlyViewed.slice(0, 6).map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex-shrink-0 w-48 group"
                        >
                            <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-white/5 group-hover:border-amber-500/30 transition-all">
                                    <img
                                        src={product.cover_image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <div className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-amber-500 text-black text-xs font-bold">
                                                <Sparkles className="w-3 h-3" />
                                                Ansehen
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 px-1">
                                    <p className="text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                                        {product.name}
                                    </p>
                                    <p className="text-sm font-black text-amber-400">
                                        {formatCurrency ? formatCurrency(product.price) : `${product.price?.toFixed(2)}€`}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}

                    {/* View All Card */}
                    {recentlyViewed.length > 6 && (
                        <Link
                            to={createPageUrl('Products')}
                            className="flex-shrink-0 w-48 aspect-square rounded-xl border border-dashed border-zinc-800 hover:border-amber-500/30 flex flex-col items-center justify-center gap-3 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                                <ChevronRight className="w-6 h-6 text-amber-400" />
                            </div>
                            <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">
                                +{recentlyViewed.length - 6} mehr
                            </span>
                        </Link>
                    )}
                </div>
            </div>
        </motion.section>
    );
}

/**
 * Utility function to track a product view
 * Call this when a product is viewed
 */
export function trackProductView(product) {
    if (!product?.id) return;

    try {
        const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);
        let items = saved ? JSON.parse(saved) : [];

        // Remove if already exists
        items = items.filter(p => p.id !== product.id);

        // Add to front
        items.unshift({
            id: product.id,
            name: product.name,
            price: product.price,
            cover_image: product.cover_image,
            viewedAt: Date.now()
        });

        // Limit size
        items = items.slice(0, MAX_RECENT_ITEMS);

        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
    } catch (e) {
        console.error('Error tracking product view:', e);
    }
}

/**
 * Get recently viewed products
 */
export function getRecentlyViewed() {
    try {
        const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Error getting recently viewed:', e);
        return [];
    }
}

/**
 * Clear recently viewed history
 */
export function clearRecentlyViewed() {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
}
