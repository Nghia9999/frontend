"use client";

import React from "react";
import ProductRecommendations from "@/components/ProductRecommendations";
import authService from "@/services/auth.service";

export default function RecommendSection() {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'collaborative' | 'content_based' | 'popular' | 'recent'>('popular');

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await authService.me();
        setUserId(user.id);
        setActiveTab('collaborative'); // Default to collaborative for logged in users
      } catch {
        // User not logged in, show popular products
        setUserId(null);
        setActiveTab('popular');
      }
    };
    checkUser();
  }, []);

  const tabs = [
    { key: 'popular', label: 'Phổ biến', requiresUser: false },
    { key: 'collaborative', label: 'Cho bạn', requiresUser: true },
    { key: 'content_based', label: 'Tương tự', requiresUser: true },
    { key: 'recent', label: 'Đã xem', requiresUser: true },
  ].filter(tab => !tab.requiresUser || userId);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Khám phá sản phẩm
        </h2>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-white text-red-500 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'collaborative' && userId && (
            <ProductRecommendations
              userId={userId}
              type="collaborative"
              limit={12}
              title=""
            />
          )}

          {activeTab === 'content_based' && userId && (
            <ProductRecommendations
              userId={userId}
              type="content_based"
              limit={12}
              title=""
            />
          )}

          {activeTab === 'popular' && (
            <ProductRecommendations
              type="popular"
              limit={12}
              title=""
            />
          )}

          {activeTab === 'recent' && userId && (
            <ProductRecommendations
              userId={userId}
              type="recent"
              limit={12}
              title=""
            />
          )}
        </div>
      </div>
    </section>
  );
}