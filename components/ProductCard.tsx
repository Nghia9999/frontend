"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import AddToCartModal from "@/components/AddToCartModal";

export type Product = {
  id: number | string;
  name: string;
  price: number;
  rating: number;
  image: string;
  slug?: string;
};

type Props = {
  product: Product;
  showAddToCart?: boolean;
};

export default function ProductCard({ product, showAddToCart = true }: Props) {
  const [openModal, setOpenModal] = useState(false);

  const ratingValue = typeof product.rating === 'number' ? product.rating : 4.5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenModal(true);
  };

  return (
    <>
      <AddToCartModal
        open={openModal}
        productId={String(product.id)}
        onClose={() => setOpenModal(false)}
        onAdded={() => alert(`Đã thêm ${product.name} vào giỏ hàng!`)}
      />

      <div className="group bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden">
      {/* IMAGE */}
      <div className="relative">
        <Link href={`/product/${product.slug ?? product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="h-48 w-full object-cover"
          />
        </Link>

        {showAddToCart && (
          <button
            onClick={handleAddToCart}
            className="absolute inset-0 flex items-center justify-center
            bg-black/50 opacity-0 group-hover:opacity-100 transition"
          >
            <span className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl">
              <ShoppingCart size={18} />
              Thêm vào giỏ
            </span>
          </button>
        )}
      </div>

      {/* INFO */}
      <div className="p-4">
        <Link href={`/product/${product.slug ?? product.id}`}>
          <h3 className="font-semibold text-sm line-clamp-1 hover:text-red-500 transition cursor-pointer">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-2">
          <span className="text-red-500 font-bold">
            {product.price.toLocaleString("vi-VN")}đ
          </span>

          <span className="flex items-center text-sm text-yellow-500">
            <Star size={16} className="fill-yellow-400 mr-1" />
            {Number.isFinite(ratingValue) ? ratingValue.toFixed(1) : '0.0'}
          </span>
        </div>
      </div>
      </div>
    </>
  );
}
