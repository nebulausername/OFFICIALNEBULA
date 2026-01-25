import React from 'react';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutSummary({ cartItems, products, total, totalDiscount = 0, shippingCost = 0 }) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center cursor-pointer md:cursor-default" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg text-purple-400">
                        <ShoppingBag size={20} />
                    </div>
                    <h2 className="font-bold text-white text-lg">Bestellübersicht</h2>
                </div>
                <div className="md:hidden text-zinc-400">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                <div className="hidden md:block font-bold text-white text-lg">{total.toFixed(2)}€</div>
            </div>

            <AnimatePresence initial={false}>
                {(isExpanded || window.innerWidth >= 768) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:block"
                    >
                        <div className="p-6 space-y-4">
                            {cartItems.map(item => {
                                const product = products[item.product_id];
                                if (!product) return null;

                                let price = product.price;
                                // Handle overrides (simplified for summary)
                                if (item.selected_options?.variant_id) {
                                    const v = product.variants?.find(v => v.id === item.selected_options.variant_id);
                                    if (v?.price_override) price = v.price_override;
                                }

                                return (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="relative">
                                            <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                                                {product.cover_image && (
                                                    <img src={product.cover_image} alt={product.name} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-600 text-white text-xs font-bold rounded-full flex items-center justify-center border border-zinc-900">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-white text-sm line-clamp-2">{product.name}</h4>
                                            <p className="text-zinc-500 text-xs">{item.selected_options?.variant_name || product.sku}</p>
                                        </div>
                                        <div className="font-bold text-white text-sm">
                                            {(price * item.quantity).toFixed(2)}€
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-6 bg-zinc-950/30 space-y-3 border-t border-zinc-800 text-sm">
                            <div className="flex justify-between text-zinc-400">
                                <span>Zwischensumme</span>
                                <span>{total.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-zinc-400">
                                <span>Versand</span>
                                <span>{shippingCost === 0 ? 'Kostenlos' : `${shippingCost.toFixed(2)}€`}</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="flex justify-between text-emerald-400 font-medium">
                                    <span>Rabatt</span>
                                    <span>-{totalDiscount.toFixed(2)}€</span>
                                </div>
                            )}
                            <div className="pt-4 mt-4 border-t border-zinc-800 flex justify-between items-end">
                                <span className="font-bold text-zinc-300">Gesamt</span>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-white block leading-none">{(total + shippingCost - totalDiscount).toFixed(2)}€</span>
                                    <span className="text-xs text-zinc-500">inkl. MwSt.</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
