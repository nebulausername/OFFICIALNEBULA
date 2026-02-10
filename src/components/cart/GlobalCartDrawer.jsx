import React from 'react';
import { useCart } from '@/contexts/CartContext';
import CartDrawer from './CartDrawer';
import { AnimatePresence } from 'framer-motion';

export default function GlobalCartDrawer() {
    const { isOpen, closeCart, cartItems, products, updateQuantity, removeFromCart, totalPrice } = useCart();

    return (
        <AnimatePresence>
            {isOpen && (
                <CartDrawer
                    isOpen={isOpen}
                    onClose={closeCart}
                    cartItems={cartItems}
                    products={products}
                    updateQuantity={updateQuantity}
                    removeItem={removeFromCart}
                    totalPrice={totalPrice}
                />
            )}
        </AnimatePresence>
    );
}
