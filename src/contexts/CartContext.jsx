import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/api';
import { useAuth } from './AuthContext';
import { insforge, realtime } from '@/lib/insforge';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [productsMap, setProductsMap] = useState({});

    // Derived state
    const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const calculateTotal = useCallback(() => {
        return cartItems.reduce((sum, item) => {
            const product = productsMap[item.product_id];
            if (!product) return sum;

            let price = product.price;
            // Handle variant pricing if applicable
            if (item.selected_options?.price) {
                price = item.selected_options.price;
            } else if (item.selected_options?.variant_id) {
                const v = product.variants?.find(v => v.id === item.selected_options.variant_id);
                if (v?.price_override) price = v.price_override;
            }

            return sum + (price * (item.quantity || 1));
        }, 0);
    }, [cartItems, productsMap]);

    const totalPrice = calculateTotal();

    // Initial Fetch & Subscription
    useEffect(() => {
        if (user?.id) {
            fetchCart();
            const sub = subscribeToCart();
            return () => {
                if (sub) sub.unsubscribe();
            };
        } else {
            setCartItems([]);
        }
    }, [user?.id]);

    const fetchCart = async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            const { data, error } = await insforge.database
                .from('star_cart_items')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;

            setCartItems(data || []);

            // Fetch missing products
            const missingProductIds = [...new Set(data.map(i => i.product_id))].filter(id => !productsMap[id]);
            if (missingProductIds.length > 0) {
                await fetchProducts(missingProductIds);
            }
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProducts = async (ids) => {
        try {
            if (ids.length === 0) return;
            // Use InsForge DB directly for better performance if possible, or fallback to API wrapper if complex
            // For now, sticking to API wrapper for Products as it might have complex joins, 
            // BUT let's try direct DB for speed if simple
            const { data, error } = await insforge.database
                .from('products')
                .select('*')
                .in('id', ids);

            if (error) throw error; // Fallback to old method?

            setProductsMap(prev => {
                const newMap = { ...prev };
                data.forEach(p => { newMap[p.id] = p; });
                return newMap;
            });
        } catch (err) {
            // Fallback to API wrapper
            try {
                const productPromises = ids.map(id => api.entities.Product.filter({ id }));
                const results = await Promise.all(productPromises);
                setProductsMap(prev => {
                    const newMap = { ...prev };
                    results.forEach(res => {
                        if (res && res[0]) newMap[res[0].id] = res[0];
                    });
                    return newMap;
                });
            } catch (e) {
                console.error("Error fetching cart products", e);
            }
        }
    };

    const subscribeToCart = () => {
        // Subscribe to changes in star_cart_items for this user
        return realtime.subscribeTable('star_cart_items', (payload) => {
            if (payload.new?.user_id === user.id || payload.old?.user_id === user.id) {
                console.log('🛒 Realtime Cart Update');
                fetchCart(); // Simplest strategy: refresh on any change
            }
        });
    };

    // Actions
    const addToCart = async (productId, quantity = 1, options = {}) => {
        if (!user) {
            toast.error("Anmeldung erforderlich", {
                description: "Bitte melde dich an, um den Warenkorb zu nutzen."
            });
            // Optionally redirect to login?
            return;
        }

        // Optimistic Update
        const tempId = 'temp-' + Date.now();
        const newItem = {
            id: tempId,
            user_id: user.id,
            product_id: productId,
            quantity,
            selected_options: options,
            created_at: new Date().toISOString()
        };

        setCartItems(prev => [...prev, newItem]);
        setIsOpen(true);

        try {
            const { data, error } = await insforge.database
                .from('star_cart_items')
                .insert({
                    user_id: user.id,
                    product_id: productId,
                    quantity: quantity,
                    selected_options: options // schema must support JSONB for this
                })
                .select()
                .single();

            if (error) throw error;

            // Replace temp item with real one
            setCartItems(prev => prev.map(i => i.id === tempId ? data : i));

            // Ensure product data is loaded
            if (!productsMap[productId]) {
                await fetchProducts([productId]);
            }

            toast.success("Hinzugefügt! 🛒", {
                description: "Artikel wurde zum Warenkorb hinzugefügt.",
            });

        } catch (error) {
            console.error("Add to cart failed", error);
            setCartItems(prev => prev.filter(i => i.id !== tempId)); // Revert
            toast.error("Fehler", {
                description: "Konnte Artikel nicht hinzufügen."
            });
        }
    };

    const removeFromCart = async (itemId) => {
        const originalItems = [...cartItems];
        setCartItems(prev => prev.filter(i => i.id !== itemId));

        try {
            const { error } = await insforge.database
                .from('star_cart_items')
                .delete()
                .eq('id', itemId);

            if (error) throw error;
        } catch (error) {
            console.error("Remove from cart failed", error);
            setCartItems(originalItems); // Revert
            toast.error("Fehler", {
                description: "Konnte Artikel nicht löschen."
            });
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        const originalItems = [...cartItems];
        setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i));

        try {
            const { error } = await insforge.database
                .from('star_cart_items')
                .update({ quantity: newQuantity })
                .eq('id', itemId);

            if (error) throw error;
        } catch (error) {
            console.error("Update quantity failed", error);
            setCartItems(originalItems);
            toast.error("Fehler", {
                description: "Konnte Menge nicht aktualisieren."
            });
        }
    };

    const clearCart = async () => {
        const originalItems = [...cartItems];
        setCartItems([]);

        try {
            const { error } = await insforge.database
                .from('star_cart_items')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;
        } catch (error) {
            console.error("Clear cart failed", error);
            setCartItems(originalItems);
        }
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            products: productsMap,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            isOpen,
            openCart: () => setIsOpen(true),
            closeCart: () => setIsOpen(false),
            isLoading,
            totalPrice,
            totalItems
        }}>
            {children}
        </CartContext.Provider>
    );
};
