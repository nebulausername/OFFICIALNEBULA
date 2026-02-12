import React, { createContext, useContext, useState, useEffect } from 'react';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Load wishlist on user change
  useEffect(() => {
    if (user) {
      loadRemoteWishlist();
    } else {
      loadLocalWishlist();
    }
  }, [user]);

  const loadRemoteWishlist = async () => {
    try {
      setLoading(true);
      const { data, error } = await insforge.database
        .from('wishlist_items')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const remoteIds = new Set(data.map(item => item.product_id));

      // Merge local items if they exist
      const local = getLocalWishlist();
      if (local.length > 0) {
        // Add local items to remote
        const newItems = local.filter(id => !remoteIds.has(id)).map(id => ({
          user_id: user.id,
          product_id: id
        }));

        if (newItems.length > 0) {
          await insforge.database.from('wishlist_items').insert(newItems);
          newItems.forEach(item => remoteIds.add(item.product_id));
        }

        // Clear local storage
        localStorage.removeItem('nebula_wishlist');
      }

      setWishlistIds(remoteIds);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      // Fallback to empty or local if critical failure
    } finally {
      setLoading(false);
    }
  };

  const loadLocalWishlist = () => {
    setWishlistIds(new Set(getLocalWishlist()));
    setLoading(false);
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

    // Optimistic Update
    if (isCurrentlySaved) {
      newIds.delete(productId);
    } else {
      newIds.add(productId);
    }
    setWishlistIds(newIds);

    // Persist
    if (user) {
      try {
        if (isCurrentlySaved) {
          const { error } = await insforge.database
            .from('wishlist_items')
            .delete()
            .match({ user_id: user.id, product_id: productId });
          if (error) throw error;
        } else {
          const { error } = await insforge.database
            .from('wishlist_items')
            .insert({ user_id: user.id, product_id: productId });
          if (error) throw error;
        }
      } catch (error) {
        console.error('Wishlist sync error:', error);
        // Rollback
        setWishlistIds(wishlistIds);
        toast({
          title: "Fehler",
          description: "Konnte Wishlist nicht aktualisieren.",
          variant: "destructive"
        });
        return { success: false };
      }
    } else {
      saveLocalWishlist(newIds);
    }

    return { success: true, saved: !isCurrentlySaved };
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