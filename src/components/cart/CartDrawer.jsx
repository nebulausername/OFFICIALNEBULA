import React from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CartItem from './CartItem';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function CartDrawer({ isOpen, onClose, cartItems, products, updateQuantity, removeItem, totalPrice }) {
    if (!isOpen) return null;

    const total = totalPrice;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end font-sans">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50 backdrop-blur-xl absolute top-0 left-0 right-0 z-10">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        Warenkorb
                        <span className="text-sm font-normal text-zinc-500 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
                            {cartItems.length}
                        </span>
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pt-20 pb-40 px-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-50">
                            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                                <ShoppingBag size={32} className="text-zinc-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Leer</h3>
                                <p className="text-sm text-zinc-500">Dein Warenkorb ist noch leer.</p>
                            </div>
                            <Button onClick={onClose} variant="outline" className="mt-4">Weiter shoppen</Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cartItems.map(item => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    product={products[item.product_id]}
                                    updateQuantity={updateQuantity}
                                    removeItem={removeItem}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-zinc-950 border-t border-zinc-800 space-y-4">
                        <div className="flex items-end justify-between">
                            <div className="text-zinc-400 text-sm">Zwischensumme</div>
                            <div className="text-2xl font-black text-white">{total.toFixed(2)}€</div>
                        </div>


                        <Link to={createPageUrl('Checkout')} onClick={onClose} className="block w-full">
                            <Button className="w-full h-14 text-base font-black bg-white text-black hover:bg-zinc-200 rounded-xl flex items-center justify-between px-6">
                                <span>Zur Kasse</span>
                                <ArrowRight size={20} />
                            </Button>
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
