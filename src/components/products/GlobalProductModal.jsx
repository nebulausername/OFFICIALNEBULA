import React from 'react';
import { useProductModal } from '@/contexts/ProductModalContext';
import { useCart } from '@/contexts/CartContext';
import UnifiedProductModal from './UnifiedProductModal';

export default function GlobalProductModal() {
    const { isOpen, product, mode, closeProduct } = useProductModal();
    const { addToCart } = useCart();

    return (
        <UnifiedProductModal
            open={isOpen}
            product={product}
            mode={mode}
            onClose={closeProduct}
            onAddToCart={(data) => {
                // data contains quantity, selected_options (including variant_id, color_id, etc.)
                // GlobalProductModal passes this to context
                // UnifiedProductModal already constructs the payload 'data'
                // We need to adapt it or just pass data.product_id (which is product.id) and options
                if (product && product.id) {
                    addToCart(product.id, data.quantity, data.selected_options);
                }
            }}
        />
    );
}
