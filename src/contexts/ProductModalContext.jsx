import React, { createContext, useContext, useState } from 'react';

const ProductModalContext = createContext();

export const useProductModal = () => {
    const context = useContext(ProductModalContext);
    if (!context) {
        throw new Error('useProductModal must be used within a ProductModalProvider');
    }
    return context;
};

export const ProductModalProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [product, setProduct] = useState(null);
    const [mode, setMode] = useState('full'); // 'full', 'quick'

    const openProduct = (productData, viewMode = 'full') => {
        setProduct(productData);
        setMode(viewMode);
        setIsOpen(true);
    };

    const closeProduct = () => {
        setIsOpen(false);
        // Delay clearing product to allow animation to finish
        setTimeout(() => setProduct(null), 300);
    };

    return (
        <ProductModalContext.Provider value={{
            isOpen,
            product,
            mode,
            openProduct,
            closeProduct
        }}>
            {children}
        </ProductModalContext.Provider>
    );
};
