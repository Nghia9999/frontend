"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import authService from "@/services/auth.service";
import orderService from "@/services/order.service";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.getCurrentUser().isAuthenticated) {
      router.replace("/login?returnUrl=/orders");
      return;
    }
    if (!id) return;
    orderService
      .getOne(id)
      .then(setOrder)
      .catch(() => setError("Không tìm thấy đơn hàng"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Chờ xử lý";
      case "processing": return "Đang xử lý";
      case "shipped": return "Đang giao hàng";
      case "delivered": return "Đã giao hàng";
      case "cancelled": return "Đã hủy";
      default: return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Chờ thanh toán";
      case "paid": return "Đã thanh toán";
      case "failed": return "Thanh toán thất bại";
      default: return status;
    }
  };

  if (loading) {
    return (
      <main>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <p className="text-red-600 mb-4">{error || "Đơn hàng không tồn tại"}</p>
          <Link href="/orders" className="text-red-500 font-medium hover:underline">
            ← Quay lại đơn hàng
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const info = order.customerInfo || {};

  return (
    <main>
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/orders" className="text-red-500 text-sm font-medium hover:underline">
            ← Đơn hàng của bạn
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-6">Đơn hàng #{order.orderNumber}</h1>

        <div className="flex gap-4 mb-6 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
          <span className="text-gray-600 text-sm">{getPaymentStatusText(order.paymentStatus)}</span>
          <span className="text-gray-500 text-sm">
            Đặt ngày: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="font-semibold mb-3">Sản phẩm</h2>
            <ul className="space-y-3">
              {(order.items || []).map((item: any, index: number) => (
                <li key={`${item.id}-${index}`} className="flex gap-4 py-2 border-b last:border-0">
                  {item.image && (
                    <img src={item.image} alt="" className="w-14 h-14 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {new Intl.NumberFormat("vi-VN").format(item.price)}đ
                    </p>
                  </div>
                  <p className="font-medium">
                    {new Intl.NumberFormat("vi-VN").format((item.price || 0) * (item.quantity || 0))}đ
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Giao đến</h2>
            <p className="text-gray-600 text-sm">
              {info.name}, {info.phone}
              <br />
              {info.address}, {info.city}
              {info.postalCode ? ` - ${info.postalCode}` : ""}
            </p>
          </div>

          <div className="border-t pt-4 flex justify-between items-center">
            <span className="font-semibold">Tổng cộng</span>
            <span className="text-xl font-bold text-red-600">
              {new Intl.NumberFormat("vi-VN").format(order.totalAmount || 0)}đ
            </span>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
