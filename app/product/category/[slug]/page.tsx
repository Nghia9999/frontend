"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function CategorySlugPage() {
  const router = useRouter();
  const params = useParams();
  
  useEffect(() => {
    const slug = params.slug as string;
    if (slug) {
      router.replace(`/product?category=${slug}`);
    }
  }, [router, params]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}