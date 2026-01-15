"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import productService from "@/services/product.service";
import categoryService from "@/services/category.service";

const PRODUCTS_PER_PAGE = 4;
const PRODUCTS_PER_SLIDE = 8;

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Áo thun basic",
    price: 199000,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  },
  {
    id: 2,
    name: "Áo khoác thời trang",
    price: 499000,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
  },
  {
    id: 3,
    name: "Áo sơ mi",
    price: 299000,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1520975916090-3105956dac38",
  },
  {
    id: 4,
    name: "Quần jeans",
    price: 399000,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d",
  },
  {
    id: 5,
    name: "Váy nữ thời trang",
    price: 359000,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1495121605193-b116b5b09a4d",
  },
  {
    id: 6,
    name: "Áo nữ oversize",
    price: 229000,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
  },
  {
    id: 7,
    name: "Áo trẻ em",
    price: 149000,
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1542060748-10c28b62716b",
  },
  {
    id: 8,
    name: "Váy trẻ em",
    price: 189000,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1604917621956-10dfa7cce2e9",
  },
];

type Props = {
  title?: string;
  categorySlug: string;
};

const isObjectIdLike = (value: string) => /^[a-fA-F0-9]{24}$/.test(value);

const normalize = (s: string) =>
  (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export default function CategorySlider({
  title = "Sản phẩm nổi bật",
  categorySlug,
}: Props) {
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedCategoryId, setResolvedCategoryId] = useState<string>("");

  useEffect(() => {
    setPage(0);
    setLoading(true);

    if (!categorySlug) {
      setProducts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        let categoryId = categorySlug;

        if (!isObjectIdLike(categorySlug)) {
          const cats = await categoryService.getAll();
          const key = normalize(categorySlug).replace(/[-_]+/g, ' ');
          const match = (cats || []).find((c: any) => {
            const slug = normalize(c?.slug || '');
            if (slug && slug === normalize(categorySlug)) return true;
            const name = normalize(c?.name || '').replace(/[-_]+/g, ' ');
            return name.includes(key);
          });
          categoryId = match?._id || match?.id || '';
        }

        if (!cancelled) setResolvedCategoryId(categoryId);

        const res = await productService.getAll({
          limit: PRODUCTS_PER_SLIDE,
          category: categoryId || undefined,
        });
        if (!cancelled) setProducts(res || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setProducts(MOCK_PRODUCTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

  return (
    <section className="container mx-auto mt-16 px-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold bg-red-500 text-white py-3 px-5 rounded-lg">
          {title}
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="p-2 rounded-full border border-red-500 text-red-500
              hover:bg-red-500 hover:text-white disabled:opacity-40"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
            className="p-2 rounded-full border border-red-500 text-red-500
              hover:bg-red-500 hover:text-white disabled:opacity-40"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* SLIDER */}
      <div className="overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải...</div>
        ) : (
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 min-w-full"
              >
                {products
                  .slice(
                    i * PRODUCTS_PER_PAGE,
                    i * PRODUCTS_PER_PAGE + PRODUCTS_PER_PAGE
                  )
                  .map((product: any) => (
                    <ProductCard
                      key={product._id || product.id}
                      product={{
                        id: product._id || product.id,
                        name: product.name,
                        price: product.price,
                        rating: typeof product.averageRating === 'number' ? product.averageRating : (product.rating || 0),
                        image:
                          product.images?.[0] ||
                          "https://via.placeholder.com/300",
                      }}
                    />
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIEW ALL */}
      <div className="flex justify-center mt-8">
        <Link
          href={`/product?category=${resolvedCategoryId || categorySlug}`}
          className="px-8 py-3 rounded-full border-2 border-red-500 text-red-500
          hover:bg-red-500 hover:text-white transition font-semibold"
        >
          Xem tất cả
        </Link>
      </div>
    </section>
  );
}
