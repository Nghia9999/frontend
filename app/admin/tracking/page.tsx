"use client";

import React, { useEffect, useState } from "react";
import trackingService, { TrackingDto } from "@/services/tracking.service";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function TrackingDashboardPage() {
  const [trackingData, setTrackingData] = useState<TrackingDto[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchTrackingData();
  }, [timeRange]);

  const fetchTrackingData = async () => {
    setLoading(true);
    try {
      // Fetch tracking data
      const tracking = await trackingService.getUserTracking('all', 1000);
      setTrackingData(tracking);

      // Fetch popular products
      const popular = await trackingService.getPopularProducts(10);
      setPopularProducts(popular);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const getActionStats = () => {
    const stats = trackingData.reduce((acc, item) => {
      acc[item.action] = (acc[item.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([action, count]) => ({
      action: action === 'view' ? 'Xem' : 
             action === 'click' ? 'Click' : 
             action === 'add_to_cart' ? 'Thêm giỏ hàng' : 
             action === 'purchase' ? 'Mua' : 'Tìm kiếm',
      count
    }));
  };

  const getHourlyStats = () => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      views: 0,
      clicks: 0,
      purchases: 0
    }));

    trackingData.forEach(item => {
      const hour = new Date(item.timestamp).getHours();
      if (hour >= 0 && hour < 24) {
        if (item.action === 'view') hourlyData[hour].views++;
        if (item.action === 'click') hourlyData[hour].clicks++;
        if (item.action === 'purchase') hourlyData[hour].purchases++;
      }
    });

    return hourlyData;
  };

  const getDailyStats = () => {
    const dailyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - date.getDay() + i);
      return {
        date: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
        views: 0,
        purchases: 0
      };
    });

    trackingData.forEach(item => {
      const dayIndex = (7 - new Date(item.timestamp).getDay()) % 7;
      if (dayIndex >= 0 && dayIndex < 7) {
        if (item.action === 'view') dailyData[dayIndex].views++;
        if (item.action === 'purchase') dailyData[dayIndex].purchases++;
      }
    });

    return dailyData;
  };

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  if (loading) {
    return (
      <main>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu tracking...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Tracking</h1>
          <p className="text-gray-600">Phân tích hành vi người dùng và gợi ý sản phẩm</p>
        </div>

        {/* Time Range Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setTimeRange('day')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'day' ? 'bg-red-500 text-white' : 'bg-gray-200'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'week' ? 'bg-red-500 text-white' : 'bg-gray-200'
              }`}
            >
              7 ngày
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'month' ? 'bg-red-500 text-white' : 'bg-gray-200'
              }`}
            >
              30 ngày
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Action Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Thống kê hành động</h2>
            <PieChart width={400} height={300}>
              <Pie
                data={getActionStats()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ action, percent }) => `${action} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {getActionStats().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
            <Tooltip />
          </PieChart>
          </div>

          {/* Hourly Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Hoạt động theo giờ</h2>
            <LineChart width={400} height={300} data={getHourlyStats()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#ef4444" name="Xem" />
              <Line type="monotone" dataKey="clicks" stroke="#f59e0b" name="Click" />
              <Line type="monotone" dataKey="purchases" stroke="#10b981" name="Mua" />
            </LineChart>
          </div>
        </div>

        {/* Daily Trends */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Xu hướng theo ngày</h2>
          <BarChart width={800} height={300} data={getDailyStats()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="views" fill="#ef4444" name="Lượt xem" />
            <Bar dataKey="purchases" fill="#10b981" name="Lượt mua" />
          </BarChart>
        </div>

        {/* Popular Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sản phẩm phổ biến</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularProducts.map((product, index) => (
              <div key={product._id || product.id} className="border rounded-lg p-4">
                <img
                  src={product.images?.[0] || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <h3 className="font-medium mb-1">{product.name}</h3>
                <p className="text-red-500 font-semibold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(product.price || 0)}
                </p>
                <p className="text-sm text-gray-500">
                  {product.viewCount || 0} lượt xem
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
