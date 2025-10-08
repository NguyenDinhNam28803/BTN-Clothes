import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { WishlistItem } from '../types';

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      loadLocalWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.id);

    if (!error && data) {
      setItems(data as WishlistItem[]);
    }
    setLoading(false);
  };

  const loadLocalWishlist = () => {
    const localWishlist = localStorage.getItem('wishlist');
    if (localWishlist) {
      setItems(JSON.parse(localWishlist));
    }
    setLoading(false);
  };

  const saveLocalWishlist = (wishlistItems: WishlistItem[]) => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  };

  const addToWishlist = async (productId: string) => {
    if (user) {
      const { error } = await supabase.from('wishlist_items').insert({
        user_id: user.id,
        product_id: productId,
      });

      if (!error) {
        await loadWishlist();
      }
    } else {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      const newItems = [
        ...items,
        {
          id: Date.now().toString(),
          user_id: '',
          product_id: productId,
          product,
          created_at: new Date().toISOString(),
        },
      ];

      setItems(newItems);
      saveLocalWishlist(newItems);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    if (user) {
      await supabase.from('wishlist_items').delete().eq('id', itemId);
      await loadWishlist();
    } else {
      const newItems = items.filter((item) => item.id !== itemId);
      setItems(newItems);
      saveLocalWishlist(newItems);
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.product_id === productId);
  };

  const getWishlistCount = () => {
    return items.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
