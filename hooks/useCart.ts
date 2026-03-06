'use client';

import { useState, useEffect, useCallback } from 'react';
import { cartService, CartItem } from '@/services/cart.service';

const CART_UPDATE_EVENT = 'cart:update';

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart items
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const items = await cartService.getCartItems();
      setCartItems(items || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  
  useEffect(() => {
    fetchCart();

    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener(CART_UPDATE_EVENT, handleCartUpdate);
    return () => {
      window.removeEventListener(CART_UPDATE_EVENT, handleCartUpdate);
    };
  }, [fetchCart]);

  const addToCart = useCallback(
    async (item: {
      productId: string;
      name: string;
      price: number;
      image: string;
      quantity: number;
      size?: string;
      color?: string;
    }) => {
      try {
        await cartService.addToCart(item);
        window.dispatchEvent(new Event(CART_UPDATE_EVENT));
      } catch (err) {
        console.error('Error adding to cart:', err);
        throw err;
      }
    },
    []
  );

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      await cartService.updateQuantity(itemId, quantity);
      window.dispatchEvent(new Event(CART_UPDATE_EVENT));
    } catch (err) {
      console.error('Error updating quantity:', err);
      throw err;
    }
  }, []);

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      await cartService.removeFromCart(itemId);
      window.dispatchEvent(new Event(CART_UPDATE_EVENT));
    } catch (err) {
      console.error('Error removing from cart:', err);
      throw err;
    }
  }, []);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      await cartService.clearCart();
      window.dispatchEvent(new Event(CART_UPDATE_EVENT));
    } catch (err) {
      console.error('Error clearing cart:', err);
      throw err;
    }
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    cartCount,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}
