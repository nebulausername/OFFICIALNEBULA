import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, Star, ShoppingBag } from 'lucide-react';

export default function CartItem({ item, product, updateQuantity, removeItem }) {
    if (!product) return null;

    const getItemPrice = () => {
        // Logic to handle variant pricing
        if (item.selected_options?.price && item.selected_options.price > 0) return item.selected_options.price;
        if (item.selected_options?.variant_id && product?.variants) {
            const variant = product.variants.find(v => v.id === item.selected_options.variant_id);
            if (variant?.price_override) return variant.price_override;
        }
        return product.price || 0;
    };

    const currentPrice = getItemPrice();
    const totalPrice = (currentPrice * item.quantity).toFixed(2);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="group relative flex gap-4 p-4 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
            {/* Product Image */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-zinc-950 flex-shrink-0">
                {(item.selected_options?.image || product.cover_image) ? (
                    <img
                        src={item.selected_options?.image || product.cover_image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800">
                        <ShoppingBag size={24} />
                    </div>
                )}
            </div>

            {/* Info & Controls */}
            <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            <h3 className="font-bold text-white text-lg leading-tight line-clamp-2">{product.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-zinc-500 text-sm">{product.sku}</span>
                                {item.selected_options?.size && (
                                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-xs text-zinc-300 font-medium">
                                        {item.selected_options.size}
                                    </span>
                                )}
                            </div>
                            {item.selected_options?.color_name && (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: item.selected_options.color_hex }} />
                                    <span className="text-xs text-zinc-400">{item.selected_options.color_name}</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex items-end justify-between mt-2">
                    {/* Quantity Control */}
                    <div className="flex items-center gap-1 bg-zinc-950 rounded-xl p-1 border border-zinc-800">
                        <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                            disabled={item.quantity <= 1}
                        >
                            <Minus size={14} />
                        </button>
                        <span className="min-w-[24px] text-center font-bold text-sm text-white">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                        <span className="text-xs text-zinc-500 block">Gesamt</span>
                        <span className="text-xl font-black text-white">{totalPrice}€</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
