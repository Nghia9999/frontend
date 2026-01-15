"use client";

import React, { useState, useMemo } from "react";
import ProductCard, { Product } from "@/components/ProductCard";

type Props = {
  products: Product[];
  sort: string;
  onSortChange: (s: string) => void;
};

const ITEMS_PER_PAGE = 12;

export default function ProductList({ products, sort, onSortChange }: Props) {
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    switch (sort) {
      case "price-asc":
        return [...products].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...products].sort((a, b) => b.price - a.price);
      case "rating":
        return [...products].sort((a, b) => b.rating - a.rating);
      default:
        return products;
    }
  }, [products, sort]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginatedProducts = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset to page 1 when products change
  React.useEffect(() => {
    setPage(1);
  }, [products]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">{products.length} sản phẩm</div>

        <div className="flex items-center gap-2">
          <label className="text-sm">Sắp xếp:</label>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="default">Mặc định</option>
            <option value="price-asc">Giá: thấp → cao</option>
            <option value="price-desc">Giá: cao → thấp</option>
            <option value="rating">Đánh giá</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paginatedProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Trước
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1
                  ? "bg-red-500 text-white"
                  : "border hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
