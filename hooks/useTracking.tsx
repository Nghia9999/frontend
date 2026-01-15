"use client";

import { useState, useEffect, useCallback } from 'react';
import { trackingService } from '../services/tracking.service';
import { authService } from '../services/auth.service';

interface TrackingOptions {
  userId?: string;
  autoTrack?: boolean;
}

interface TrackingData {
  userId: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  productId: string;
  categoryId?: string;
  action: 'view' | 'click' | 'add_to_cart' | 'purchase' | 'search';
  metadata?: Record<string, any>;
  timestamp: string; // Required field
}

const isObjectIdLike = (value: string) => /^[a-fA-F0-9]{24}$/.test(value);

export const useTracking = (options: TrackingOptions = {}) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);

  // Generate or get session ID
  useEffect(() => {
    let currentSessionId = sessionStorage.getItem('tracking_session_id');
    
    if (!currentSessionId) {
      currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('tracking_session_id', currentSessionId);
    }
    
    setSessionId(currentSessionId);
  }, []);

  // Get user ID from auth service or options
  const getUserId = useCallback(() => {
    if (options.userId) return options.userId;
    
    const currentUser = authService.getCurrentUser();
    if (currentUser.isAuthenticated && currentUser.user?._id) {
      return currentUser.user._id;
    }
    
    return 'anonymous';
  }, [options.userId]);

  // Get client info
  const getClientInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      // Note: IP address will be set on backend
    };
  }, []);

  // Track action
  const track = useCallback(async (data: Omit<TrackingData, 'userId' | 'sessionId'>) => {
    if (!sessionId) return;

    // Only product-related actions should carry a productId that can be used as a Product _id.
    if (data.action !== 'search' && !isObjectIdLike(data.productId)) return;

    const trackingData: TrackingData = {
      userId: getUserId(),
      sessionId,
      productId: data.productId,
      categoryId: data.categoryId,
      action: data.action,
      metadata: data.metadata,
      timestamp: new Date().toISOString(), // Thêm timestamp
      ...getClientInfo(),
    };

    try {
      setIsTracking(true);
      await trackingService.track(trackingData);
    } catch (error) {
      console.error('Tracking error:', error);
    } finally {
      setIsTracking(false);
    }
  }, [sessionId, getUserId, getClientInfo]);

  // Specific tracking methods
  const trackView = useCallback((productId: string, categoryId?: string) => {
    return track({
      productId,
      categoryId,
      action: 'view',
      metadata: { timestamp: new Date().toISOString() },
    });
  }, [track]);

  const trackClick = useCallback((productId: string, categoryId?: string) => {
    return track({
      productId,
      categoryId,
      action: 'click',
      metadata: { timestamp: new Date().toISOString() },
    });
  }, [track]);

  const trackAddToCart = useCallback((productId: string, quantity: number = 1, categoryId?: string) => {
    return track({
      productId,
      categoryId,
      action: 'add_to_cart',
      metadata: { quantity, timestamp: new Date().toISOString() },
    });
  }, [track]);

  const trackPurchase = useCallback((productId: string, orderId: string, amount: number, categoryId?: string) => {
    return track({
      productId,
      categoryId,
      action: 'purchase',
      metadata: { orderId, amount, timestamp: new Date().toISOString() },
    });
  }, [track]);

  const trackSearch = useCallback((query: string, results: number = 0) => {
    return track({
      productId: 'search',
      action: 'search',
      metadata: { query, results, timestamp: new Date().toISOString() },
    });
  }, [track]);

  // Merge anonymous data when user logs in
  const mergeAnonymousData = useCallback(async (userId: string) => {
    if (!sessionId || userId === 'anonymous') return;

    try {
      await trackingService.mergeTracking(sessionId, userId);
      // Update session storage to indicate data has been merged
      sessionStorage.setItem('tracking_merged', 'true');
    } catch (error) {
      console.error('Merge tracking error:', error);
    }
  }, [sessionId]);

  // Auto-track page views
  useEffect(() => {
    if (options.autoTrack && sessionId) {
      const handlePageView = () => {
        const path = window.location.pathname;
        const productIdMatch = path.match(/\/product\/([^\/]+)/);
        
        if (productIdMatch) {
          trackView(productIdMatch[1]);
        }
      };

      // Track initial page view
      handlePageView();

      // Track page changes (for SPA)
      window.addEventListener('popstate', handlePageView);
      
      return () => {
        window.removeEventListener('popstate', handlePageView);
      };
    }
  }, [options.autoTrack, sessionId, trackView]);

  // Auto-track before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Track session duration
      if (sessionId) {
        const sessionStart = sessionStorage.getItem('session_start');
        if (sessionStart) {
          const duration = Date.now() - parseInt(sessionStart);
          track({
            productId: 'search',
            action: 'search',
            metadata: { 
              sessionDuration: duration,
              timestamp: new Date().toISOString(),
            },
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Set session start time
    if (!sessionStorage.getItem('session_start')) {
      sessionStorage.setItem('session_start', Date.now().toString());
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId, track]);

  return {
    sessionId,
    isTracking,
    track,
    trackView,
    trackClick,
    trackAddToCart,
    trackPurchase,
    trackSearch,
    mergeAnonymousData,
  };
};
