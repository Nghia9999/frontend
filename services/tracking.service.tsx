import api from "./api";

export type TrackingDto = {
  _id?: string;
  id?: string;
  userId: string;
  productId: string;
  categoryId?: string;
  action: 'view' | 'click' | 'add_to_cart' | 'purchase' | 'search';
  sessionId?: string;
  timestamp: string;
  metadata?: {
    duration?: number;
    searchQuery?: string;
    price?: number;
    quantity?: number;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type RecommendationDto = {
  _id?: string;
  id?: string;
  userId: string;
  productId: string;
  score: number;
  reason: string;
  type: 'collaborative' | 'content_based' | 'popular' | 'recent';
  createdAt?: string;
};

export const trackingService = {
  // Track user activity
  async track(data: Omit<TrackingDto, '_id' | 'id' | 'createdAt' | 'updatedAt'>) {
    const res = await api.post("/tracking", data);
    return res.data;
  },

  // Merge anonymous tracking data with user ID
  async mergeTracking(sessionId: string, userId: string): Promise<{ updated: number }> {
    try {
      const response = await api.post('/tracking/merge', {
        sessionId,
        userId,
      });
      return response.data;
    } catch (error) {
      console.error('Error merging tracking:', error);
      throw error;
    }
  },

  // Get user's tracking history
  async getUserTracking(userId: string, limit: number = 50) {
    const res = await api.get(`/tracking/user/${userId}?limit=${limit}`);
    return res.data;
  },

  // Get popular products
  async getPopularProducts(limit: number = 10) {
    const res = await api.get(`/tracking/popular?limit=${limit}`);
    return res.data;
  },

  // Get recently viewed products
  async getRecentlyViewed(userId: string, limit: number = 10) {
    const res = await api.get(`/tracking/recent/${userId}?limit=${limit}`);
    return res.data;
  },

  // Get recommendations for user
  async getRecommendations(userId: string, limit: number = 10) {
    const res = await api.get(`/recommendations/${userId}?limit=${limit}`);
    return res.data;
  },

  // Get similar products based on product
  async getSimilarProducts(productId: string, limit: number = 10) {
    const res = await api.get(`/recommendations/similar/${productId}?limit=${limit}`);
    return res.data;
  },

  // Get collaborative filtering recommendations
  async getCollaborativeRecommendations(userId: string, limit: number = 10) {
    const res = await api.get(`/recommendations/collaborative/${userId}?limit=${limit}`);
    return res.data;
  },

  // Get content-based recommendations
  async getContentBasedRecommendations(userId: string, limit: number = 10) {
    const res = await api.get(`/recommendations/content/${userId}?limit=${limit}`);
    return res.data;
  },
};

export default trackingService;
