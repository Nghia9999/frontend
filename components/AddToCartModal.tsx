"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Minus, Plus } from "lucide-react";
import Image from "next/image";
import productService from "@/services/product.service";
import { cartService } from "@/services/cart.service";

type ProductDetail = {
  _id?: string;
  id?: string;
  name?: string;
  price?: number;
  images?: string[];
  sizes?: string[];
  colors?: string[];
};

type Props = {
  open: boolean;
  productId: string;
  onClose: () => void;
  onAdded?: () => void;
};

export default function AddToCartModal({ open, productId, onClose, onAdded }: Props) {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getOne(productId);
        if (cancelled) return;
        setProduct(data);

        const sizes = Array.isArray(data?.sizes) ? data.sizes : [];
        const colors = Array.isArray(data?.colors) ? data.colors : [];
        setSelectedSize(sizes.length === 1 ? sizes[0] : "");
        setSelectedColor(colors.length === 1 ? colors[0] : "");
        setQuantity(1);
      } catch (e) {
        if (!cancelled) setError("Không thể tải sản phẩm");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, productId]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const imageUrl = useMemo(() => {
    const img = product?.images?.[0];
    return typeof img === "string" && img.trim() ? img : "";
  }, [product]);

  if (!open || !mounted) return null;

  const sizes = Array.isArray(product?.sizes) ? product!.sizes! : [];
  const colors = Array.isArray(product?.colors) ? product!.colors! : [];

  const canSubmit =
    !loading &&
    !!product &&
    !submitting &&
    quantity >= 1 &&
    (sizes.length === 0 || !!selectedSize) &&
    (colors.length === 0 || !!selectedColor);

  const handleAdd = async () => {
    if (!product) return;

    if (sizes.length > 0 && !selectedSize) {
      setError("Vui lòng chọn size");
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      setError("Vui lòng chọn màu");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await cartService.addToCart({
        productId,
        name: product.name || "",
        price: Number(product.price || 0),
        image: imageUrl,
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      });
      onAdded?.();
      onClose();
    } catch (e) {
      setError("Có lỗi xảy ra khi thêm vào giỏ hàng");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[85vh] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="text-lg font-semibold">Thêm vào giỏ hàng</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>

          <div className="p-5 overflow-y-auto max-h-[calc(85vh-64px-72px)]">
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500" />
              </div>
            ) : error ? (
              <div className="text-red-600 text-sm">{error}</div>
            ) : product ? (
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name || "product"}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold leading-snug">{product.name}</div>
                    <div className="mt-1 text-red-500 font-bold">
                      {Number(product.price || 0).toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                </div>

                {sizes.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Chọn size</div>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`px-3 py-2 rounded-lg border text-sm transition ${
                            selectedSize === s
                              ? "border-red-500 bg-red-50 text-red-600"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {colors.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Chọn màu</div>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-2 rounded-lg border text-sm transition ${
                            selectedColor === c
                              ? "border-red-500 bg-red-50 text-red-600"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium mb-2">Số lượng</div>
                  <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="w-10 text-center font-semibold">{quantity}</div>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="px-5 py-4 border-t flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleAdd}
              disabled={!canSubmit}
              className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Đang thêm..." : "Thêm vào giỏ"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
