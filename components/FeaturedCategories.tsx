"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import categoryService from "@/services/category.service";

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const cats = await categoryService.getAll();
        setCategories(cats || []);
      } catch (err) {
        console.error("Error loading categories", err);
      }
    })();
  }, []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto mt-16 px-4">
      <h2 className="text-3xl font-bold mb-8 text-center">Khám phá danh mục</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.slice(0, 3).map((cat: any) => {
          const id = cat._id || cat.id;
          // compute slug for anchor (use existing slug if available)
          const slug =
            cat.slug ||
            (cat.name || "").toString().toLowerCase().replace(/\s+/g, "-");
          // using unsplash random images as placeholders
          const imageUrl = `https://source.unsplash.com/400x300/?fashion,${encodeURIComponent(
            cat.name || ""
          )}`;

          return (
            <Link
              key={id}
              href={`/#category-${slug}`}
              scroll={true}
              className="relative block h-40 rounded-lg overflow-hidden group"
            >
              <img
                src={imageUrl}
                alt={cat.name}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <span className="text-white text-xl font-semibold">
                  {cat.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
