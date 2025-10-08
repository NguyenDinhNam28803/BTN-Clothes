import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { CartItem, Product, ProductVariant } from '../types';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  isRealTimeEnabled: boolean;
  addToCart: (productId: string, variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const realtimeSubscription = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (user) {
      loadCart();
      setupRealtimeSubscription();
      console.log('Real-time cart subscription set up for user:', user.id);
    } else {
      loadLocalCart();
      // Hủy subscription nếu đang có
      cleanupRealtimeSubscription();
      console.log('Using local cart, real-time features disabled');
    }
    
    // Dọn dẹp khi unmount
    return () => {
      cleanupRealtimeSubscription();
      console.log('Clean up real-time cart subscription');
    };
  }, [user]); // Chỉ kích hoạt lại khi user thay đổi để tránh vòng lặp vô hạn

  const setupRealtimeSubscription = () => {
    if (!user) return;
    
    cleanupRealtimeSubscription();
    
    realtimeSubscription.current = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time cart change:', payload);
          loadCart();
          setIsRealTimeEnabled(true);
        }
      )
      .subscribe();
  };
  
  const cleanupRealtimeSubscription = () => {
    if (realtimeSubscription.current) {
      supabase.removeChannel(realtimeSubscription.current);
      realtimeSubscription.current = null;
      setIsRealTimeEnabled(false);
    }
  };

  const loadCart = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*),
        variant:product_variants(*)
      `)
      .eq('user_id', user.id);

    if (!error && data) {
      setItems(data as CartItem[]);
    }
    setLoading(false);
  };

  const loadLocalCart = () => {
    const localCart = localStorage.getItem('cart');
    if (localCart) {
      setItems(JSON.parse(localCart));
    }
    setLoading(false);
  };

  const saveLocalCart = (cartItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  const addToCart = async (productId: string, variantId: string, quantity: number) => {
    if (user) {
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('variant_id', variantId)
        .maybeSingle();

      if (existingItem) {
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);
      } else {
        await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: productId,
          variant_id: variantId,
          quantity,
        });
      }

      await loadCart();
    } else {
      const existingIndex = items.findIndex(
        (item) => item.product_id === productId && item.variant_id === variantId
      );

      let newItems;
      if (existingIndex > -1) {
        newItems = [...items];
        newItems[existingIndex].quantity += quantity;
      } else {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        const { data: variant } = await supabase
          .from('product_variants')
          .select('*')
          .eq('id', variantId)
          .single();

        newItems = [
          ...items,
          {
            id: Date.now().toString(),
            user_id: '',
            product_id: productId,
            variant_id: variantId,
            quantity,
            product: product as Product,
            variant: variant as ProductVariant,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      }

      setItems(newItems);
      saveLocalCart(newItems);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (user) {
      await supabase.from('cart_items').delete().eq('id', itemId);
      await loadCart();
    } else {
      const newItems = items.filter((item) => item.id !== itemId);
      setItems(newItems);
      saveLocalCart(newItems);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    if (user) {
      await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
      await loadCart();
    } else {
      const newItems = items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      setItems(newItems);
      saveLocalCart(newItems);
    }
  };

  const clearCart = async () => {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      setItems([]);
    } else {
      setItems([]);
      localStorage.removeItem('cart');
    }
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const price = item.product?.sale_price || item.product?.base_price || 0;
      const adjustment = item.variant?.price_adjustment || 0;
      return total + (price + adjustment) * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };
  
  // Hàm để làm mới giỏ hàng theo yêu cầu
  const refreshCart = async () => {
    if (user) {
      await loadCart();
    } else {
      loadLocalCart();
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        isRealTimeEnabled,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
