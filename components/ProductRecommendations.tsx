"use client";

import { useEffect, useState } from "react";
import trackingService, { RecommendationDto } from "@/services/tracking.service";
import { Star, TrendingUp, Clock, Users } from "lucide-react";

interface ProductRecommendationsProps {
  userId?: string;
  productId?: string;
  type?: 'collaborative' | 'content_based' | 'popular' | 'recent' | 'similar';
  limit?: number;
  title?: string;
}

export default function ProductRecommendations({
  userId,
  productId,
  type = 'collaborative',
  limit = 10,
  title
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [userId, productId, type, limit]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      let data: RecommendationDto[] = [];

      switch (type) {
        case 'collaborative':
          if (userId) {
            data = await trackingService.getCollaborativeRecommendations(userId, limit);
          }
          break;
        case 'content_based':
          if (userId) {
            data = await trackingService.getContentBasedRecommendations(userId, limit);
          }
          break;
        case 'popular':
          data = await trackingService.getPopularProducts(limit);
          break;
        case 'recent':
          if (userId) {
            const recentTracking = await trackingService.getRecentlyViewed(userId, limit);
            data = recentTracking.map((item: any) => ({
              userId,
              productId: item.productId,
              score: 1,
              reason: 'recently_viewed',
              type: 'recent'
            }));
          }
          break;
        case 'similar':
          if (productId) {
            data = await trackingService.getSimilarProducts(productId, limit);
          }
          break;
        default:
          if (userId) {
            data = await trackingService.getRecommendations(userId, limit);
          }
      }

      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'collaborative':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'content_based':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'popular':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'recent':
        return <Clock className="w-4 h-4 text-green-500" />;
      default:
        return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRecommendationTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'collaborative':
        return 'Gợi ý cho bạn';
      case 'content_based':
        return 'Sản phẩm tương tự';
      case 'popular':
        return 'Sản phẩm phổ biến';
      case 'recent':
        return 'Đã xem gần đây';
      case 'similar':
        return 'Sản phẩm tương tự';
      default:
        return 'Gợi ý sản phẩm';
    }
  };

  const getRecommendationReason = (reason: string) => {
    switch (reason) {
      case 'similar_users':
        return 'Người dùng tương tự cũng thích';
      case 'similar_products':
        return 'Sản phẩm tương tự';
      case 'popular':
        return 'Phổ biến';
      case 'recently_viewed':
        return 'Đã xem gần đây';
      default:
        return 'Gợi ý cho bạn';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{getRecommendationTitle()}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-40 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{getRecommendationTitle()}</h3>
        <p className="text-gray-500 text-center py-8">
          Chưa có gợi ý nào cho bạn
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">{getRecommendationTitle()}</h3>
        {getRecommendationIcon(type)}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.productId} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: RecommendationDto }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [recommendation.productId]);

  const fetchProduct = async () => {
    try {
      // Import productService dynamically to avoid circular dependency
      const { productService } = await import("@/services/product.service");
      const data = await productService.getOne(recommendation.productId);
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-40 rounded-lg mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="group cursor-pointer">
      <div className="relative">
        <img
          src={product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-40 object-cover rounded-lg mb-2 group-hover:opacity-90 transition"
        />
        
        {/* Recommendation badge */}
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow">
          <Star className="w-3 h-3 text-yellow-500 fill-current" />
          <span className="font-medium">{Math.round(recommendation.score * 100)}%</span>
        </div>
      </div>
      
      <h4 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h4>
      <p className="text-red-500 font-semibold">
        {new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(product.price || 0)}
      </p>
      
      {/* Recommendation reason */}
      <p className="text-xs text-gray-500 mt-1">
        {recommendation.reason}
      </p>
    </div>
  );
}
