import api from './api';

export interface CartItem {
  _id: string;
  sessionId?: string;
  userId?: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export const cartService = {
  // Get session ID from localStorage or generate new one
  getSessionId(): string {
    let sessionId = sessionStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  },

  // Get current user ID
  getUserId(): string | null {
    const userStr = localStorage.getItem('userInfo');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user._id || null;
    }
    return null;
  },

  // Add item to cart
  async addToCart(item: {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    size?: string;
    color?: string;
  }): Promise<CartItem> {
    const sessionId = this.getSessionId();
    const userId = this.getUserId();

    const cartItem = {
      ...item,
      sessionId: userId ? undefined : sessionId,
      userId: userId || undefined,
    };

    const response = await api.post('/cart', cartItem);
    return response.data;
  },

  // Get cart items
  async getCartItems(): Promise<CartItem[]> {
    const sessionId = this.getSessionId();
    const userId = this.getUserId();

    if (userId) {
      // Get user cart
      const response = await api.get(`/cart?userId=${userId}`);
      return response.data;
    } else {
      // Get session cart
      const response = await api.get(`/cart?sessionId=${sessionId}`);
      return response.data;
    }
  },

  // Update quantity
  async updateQuantity(itemId: string, quantity: number): Promise<CartItem> {
    const response = await api.patch(`/cart/${itemId}`, { quantity });
    return response.data;
  },

  // Remove item
  async removeFromCart(itemId: string): Promise<void> {
    await api.delete(`/cart/${itemId}`);
  },

  // Clear cart
  async clearCart(): Promise<void> {
    const sessionId = this.getSessionId();
    const userId = this.getUserId();

    if (userId) {
      await api.delete(`/cart/user/${userId}`);
    } else {
      await api.delete(`/cart/session/${sessionId}`);
    }
  },

  // Merge anonymous cart to user cart
  async mergeCart(userId: string): Promise<void> {
    const sessionId = this.getSessionId();
    await api.post('/cart/merge', { sessionId, userId });
    
    // Clear session ID after merge
    sessionStorage.removeItem('cart_session_id');
  },

  // Get cart total
  async getCartTotal(): Promise<number> {
    const sessionId = this.getSessionId();
    const userId = this.getUserId();

    const response = await api.get(
      `/cart/total${userId ? `?userId=${userId}` : `?sessionId=${sessionId}`}`
    );
    return response.data.total;
  },
};
