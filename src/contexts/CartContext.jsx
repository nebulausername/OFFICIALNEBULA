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

    // Load Local Cart on Mount if not logged in
    useEffect(() => {
        if (!user) {
            const stored = localStorage.getItem('nebula_cart');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setCartItems(parsed);
                    const idsToFetch = [...new Set(parsed.map(i => i.product_id))];
                    if (idsToFetch.length > 0) fetchProducts(idsToFetch);
                } catch (e) {
                    console.error("Failed to parse local cart", e);
                }
            }
        }
    }, [user]);

    // Initial Fetch & Subscription (Remote)
    useEffect(() => {
        if (user?.id) {
            fetchCart();
            const sub = subscribeToCart();
            return () => {
                if (sub) sub.unsubscribe();
            };
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
            const { data, error } = await insforge.database
                .from('products')
                .select('*')
                .in('id', ids);

            if (error) throw error;

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
        if (!productId) return;

        // Optimistic Update / Local State
        const tempId = user ? 'temp-' + Date.now() : 'local-' + Date.now();
        const newItem = {
            id: tempId,
            user_id: user?.id || null,
            product_id: productId,
            quantity,
            selected_options: options,
            created_at: new Date().toISOString()
        };

        // Check if item already exists with same options
        setCartItems(prev => {
            const existingIndex = prev.findIndex(item =>
                item.product_id === productId &&
                JSON.stringify(item.selected_options) === JSON.stringify(options)
            );

            let newItems;
            if (existingIndex >= 0) {
                newItems = [...prev];
                newItems[existingIndex].quantity += quantity;
            } else {
                newItems = [...prev, newItem];
            }

            if (!user) {
                localStorage.setItem('nebula_cart', JSON.stringify(newItems));
            }
            return newItems;
        });

        setIsOpen(true);
        if (!productsMap[productId]) await fetchProducts([productId]);

        if (user) {
            try {
                // If item exists, update quantity
                const existingItem = cartItems.find(item =>
                    item.product_id === productId &&
                    JSON.stringify(item.selected_options) === JSON.stringify(options)
                );

                if (existingItem && !existingItem.id.startsWith('temp-')) {
                    const { error } = await insforge.database
                        .from('star_cart_items')
                        .update({ quantity: existingItem.quantity + quantity })
                        .eq('id', existingItem.id);
                    if (error) throw error;
                } else {
                    const { data, error } = await insforge.database
                        .from('star_cart_items')
                        .insert({
                            user_id: user.id,
                            product_id: productId,
                            quantity: quantity,
                            selected_options: options
                        })
                        .select()
                        .single();

                    if (error) throw error;
                    // Replace temp item with real one
                    setCartItems(prev => prev.map(i => i.id === tempId ? data : i));
                }
            } catch (error) {
                console.error("Add to cart failed", error);
                // Revert or show error - for now just log
                toast.error("Fehler beim Synchronisieren", { description: "Artikel ist nur lokal gespeichert." });
            }
        }

        toast.success("Hinzugefügt! 🛒", {
            description: "Artikel wurde zum Warenkorb hinzugefügt.",
        });
    };

    const removeFromCart = async (itemId) => {
        const originalItems = [...cartItems];
        setCartItems(prev => {
            const newItems = prev.filter(i => i.id !== itemId);
            if (!user) localStorage.setItem('nebula_cart', JSON.stringify(newItems));
            return newItems;
        });

        if (user && !itemId.toString().startsWith('local-')) {
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
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        const originalItems = [...cartItems];
        setCartItems(prev => {
            const newItems = prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i);
            if (!user) localStorage.setItem('nebula_cart', JSON.stringify(newItems));
            return newItems;
        });

        if (user && !itemId.toString().startsWith('local-')) {
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
        }
    };

    const clearCart = async () => {
        const originalItems = [...cartItems];
        setCartItems([]);
        if (!user) localStorage.removeItem('nebula_cart');

        if (user) {
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
