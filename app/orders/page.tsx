"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import authService from "@/services/auth.service";
import orderService from "@/services/order.service";
import api from "@/services/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    size?: string;
    color?: string;
  }>;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
}

function OrdersContent({ codSuccess }: { codSuccess: boolean }) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kiểm tra authentication
  useEffect(() => {
    if (!authService.getCurrentUser().isAuthenticated) {
      router.push('/login');
      return;
    }
    
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAll();
      setOrders(data);
    } catch (err) {
      setError('Không thể tải danh sách đơn hàng');
      console.error('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      await orderService.cancel(orderId);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: 'cancelled' as const } : o
        )
      );
    } catch (err) {
      console.error('Cancel order error:', err);
      alert('Không thể hủy đơn hàng');
    }
  };

  const handlePayOrder = async (orderId: string) => {
    try {
      const { data } = await api.post('/payment/create-checkout-session', {
        orderId,
        currency: 'vnd',
      });
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert('Không thể chuyển đến trang thanh toán');
      }
    } catch (err: any) {
      console.error('Pay order error:', err);
      alert(err.response?.data?.message || 'Không thể tạo phiên thanh toán');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ thanh toán';
      case 'paid': return 'Đã thanh toán';
      case 'failed': return 'Thanh toán thất bại';
      default: return status;
    }
  };

  if (loading) {
    return (
      <main>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Đơn hàng của bạn</h1>

        {codSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
            Đặt hàng thành công. Bạn sẽ thanh toán khi nhận hàng.
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Chưa có đơn hàng nào</h2>
            <p className="text-gray-600 mb-8">Hãy mua sắm để có đơn hàng đầu tiên nhé!</p>
            <Link 
              href="/"
              className="inline-block bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
            >
              Bắt đầu mua sắm
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Đơn hàng #{order.orderNumber}</h3>
                    <p className="text-gray-600 text-sm">
                      Đặt ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <div className="text-sm text-gray-600">
                      {getPaymentStatusText(order.paymentStatus)}
                    </div>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {order.items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="text-sm text-gray-600">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span className="ml-2">Color: {item.color}</span>}
                        </div>
                        <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">
                          {new Intl.NumberFormat('vi-VN').format(item.price)}đ
                        </p>
                        <p className="text-sm text-gray-600">
                          x{item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium mb-2">Thông tin giao hàng</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Người nhận:</strong> {order.customerInfo.name}</p>
                      <p><strong>Email:</strong> {order.customerInfo.email}</p>
                      <p><strong>Điện thoại:</strong> {order.customerInfo.phone}</p>
                      <p><strong>Địa chỉ:</strong> {order.customerInfo.address}</p>
                      <p><strong>Thành phố:</strong> {order.customerInfo.city}</p>
                      {order.customerInfo.postalCode && (
                        <p><strong>Mã bưu chính:</strong> {order.customerInfo.postalCode}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Tổng tiền</h4>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-500">
                        {new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Order Actions */}
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Cập nhật lần cuối: {new Date(order.updatedAt).toLocaleDateString('vi-VN')}
                  </p>
                  
                  <div className="space-x-2 flex flex-wrap gap-2">
                    {order.status === 'pending' && order.paymentStatus === 'pending' && (
                      <button
                        onClick={() => handlePayOrder(order._id)}
                        className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Thanh toán
                      </button>
                    )}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        Hủy đơn hàng
                      </button>
                    )}
                    
                    <Link
                      href={`/orders/${order._id}`}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  );
}

function OrdersWrapper() {
  const searchParams = useSearchParams();
  const codSuccess = searchParams.get("cod") === "1";
  
  return <OrdersContent codSuccess={codSuccess} />;
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersWrapper />
    </Suspense>
  );
}
