import { useState, useEffect } from 'react';

const RECENTLY_VIEWED_KEY = 'nebula_recently_viewed';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
            if (stored) {
                setRecentlyViewed(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load recently viewed', e);
        } finally {
            setLoaded(true);
        }
    }, []);

    const addRecentlyViewed = (product) => {
        if (!product || !product.id) return;

        setRecentlyViewed(prev => {
            // Remove existing occurrence
            const filtered = prev.filter(p => p.id !== product.id);

            // Add to front
            const newItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                cover_image: product.cover_image,
                sku: product.sku,
                in_stock: product.in_stock,
                viewedAt: Date.now()
            };

            const newItems = [newItem, ...filtered].slice(0, MAX_ITEMS);

            // Persist
            try {
                localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newItems));
            } catch (e) {
                console.error('Failed to save recently viewed', e);
            }

            return newItems;
        });
    };

    const clearRecentlyViewed = () => {
        setRecentlyViewed([]);
        localStorage.removeItem(RECENTLY_VIEWED_KEY);
    };

    return {
        recentlyViewed,
        addRecentlyViewed,
        clearRecentlyViewed,
        loaded
    };
}
