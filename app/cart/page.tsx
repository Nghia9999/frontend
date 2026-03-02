"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useCart } from "@/hooks/useCart";

 const toNumber = (value: unknown, fallback = 0) => {
   const n = typeof value === "number" ? value : Number(value);
   return Number.isFinite(n) ? n : fallback;
 };

 const formatVnd = (value: unknown) => {
   const n = toNumber(value, 0);
   return n.toLocaleString("vi-VN");
 };

export default function CartPage() {
  const { cartItems: cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();


  const totalPrice = cart.reduce((sum, item) => {
    const price = toNumber(item?.price, 0);
    const quantity = toNumber(item?.quantity, 0);
    return sum + price * quantity;
  }, 0);

  // 🔄 Loading
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

  // ✅ NORMAL RENDER
  return (
    <main>
      <Header />

      <div className="min-h-screen max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Giỏ hàng</h1>
          <Link
            href="/product"
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Tiếp tục mua sắm
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <div className="text-lg font-semibold">Giỏ hàng trống</div>
            <div className="text-gray-500 mt-2">
              Hãy thêm sản phẩm để bắt đầu mua sắm.
            </div>
            <Link
              href="/"
              className="inline-flex mt-6 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const price = toNumber(item?.price, 0);
                const quantity = toNumber(item?.quantity, 1);
                const lineTotal = price * quantity;

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl shadow p-4 md:p-5"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {typeof item?.image === "string" && item.image.trim() ? (
                          <Image
                            src={item.image}
                            alt={item?.name || "product"}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-base line-clamp-2">
                              {item?.name || "Sản phẩm"}
                            </div>
                            {(item?.size || item?.color) && (
                              <div className="text-sm text-gray-500 mt-1">
                                {item?.size ? `Size: ${item.size}` : ""}
                                {item?.size && item?.color ? " | " : ""}
                                {item?.color ? `Màu: ${item.color}` : ""}
                              </div>
                            )}
                            <div className="text-red-500 font-bold mt-2">
                              {formatVnd(price)}đ
                            </div>
                          </div>

                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="p-2 rounded-xl hover:bg-red-50 text-red-600"
                            aria-label="Remove"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-3 mt-4">
                          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 p-1">
                            <button
                              onClick={() => handleUpdateQuantity(item._id, -1)}
                              className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                              aria-label="Decrease"
                            >
                              <Minus size={16} />
                            </button>
                            <div className="w-10 text-center font-semibold">
                              {quantity}
                            </div>
                            <button
                              onClick={() => handleUpdateQuantity(item._id, 1)}
                              className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                              aria-label="Increase"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-gray-500">Tạm tính</div>
                            <div className="font-bold">{formatVnd(lineTotal)}đ</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow p-5">
                <div className="text-lg font-semibold">Tóm tắt</div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">{formatVnd(totalPrice)}đ</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Vận chuyển</span>
                    <span className="font-medium">Miễn phí</span>
                  </div>
                  <div className="border-t pt-3 flex items-center justify-between">
                    <span className="font-semibold">Tổng cộng</span>
                    <span className="font-bold text-red-600 text-base">
                      {formatVnd(totalPrice)}đ
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-5 w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600"
                  onClick={() => alert("Chưa tích hợp trang thanh toán")}
                >
                  Thanh toán
                </button>

                <button
                  type="button"
                  className="mt-3 w-full border border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50"
                  onClick={async () => {
                    if (window.confirm("Bạn chắc chắn muốn xóa giỏ hàng?")) {
                      await clearCart();
                    }
                  }}
                >
                  Xóa giỏ hàng
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow p-5 text-sm text-gray-600">
                Thanh toán thành công sẽ tự động xóa giỏ hàng.
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
