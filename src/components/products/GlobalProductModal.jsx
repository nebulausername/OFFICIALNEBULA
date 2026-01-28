import React from 'react';
import { useProductModal } from '@/contexts/ProductModalContext';
import UnifiedProductModal from './UnifiedProductModal';

export default function GlobalProductModal() {
    const { isOpen, product, mode, closeProduct } = useProductModal();

    return (
        <UnifiedProductModal
            open={isOpen}
            product={product}
            mode={mode}
            onClose={closeProduct}
            onAddToCart={() => { }} // Confetti handle inside modal is enough, or we can add global toast here
        />
    );
}
