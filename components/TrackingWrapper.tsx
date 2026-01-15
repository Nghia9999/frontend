"use client";

import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";

interface TrackingWrapperProps {
  children: React.ReactNode;
  userId?: string;
  enableTracking?: boolean;
}

export default function TrackingWrapper({ 
  children, 
  userId, 
  enableTracking = true 
}: TrackingWrapperProps) {
  const { trackView, trackClick, trackAddToCart, trackPurchase, trackSearch } = useTracking({
    userId,
    autoTrack: enableTracking
  });

  // Auto-track page views
  useEffect(() => {
    if (!enableTracking) return;

    // Track page view
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Track product page views
    if (path.startsWith('/product/') && searchParams.has('id')) {
      const productId = searchParams.get('id');
      trackView(productId!);
    }

    // Track category page views
    if (path === '/product' && searchParams.has('category')) {
      const categoryId = searchParams.get('category');
      trackView('category', categoryId!);
    }

    // Track search
    if (searchParams.has('search')) {
      const searchQuery = searchParams.get('search');
      trackSearch(searchQuery!);
    }
  }, [enableTracking, trackView, trackSearch]);

  // Make tracking functions available globally
  useEffect(() => {
    if (!enableTracking) return;

    // Extend window interface for global tracking
    (window as any).tracker = {
      trackView,
      trackClick,
      trackAddToCart,
      trackPurchase,
      trackSearch
    };
  }, [enableTracking, trackView, trackClick, trackAddToCart, trackPurchase, trackSearch]);

  return <>{children}</>;
}
