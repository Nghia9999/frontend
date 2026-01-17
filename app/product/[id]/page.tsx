"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import productService from "@/services/product.service";
import categoryService from "@/services/category.service";
import { useTracking } from "@/hooks/useTracking";
import authService from "@/services/auth.service";
import { cartService } from "@/services/cart.service";
import ProductRecommendations from "@/components/ProductRecommendations";

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.userId;

  const { trackView, trackAddToCart } = useTracking({
    userId,
    autoTrack: false
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await productService.getOne(params.id as string);
        setProduct(res);
        
        // Track product view
        trackView(params.id as string, res.category);
        
        // Fetch category name if category exists
        if (res.category) {
          try {
            const categoryRes = await categoryService.getOne(res.category);
            setCategoryName(categoryRes.name);
          } catch (err) {
            console.error('Error fetching category:', err);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, trackView]);

  const handleAddToCart = async () => {
    // Validate size and color selection if they exist
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Vui lòng chọn kích thước!');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Vui lòng chọn màu sắc!');
      return;
    }

    try {
      // Track add to cart
      trackAddToCart(product._id || product.id, quantity, product.category);

      const cartItem = {
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "https://via.placeholder.com/400",
        quantity: quantity,
        size: selectedSize,
        color: selectedColor,
      };

      // Add to database using cartService
      await cartService.addToCart(cartItem);
      alert('Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng!');
    }
  };

  if (loading) {
    return (
      <main>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải sản phẩm...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Sản phẩm không tồn tại</h1>
            <p className="text-gray-600">Sản phẩm bạn tìm kiếm không được tìm thấy.</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-3">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images?.[0] || "https://via.placeholder.com/500"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image: string, index: number) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl font-bold text-red-500">
                  {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                </span>
                {product.oldPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {new Intl.NumberFormat('vi-VN').format(product.oldPrice)}đ
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex text-yellow-400">
                  {'★'.repeat(Math.floor(product.averageRating || product.rating || 0))}
                  {'☆'.repeat(5 - Math.floor(product.averageRating || product.rating || 0))}
                </div>
                <span className="text-gray-600">({(product.averageRating || product.rating || 0)}/5)</span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-2">Mô tả sản phẩm</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description || "Chưa có mô tả cho sản phẩm này."}
              </p>
            </div>

            {/* SIZE SELECTION */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-base font-semibold mb-2">Kích thước</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
                        selectedSize === size
                          ? 'border-red-500 bg-red-50 text-red-500'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* COLOR SELECTION */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-base font-semibold mb-2">Màu sắc</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
                        selectedColor === color
                          ? 'border-red-500 bg-red-50 text-red-500'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-base font-semibold mb-2">Số lượng</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1 text-sm"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-sm"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-red-500 text-white py-2.5 rounded-lg font-semibold hover:bg-red-600 transition text-sm"
              >
                Thêm vào giỏ hàng
              </button>
              <button className="w-full border-2 border-red-500 text-red-500 py-2.5 rounded-lg font-semibold hover:bg-red-50 transition text-sm">
                Mua ngay
              </button>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-base font-semibold mb-3">Thông tin sản phẩm</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Danh mục:</span>
                  <span className="font-medium">{categoryName || 'Chưa phân loại'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tình trạng:</span>
                  <span className="font-medium text-green-600">Còn hàng</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          {userId && (
            <ProductRecommendations
              userId={userId}
              type="collaborative"
              limit={10}
              title="Gợi ý cho bạn"
            />
          )}

          {userId && (
            <ProductRecommendations
              userId={userId}
              type="content_based"
              limit={10}
              title="Sản phẩm bạn có thể thích"
            />
          )}

          <ProductRecommendations
            productId={product._id || product.id}
            type="similar"
            limit={10}
            title="Sản phẩm tương tự"
          />
        </div>

      </div>

      <Footer />
    </main>
  );
}
