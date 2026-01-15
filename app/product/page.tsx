"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductFilters, { Category } from "@/components/ProductFilters";
import ProductList from "@/components/ProductList";
import { Product } from "@/components/ProductCard";
import categoryService from "@/services/category.service";
import productService from "@/services/product.service";

export default function ProductPage() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<string>("default");

  // Handle URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Load categories
  useEffect(() => {
    (async () => {
      try {
        const res = await categoryService.getAll();
        const flat = (res || []).map((c: any) => ({
          id: c._id || c.id,
          name: c.name,
          slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
          parent: c.parent ?? null,
        }));
        const tree = buildCategoryTree(flat);
        setCategories(tree);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Load products
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await productService.getAll({ limit: 100 });
        const normalized = (res || []).map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          price: p.price,
          rating: p.rating || 4.5,
          image: p.images?.[0] || "https://via.placeholder.com/400",
          slug: p.slug || `${p._id}`,
          // Store category for filtering
          category: p.category,
        }));
        setAllProducts(normalized);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter products based on selected category
  const filtered = useMemo(() => {
    if (!selectedCategory) return allProducts;
    
    // Find category by slug
    const findCategoryBySlug = (categories: Category[], slug: string): Category | null => {
      for (const category of categories) {
        if (category.slug === slug) return category;
        if (category.children) {
          const found = findCategoryBySlug(category.children, slug);
          if (found) return found;
        }
      }
      return null;
    };
    
    const category = findCategoryBySlug(categories, selectedCategory);
    if (!category) return allProducts;
    
    const ids = collectDescendants(categories, category.id);
    return allProducts.filter(
      (p: any) => p.category && ids.includes(p.category)
    );
  }, [allProducts, selectedCategory, categories]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Sản phẩm</h1>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <ProductFilters
              categories={categories}
              onSelect={setSelectedCategory}
              selectedSlug={selectedCategory}
            />
          </div>

          <div className="col-span-12 lg:col-span-9">
            {loading ? (
              <div className="text-center py-10">Đang tải sản phẩm...</div>
            ) : (
              <ProductList
                products={filtered as Product[]}
                sort={sort}
                onSortChange={setSort}
              />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

// Helper: Build tree from flat categories
function buildCategoryTree(
  categories: Array<{ id: string; name: string; slug: string; parent: string | null }>,
  parent: string | null = null
): Category[] {
  return categories
    .filter((c) => (c.parent ?? null) === parent)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      children: buildCategoryTree(categories, c.id),
    }));
}

// Helper: Get all descendant IDs of a category
function collectDescendants(categories: Category[], id: string): string[] {
  const res: string[] = [];
  function dfs(list: Category[]) {
    for (const c of list) {
      if (c.id === id) {
        gather(c);
        return true;
      }
      if (c.children && dfs(c.children)) return true;
    }
    return false;
  }
  function gather(node: Category) {
    res.push(node.id);
    node.children?.forEach(gather);
  }
  dfs(categories);
  return res;
}
