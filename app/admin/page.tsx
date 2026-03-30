"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import orderService, { OrderDto } from "@/services/order.service";
import productService from "@/services/product.service";
import userService from "@/services/user.service";

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  newOrders: number;
};

type RevenueData = {
  month: string;
  revenue: number;
};

type OrderStatusData = {
  name: string;
  value: number;
};

type DateFilter = 'day' | 'week' | 'month' | 'year';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    newOrders: 0,
  });
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [allOrders, setAllOrders] = useState<OrderDto[]>([]);

  // Calculate date range based on filter
  const getDateRange = useCallback((filter: DateFilter) => {
    const now = new Date();
    const start = new Date(now);

    switch (filter) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
    }

    return { start, end: now };
  }, []);

  // Filter orders based on date range
  const filterOrdersByDate = useCallback((orders: OrderDto[], filter: DateFilter) => {
    const { start, end } = getDateRange(filter);
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt || new Date());
      return orderDate >= start && orderDate <= end;
    });
  }, [getDateRange]);

  // Update filtered orders when filter changes
  useEffect(() => {
    const filtered = filterOrdersByDate(allOrders, dateFilter);
    setOrders(filtered);

    // Update stats based on filtered orders
    const totalRevenue = filtered.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const newOrders = filtered.filter(order => {
      const orderDate = new Date(order.createdAt || new Date());
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;

    setStats(prev => ({
      ...prev,
      totalOrders: filtered.length,
      totalRevenue,
      newOrders,
    }));
  }, [allOrders, dateFilter, filterOrdersByDate]);

  const loadData = useCallback(async () => {
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        orderService.getAllAdmin(),
        productService.getAll(),
        userService.getAllUsers(),
      ]);

      const allOrders = ordersRes || [];
      const products = productsRes || [];
      const users = usersRes || [];

      setAllOrders(allOrders);
      // setLastOrderCount(allOrders.length);

      // Set initial stats (will be updated by useEffect based on filter)
      setStats({
        totalOrders: 0, // Will be set by filter effect
        totalRevenue: 0,
        totalProducts: products.length,
        totalUsers: users.length,
        newOrders: 0,
      });
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkNewOrders = useCallback(async () => {
    try {
      const ordersRes = await orderService.getAllAdmin();
      const currentOrders = ordersRes || [];
      if (currentOrders.length > allOrders.length) {
        setAllOrders(currentOrders);
        // You could add a notification sound or toast here
        console.log("New orders received!");
      }
    } catch (error) {
      console.error("Error checking new orders:", error);
    }
  }, [allOrders.length]);

  useEffect(() => {
    loadData();
    // Polling for new orders every 30 seconds
    const interval = setInterval(checkNewOrders, 30000);
    return () => clearInterval(interval);
  }, [loadData, checkNewOrders]);

  const revenueData: RevenueData[] = useMemo(() => {
    const monthlyRevenue: Record<string, number> = {};

    orders.forEach(order => {
      const date = new Date(order.createdAt || new Date());
      let key: string;

      switch (dateFilter) {
        case 'day':
          key = `${date.getHours().toString().padStart(2, '0')}:00`;
          break;
        case 'week':
          const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          key = dayNames[date.getDay()];
          break;
        case 'month':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `Tuần ${Math.ceil((date.getDate() - date.getDay() + 1) / 7)}`;
          break;
        case 'year':
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + (order.totalAmount || 0);
    });

    return Object.entries(monthlyRevenue)
      .sort(([a], [b]) => {
        if (dateFilter === 'day') {
          return a.localeCompare(b);
        } else if (dateFilter === 'week') {
          const dayOrder = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          return dayOrder.indexOf(a) - dayOrder.indexOf(b);
        } else if (dateFilter === 'month') {
          return a.localeCompare(b);
        } else {
          return a.localeCompare(b);
        }
      })
      .map(([period, revenue]) => ({
        month: dateFilter === 'year' ? new Date(period + '-01').toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }) : period,
        revenue: Math.round(revenue / 1000), // Convert to thousands
      }));
  }, [orders, dateFilter]);

  const orderStatusData: OrderStatusData[] = useMemo(() => {
    const statusCount: Record<string, number> = {};
    orders.forEach(order => {
      const status = order.status || 'pending';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [orders]);

  const currentDateRange = useMemo(() => {
    const { start, end } = getDateRange(dateFilter);
    const formatDate = (date: Date) => date.toLocaleDateString('vi-VN');
    return `${formatDate(start)} - ${formatDate(end)}`;
  }, [dateFilter, getDateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* DATE FILTER */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Lọc theo thời gian</h3>
            <p className="text-sm text-gray-500 mt-1">
              Khoảng thời gian: {currentDateRange}
            </p>
          </div>
          <div className="flex gap-2">
            {[
              { key: 'day', label: 'Hôm nay' },
              { key: 'week', label: 'Tuần này' },
              { key: 'month', label: 'Tháng này' },
              { key: 'year', label: 'Năm nay' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDateFilter(key as DateFilter)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateFilter === key
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* NOTIFICATION */}
      {stats.newOrders > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">
                Có {stats.newOrders} đơn hàng mới trong 7 ngày qua!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Tổng đơn hàng" value={stats.totalOrders.toString()} />
        <StatCard title="Tổng doanh thu" value={`${stats.totalRevenue.toLocaleString()}đ`} />
        <StatCard title="Tổng sản phẩm" value={stats.totalProducts.toString()} />
        <StatCard title="Tổng người dùng" value={stats.totalUsers.toString()} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REVENUE CHART */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Doanh thu theo {dateFilter === 'day' ? 'giờ' : dateFilter === 'week' ? 'ngày' : dateFilter === 'month' ? 'tuần' : 'tháng'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}k đ`, 'Doanh thu']} />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ORDER STATUS CHART */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Trạng thái đơn hàng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          Đơn hàng {dateFilter === 'day' ? 'hôm nay' : dateFilter === 'week' ? 'tuần này' : dateFilter === 'month' ? 'tháng này' : 'năm nay'}
        </h3>
        <div className="space-y-3">
          {orders.slice(0, 5).map((order) => (
            <div key={order._id || order.id} className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="font-medium">{order.customerInfo?.name}</p>
                <p className="text-sm text-gray-500">
                  {order.items?.length || 0} sản phẩm • {order.totalAmount?.toLocaleString()}đ
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'shipped' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status || 'pending'}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}
                </p>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-gray-500 text-center py-4">Không có đơn hàng nào trong khoảng thời gian này</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
