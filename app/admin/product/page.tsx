"use client";
import React, { useEffect, useState } from "react";
import { productService } from "@/services/product.service";
import categoryService from "@/services/category.service";
import api from "@/services/api";
import { Search } from "lucide-react";

/* =======================
   TYPES
======================= */
type Product = {
  _id?: string;
  name?: string;
  price?: number;
  description?: string;
  images?: string[];
  category?: string;
  sizes?: string[];
  colors?: string[];
};

type FlatCategory = {
  id: string;
  name: string;
  parent?: string | null;
};

type CategoryNode = FlatCategory & {
  level: number;
  isLeaf: boolean;
};

/* =======================
   CATEGORY TREE HELPER
======================= */
function buildCategoryTree(
  categories: FlatCategory[],
  parent: string | null = null,
  level = 0
): CategoryNode[] {
  return categories
    .filter((c) => (c.parent ?? null) === parent)
    .flatMap((c) => {
      const children = buildCategoryTree(categories, c.id, level + 1);
      return [{ ...c, level, isLeaf: children.length === 0 }, ...children];
    });
}

/* =======================
   PAGE
======================= */
export default function ProductAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const productsPerPage = 10;

  const [form, setForm] = useState<Product>({
    name: "",
    price: 0,
    description: "",
    images: [],
    category: "",
    sizes: [],
    colors: [],
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, searchTerm, selectedCategory]);

  /* =======================
     FETCH
  ======================= */
  async function fetchProducts() {
    setLoading(true);
    try {
      const query: any = {
        limit: productsPerPage,
        skip: (currentPage - 1) * productsPerPage,
      };
      
      if (searchTerm) query.search = searchTerm;
      if (selectedCategory) query.category = selectedCategory;
      
      const data = await productService.getAll(query);
      setProducts(data || []);
      
      // Fetch total count for pagination
      const countQuery: any = {};
      if (searchTerm) countQuery.search = searchTerm;
      if (selectedCategory) countQuery.category = selectedCategory;
      
      const countData = await productService.count(countQuery);
      setTotalProducts(countData.count || 0);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    const res = await categoryService.getAll();
    const flat: FlatCategory[] = (res || []).map((c: any) => ({
      id: c._id || c.id,
      name: c.name,
      parent: c.parent ?? null,
    }));
    setCategories(buildCategoryTree(flat));
  }

  /* =======================
     MODAL
  ======================= */
  function openCreate() {
    setEditing(null);
    setForm({
      name: "",
      price: 0,
      description: "",
      images: [],
      category: "",
    });
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name || "",
      price: p.price || 0,
      description: p.description || "",
      images: p.images || [],
      category: p.category || "",
    });
    setShowModal(true);
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    const dto = {
      ...form,
      price: Number(form.price),
    };

    if (editing?._id) {
      await productService.update(editing._id, dto);
      alert("Cập nhật thành công");
    } else {
      await productService.create(dto);
      alert("Tạo sản phẩm thành công");
    }

    setShowModal(false);
    fetchProducts();
  }

  async function handleDelete(id?: string) {
    if (!id || !confirm("Xóa sản phẩm này?")) return;
    await productService.remove(id);
    fetchProducts();
  }

  /* =======================
     UPLOAD IMAGE
  ======================= */
  async function handleUpload(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append("file", files[i]);

        try {
          const res = await api.post("/upload", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const url = res.data?.url;
          console.log("upload response", url);
          if (url) {
            setForm((prev) => ({
              ...prev,
              images: [...(prev.images || []), url],
            }));
          }
        } catch (err) {
          console.error("upload error", err);
          alert("Không thể upload ảnh");
        }
      }
    } finally {
      setUploading(false);
    }
  }

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Quản lý sản phẩm</h2>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Thêm sản phẩm
        </button>
      </div>

      {/* SEARCH AND FILTER */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="w-64">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {"  ".repeat(cat.level) + (cat.level > 0 ? "└ " : "") + cat.name}
                </option>
              ))}
            </select>
          </div>
          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="px-10 py-4 font-semibold">Ảnh</th>
              <th className="px-6 py-4 font-semibold">Tên sản phẩm</th>
              <th className="px-6 py-4 font-semibold">Giá</th>
              <th className="px-6 py-4 font-semibold text-right">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-gray-400"
                >
                  Chưa có sản phẩm
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  {/* IMAGE */}
                  <td className="px-6 py-4">
                    {p.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0]}
                        className="w-14 h-14 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 border" />
                    )}
                  </td>

                  {/* NAME */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 line-clamp-1">
                      {p.name}
                    </div>
                  </td>

                  {/* PRICE */}
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    {p.price?.toLocaleString("vi-VN")} ₫
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                      >
                        Sửa
                      </button>

                      <button
                        onClick={() => handleDelete(p._id)}
                        className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalProducts > productsPerPage && (
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {(currentPage - 1) * productsPerPage + 1} đến{" "}
              {Math.min(currentPage * productsPerPage, totalProducts)} của{" "}
              {totalProducts} sản phẩm
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trang trước
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.ceil(totalProducts / productsPerPage) }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === Math.ceil(totalProducts / productsPerPage) ||
                    Math.abs(page - currentPage) <= 2
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === page
                          ? "bg-red-500 text-white border-red-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(Math.ceil(totalProducts / productsPerPage), currentPage + 1))}
                disabled={currentPage === Math.ceil(totalProducts / productsPerPage)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trang sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl p-6 rounded shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              {editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <input
                placeholder="Tên sản phẩm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="number"
                placeholder="Giá"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                className="w-full border px-3 py-2 rounded"
              />

              {/* CATEGORY */}
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} disabled={!c.isLeaf}>
                    {"— ".repeat(c.level)}
                    {c.name}
                    {!c.isLeaf ? " (nhóm)" : ""}
                  </option>
                ))}
              </select>

              {/* SIZES */}
              <div>
                <label className="block text-sm font-medium mb-1">Kích thước</label>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <label key={size} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={form.sizes?.includes(size) || false}
                        onChange={(e) => {
                          const sizes = form.sizes || [];
                          if (e.target.checked) {
                            setForm({ ...form, sizes: [...sizes, size] });
                          } else {
                            setForm({ ...form, sizes: sizes.filter(s => s !== size) });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* COLORS */}
              <div>
                <label className="block text-sm font-medium mb-1">Màu sắc</label>
                <div className="flex flex-wrap gap-2">
                  {['Đen', 'Trắng', 'Đỏ', 'Xanh', 'Vàng', 'Xám', 'Be', 'Nâu'].map((color) => (
                    <label key={color} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={form.colors?.includes(color) || false}
                        onChange={(e) => {
                          const colors = form.colors || [];
                          if (e.target.checked) {
                            setForm({ ...form, colors: [...colors, color] });
                          } else {
                            setForm({ ...form, colors: colors.filter(c => c !== color) });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Mô tả"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />

              {/* IMAGES */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ảnh sản phẩm
                </label>

                <div className="flex flex-wrap gap-3 mb-2">
                  {(form.images || []).map((img, i) => (
                    <div key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            images: prev.images?.filter((_, idx) => idx !== i),
                          }))
                        }
                        className="absolute -top-2 -right-2 bg-white rounded-full px-2 shadow"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 text-white rounded"
                  disabled={uploading}
                >
                  {uploading ? "Đang upload..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
