'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';
import api from '@/services/api';
import authService from '@/services/auth.service';
import orderService from '@/services/order.service';
import { cartService } from '@/services/cart.service';

interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems: cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!authService.getCurrentUser().isAuthenticated) {
      router.replace('/login?returnUrl=/checkout');
      return;
    }
    setAuthChecked(true);
  }, [router]);

  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  type PaymentMethod = 'card' | 'cod';
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  const totalPrice = cart.reduce((sum, item) => {
    const price = typeof item?.price === 'number' ? item.price : 0;
    const quantity = typeof item?.quantity === 'number' ? item.quantity : 1;
    return sum + price * quantity;
  }, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (
        !formData.name ||
        !formData.email ||
        !formData.phone ||
        !formData.address ||
        !formData.city
      ) {
        setError('Vui lòng điền đầy đủ thông tin');
        setLoading(false);
        return;
      }

      if (paymentMethod === 'cod') {
        await orderService.create({
          items: cart.map((item) => ({
            id: item.productId || item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || '',
            size: item.size,
            color: item.color,
          })),
          customerInfo: formData,
          totalAmount: totalPrice,
          status: 'pending',
        });
        await cartService.clearCart();
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart:update'));
        router.push('/orders?cod=1');
        return;
      }

      const checkoutResponse = await api.post('/payment/create-checkout-session', {
        currency: 'vnd',
        items: cart.map((item) => ({
          id: item._id,
          productId: item.productId || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          color: item.color,
        })),
        customerInfo: formData,
      });

      if (checkoutResponse.data.url) {
        window.location.href = checkoutResponse.data.url;
      } else {
        setError('Không thể khởi tạo phiên thanh toán');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Lỗi khi xử lý thanh toán'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
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

  if (cart.length === 0) {
    return (
      <main>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
          <button
            onClick={() => router.push('/product')}
            className="bg-red-500 text-white px-6 py-2 rounded-lg"
          >
            Tiếp tục mua sắm
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Thanh Toán</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6">Thông Tin Giao Hàng</h2>

              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Họ Tên</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Số Điện Thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Địa Chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Thành Phố</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Mã Bưu Điện</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Hình thức thanh toán</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="text-red-500"
                      />
                      <span>Thanh toán bằng thẻ (Stripe)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-red-500"
                      />
                      <span>Thanh toán khi nhận hàng (COD)</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
                >
                  {loading
                    ? 'Đang xử lý...'
                    : paymentMethod === 'cod'
                      ? `Đặt hàng (thanh toán khi nhận) ${totalPrice.toLocaleString('vi-VN')}đ`
                      : `Thanh Toán ${totalPrice.toLocaleString('vi-VN')}đ`}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6">Tóm Tắt Đơn Hàng</h2>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Vận chuyển:</span>
                  <span>Miễn phí</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-red-600 border-t pt-2">
                  <span>Tổng cộng:</span>
                  <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/cart')}
                className="w-full mt-6 border border-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-50"
              >
                Quay Lại Giỏ Hàng
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
