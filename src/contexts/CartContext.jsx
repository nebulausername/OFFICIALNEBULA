import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/api';
import { useAuth } from './AuthContext';
import { insforge, realtime } from '@/lib/insforge';
import { useToast } from '@/components/ui/use-toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const { toast } = useToast(); // Use the standard hook
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

    // Initial Fetch
    useEffect(() => {
        if (user?.id) {
            fetchCart();
            subscribeToCart();
        } else {
            setCartItems([]);
        }
        // Cleanup subscription on unmount or user change
        return () => {
            if (user?.id) {
                realtime.unsubscribe(`cart:${user.id}`);
            }
        }
    }, [user?.id]);

    const fetchCart = async () => {
        try {
            setIsLoading(true);
            const items = await api.entities.StarCartItem.filter({ user_id: user.id });
            setCartItems(items);

            // Fetch missing products
            const missingProductIds = [...new Set(items.map(i => i.product_id))].filter(id => !productsMap[id]);
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
            // In a real optimized app, we'd use an 'in' query, but for now we loop or use existing filter logic
            // Assuming api.entities.Product.filter accepts complex queries or we just fetch individually for now
            // Optimization: Fetch all products needed in parallel
            const productPromises = ids.map(id => api.entities.Product.filter({ id }));
            const results = await Promise.all(productPromises);

            setProductsMap(prev => {
                const newMap = { ...prev };
                results.forEach(res => {
                    if (res && res[0]) {
                        newMap[res[0].id] = res[0];
                    }
                });
                return newMap;
            });
        } catch (err) {
            console.error("Error fetching cart products", err);
        }
    };

    const subscribeToCart = () => {
        // Subscription to 'cart_update' event on a channel specific to the user
        // Assuming backend emits 'cart_update' when StarCartItems change for this user
        realtime.subscribe(`cart:${user.id}`, (data) => {
            console.log("Realtime Cart Update:", data);
            // Ideally we get the diff, but safe fallback is to refetch or merge
            // If the event provides the new item/action:
            if (data.action === 'refresh') {
                fetchCart();
            }
        });

        // Also subscribe to standard InsForge Entity changes if supported
        // standardized channel for table 'star_cart_items'
        realtime.subscribeTable('star_cart_items', (payload) => {
            if (payload.new?.user_id === user.id || payload.old?.user_id === user.id) {
                fetchCart(); // Brute force refresh for accuracy
            }
        });
    };

    // Actions
    const addToCart = async (productId, quantity = 1, options = {}) => {
        if (!user) {
            toast({
                title: "Anmeldung erforderlich",
                description: "Bitte melde dich an, um den Warenkorb zu nutzen.",
                variant: 'destructive'
            });
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
        setIsOpen(true); // Open drawer properly

        try {
            // Prepare payload, ensuring we store options as JSON if needed or structured
            const payload = {
                user_id: user.id,
                product_id: productId,
                quantity: quantity,
                selected_options: options
            };

            const created = await api.entities.StarCartItem.create(payload);

            // Replace temp item with real one
            setCartItems(prev => prev.map(i => i.id === tempId ? created : i));

            // Ensure product data is loaded
            if (!productsMap[productId]) {
                await fetchProducts([productId]);
            }

            toast({
                title: "Hinzugefügt! 🛒",
                description: "Artikel wurde zum Warenkorb hinzugefügt.",
                className: "bg-gold/10 border-gold/30 text-white"
            });

        } catch (error) {
            console.error("Add to cart failed", error);
            setCartItems(prev => prev.filter(i => i.id !== tempId)); // Revert
            toast({
                title: "Fehler",
                description: "Konnte Artikel nicht hinzufügen.",
                variant: 'destructive'
            });
        }
    };

    const removeFromCart = async (itemId) => {
        const originalItems = [...cartItems];
        setCartItems(prev => prev.filter(i => i.id !== itemId));

        try {
            await api.entities.StarCartItem.delete(itemId);
        } catch (error) {
            console.error("Remove from cart failed", error);
            setCartItems(originalItems); // Revert
            toast({
                title: "Fehler",
                description: "Konnte Artikel nicht löschen.",
                variant: 'destructive'
            });
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        const originalItems = [...cartItems];
        setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i));

        try {
            await api.entities.StarCartItem.update(itemId, { quantity: newQuantity });
        } catch (error) {
            console.error("Update quantity failed", error);
            setCartItems(originalItems);
            toast({
                title: "Fehler",
                description: "Konnte Menge nicht aktualisieren.",
                variant: 'destructive'
            });
        }
    };

    const clearCart = async () => {
        // Optimistic
        const originalItems = [...cartItems];
        setCartItems([]);

        try {
            // Delete all items (might need a backend endpoint for bulk delete, or loop)
            // For now loop (safe MVP)
            await Promise.all(originalItems.map(item => api.entities.StarCartItem.delete(item.id)));
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
