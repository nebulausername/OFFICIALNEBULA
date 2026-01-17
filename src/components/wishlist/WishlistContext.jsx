import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/api';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      
      const items = await api.entities.WishlistItem.filter({ user_id: currentUser.id });
      setWishlistIds(new Set(items.map(item => item.product_id)));
      
      // Merge localStorage items if any
      const localItems = getLocalWishlist();
      if (localItems.length > 0) {
        await Promise.all(
          localItems.map(productId => 
            api.entities.WishlistItem.create({ 
              user_id: currentUser.id, 
              product_id: productId 
            }).catch(() => {})
          )
        );
        localStorage.removeItem('nebula_wishlist');
        // Reload after merge
        const updatedItems = await api.entities.WishlistItem.filter({ user_id: currentUser.id });
        setWishlistIds(new Set(updatedItems.map(item => item.product_id)));
      }
    } catch (error) {
      // Guest mode
      setUser(null);
      const localItems = getLocalWishlist();
      setWishlistIds(new Set(localItems));
    } finally {
      setLoading(false);
    }
  };

  const getLocalWishlist = () => {
    try {
      const stored = localStorage.getItem('nebula_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalWishlist = (ids) => {
    localStorage.setItem('nebula_wishlist', JSON.stringify(Array.from(ids)));
  };

  const toggleWishlist = async (productId) => {
    const isCurrentlySaved = wishlistIds.has(productId);
    const newIds = new Set(wishlistIds);

    // Optimistic update
    if (isCurrentlySaved) {
      newIds.delete(productId);
    } else {
      newIds.add(productId);
    }
    setWishlistIds(newIds);

    try {
      if (user) {
        // Authenticated user
        if (isCurrentlySaved) {
          const items = await api.entities.WishlistItem.filter({ 
            user_id: user.id, 
            product_id: productId 
          });
          if (items.length > 0) {
            await api.entities.WishlistItem.delete(items[0].id);
          }
        } else {
          await api.entities.WishlistItem.create({ 
            user_id: user.id, 
            product_id: productId 
          });
        }
      } else {
        // Guest mode
        saveLocalWishlist(newIds);
      }
      return { success: true, saved: !isCurrentlySaved };
    } catch (error) {
      // Rollback on error
      setWishlistIds(wishlistIds);
      return { success: false, error: error.message };
    }
  };

  const isInWishlist = (productId) => {
    return wishlistIds.has(productId);
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlistIds: Array.from(wishlistIds), 
      toggleWishlist, 
      isInWishlist, 
      loading,
      count: wishlistIds.size
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}