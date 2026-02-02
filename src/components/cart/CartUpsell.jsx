import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { motion } from 'framer-motion';
import { Plus, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CartUpsell({ cartItems, onAdd }) {
    const [upsells, setUpsells] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUpsells();
    }, [cartItems]);

    const loadUpsells = async () => {
        try {
            // Fetch popular products (newest first as proxy for now)
            // Ideally, we'd have a 'popular' sort or 'recommended' endpoint
            const allProducts = await api.entities.Product.list('-created_at');

            const cartProductIds = new Set(cartItems.map(item => item.product_id));

            // Filter out items already in cart
            const available = allProducts.filter(p => !cartProductIds.has(p.id));

            // Pick 2 random items
            const shuffled = available.sort(() => 0.5 - Math.random());
            setUpsells(shuffled.slice(0, 2));
        } catch (error) {
            console.error('Error loading upsells:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAdd = async (product) => {
        // Here we would ideally call the add to cart logic directly.
        // But since we are likely inside the Cart page context, we might just redirect or 
        // trigger the main 'addToCart' if passed.
        // For now, simpler to link to product or emit event.
        if (onAdd) {
            onAdd(product);
        }
    };

    if (loading || upsells.length === 0) return null;

    return (
        <div className="mt-8 space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-gold" />
                Dazu passt perfekt
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {upsells.map((product) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel p-3 rounded-xl flex items-center gap-4 group border border-white/5 hover:border-gold/30 transition-colors"
                    >
                        <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden shrink-0 relative">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white truncate">{product.name}</h4>
                            <p className="text-gold font-medium text-sm">{(product.price || 0).toFixed(2)}€</p>
                        </div>

                        <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
                            <button className="w-8 h-8 rounded-full bg-white/10 hover:bg-gold hover:text-black flex items-center justify-center transition-all">
                                <Plus className="w-4 h-4" />
                            </button>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
