"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import api from "@/services/api";
import { cartService } from "@/services/cart.service";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    let cancelled = false;

    const run = async () => {
      try {
        // Clear server cart after redirect (webhook also clears; this is best-effort).
        await cartService.clearCart();
        window.dispatchEvent(new Event('cart:update'));

        if (sessionId) {
          // Fallback for local dev: confirm session on backend (webhook may not be running)
          try {
            await api.post('/payment/confirm-checkout-session', { sessionId });
          } catch (e) {
            // ignore: webhook may have already processed, or session is not paid yet
          }

          const { data } = await api.get(`/payment/checkout-session/${sessionId}`);
          if (!cancelled) setOrderInfo(data);
        }
      } catch (e) {
        // ignore: still show success UI
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (loading) {
    return (
      <main>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang xác nhận đơn hàng...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />
      
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thanh toán thành công!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.
          </p>

          {orderInfo?.orderNumber && (
            <div className="mb-8 p-4 bg-white border rounded-lg">
              <div className="text-sm text-gray-600">Mã đơn hàng</div>
              <div className="text-xl font-bold">{orderInfo.orderNumber}</div>
              {orderInfo?.paymentStatus && (
                <div className="text-sm text-gray-600 mt-1">
                  Trạng thái thanh toán: <span className="font-medium">{orderInfo.paymentStatus}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
            >
              Tiếp tục mua sắm
            </button>
            
            <button
              onClick={() => window.location.href = '/admin/order'}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Xem đơn hàng (Admin)
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
}
