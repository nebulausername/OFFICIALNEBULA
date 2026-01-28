import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, ArrowRight } from 'lucide-react';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { createPageUrl } from '../../utils';
import { useI18n } from '../i18n/I18nProvider';

export default function RecentlyViewedSection({ currentProductId }) {
    const { recentlyViewed, clearRecentlyViewed, loaded } = useRecentlyViewed();
    const { t } = useI18n();

    if (!loaded) return null;

    const displayItems = recentlyViewed.filter(p => p.id !== currentProductId).slice(0, 6);

    if (displayItems.length === 0) return null;

    return (
        <section className="mt-20">
            <div className="flex items-center justify-between mb-8">
                <div className="relative">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500"
                    >
                        Zuletzt angesehen
                    </motion.h2>
                    <div className="absolute -left-4 -top-4 w-12 h-12 bg-amber-500/10 rounded-full blur-xl -z-10" />
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearRecentlyViewed}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs font-medium text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
                >
                    <Trash2 className="w-3 h-3" />
                    Verlauf löschen
                </motion.button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <AnimatePresence>
                    {displayItems.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative"
                        >
                            <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`} className="block">
                                <div className="aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 relative mb-3 group-hover:border-amber-500/30 transition-colors shadow-lg group-hover:shadow-amber-500/10">
                                    {product.cover_image ? (
                                        <img
                                            src={product.cover_image}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                                            <Clock className="w-8 h-8 text-zinc-800" />
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-white text-xs font-bold flex items-center gap-1">
                                            Ansehen <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-sm font-bold text-zinc-300 truncate group-hover:text-white transition-colors">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs font-bold ${product.in_stock ? 'text-[#D6B25E]' : 'text-zinc-600 line-through'}`}>
                                        {product.price?.toLocaleString('de-DE', { minimumFractionDigits: 2 })}€
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
}
