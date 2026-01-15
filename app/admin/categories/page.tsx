"use client";

import React, { useEffect, useMemo, useState } from "react";
import categoryService, { CategoryDto } from "@/services/category.service";

/* ================= TYPES ================= */

type Category = CategoryDto & {
  id: string;
  level?: number;
  isLeaf?: boolean;
  parent?: string | null;
};

/* ================= PAGE ================= */

export default function AdminCategoriesPage() {
  const [allCats, setAllCats] = useState<Category[]>([]);
  const [childrenMap, setChildrenMap] = useState<Record<string, Category[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [parent, setParent] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================= LOAD ROOTS ================= */

  useEffect(() => {
    loadRoots();
  }, []);

  async function loadRoots() {
    setLoading(true);
    try {
      const res = await categoryService.getAll();
      setAllCats(
        (res || []).map((c: any) => ({
          ...c,
          id: c._id || c.id,
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  const roots = useMemo(
    () => allCats.filter((c) => (c.level ?? 0) === 0),
    [allCats]
  );

  /* ================= TREE ================= */

  async function toggleExpand(cat: Category) {
    const isOpen = !expanded[cat.id];
    setExpanded((s) => ({ ...s, [cat.id]: isOpen }));

    if (isOpen && !childrenMap[cat.id]) {
      const res = await categoryService.getAll(cat.id);
      setChildrenMap((s) => ({
        ...s,
        [cat.id]: (res || []).map((c: any) => ({
          ...c,
          id: c._id || c.id,
        })),
      }));
    }
  }

  /* ================= FORM ================= */

  function openCreate(parentId: string | null) {
    setEditing(null);
    setName("");
    setParent(parentId);
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name || "");
    setParent(cat.parent || null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setName("");
    setParent(null);
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (isSubmitting) return;
    if (!name.trim()) return alert("Vui lòng nhập tên");

    setIsSubmitting(true);
    try {
      if (editing) {
        await categoryService.update(editing.id, { name });
        updateLocal(editing.id, name);
      } else {
        const newCat = await categoryService.create({
          name,
          parent: parent || undefined,
        });

        const cat: Category = {
          ...newCat,
          id: newCat._id || newCat.id,
        };

        // ROOT
        if (!parent) {
          setAllCats((prev) => [...prev, cat]);
        } 
        // CHILD
        else {
          setChildrenMap((prev) => ({
            ...prev,
            [parent]: [...(prev[parent] || []), cat],
          }));

          setExpanded((prev) => ({
            ...prev,
            [parent]: true,
          }));
        }
      }

      closeForm();
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateLocal(id: string, name: string) {
    setAllCats((s) => s.map((c) => (c.id === id ? { ...c, name } : c)));
    setChildrenMap((s) =>
      Object.fromEntries(
        Object.entries(s).map(([k, arr]) => [
          k,
          arr.map((c) => (c.id === id ? { ...c, name } : c)),
        ])
      )
    );
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Xóa "${cat.name}"?`)) return;

    await categoryService.remove(cat.id);

    setAllCats((s) => s.filter((c) => c.id !== cat.id));
    setChildrenMap((s) =>
      Object.fromEntries(
        Object.entries(s).map(([k, arr]) => [
          k,
          arr.filter((c) => c.id !== cat.id),
        ])
      )
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Quản lý danh mục
          </h1>
          <p className="text-sm text-zinc-500">
            Tạo, chỉnh sửa và quản lý danh mục sản phẩm
          </p>
        </div>

        <button
          onClick={() => openCreate(null)}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
        >
          + Danh mục gốc
        </button>
      </div>

      {/* TREE */}
      <div className="bg-white rounded-2xl shadow-sm border p-4">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          roots.map((cat) => (
            <CategoryNode
              key={cat.id}
              cat={cat}
              level={0}
              expanded={expanded}
              childrenMap={childrenMap}
              onToggle={toggleExpand}
              onCreate={openCreate}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold">
              {editing ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 mt-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên danh mục"
                className="w-full border rounded-lg px-3 py-2"
              />

              <select
                value={parent || ""}
                onChange={(e) => setParent(e.target.value || null)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">(Danh mục gốc)</option>
                {allCats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {"—".repeat(c.level ?? 0)} {c.name}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded bg-zinc-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded bg-red-500 text-white disabled:opacity-60"
                >
                  {editing ? "Lưu" : "Tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= NODE ================= */

type NodeProps = {
  cat: Category;
  level: number;
  expanded: Record<string, boolean>;
  childrenMap: Record<string, Category[]>;
  onToggle: (cat: Category) => void;
  onCreate: (parentId: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
};

function CategoryNode({
  cat,
  level,
  expanded,
  childrenMap,
  onToggle,
  onCreate,
  onEdit,
  onDelete,
}: NodeProps) {
  const isOpen = expanded[cat.id];
  const children = childrenMap[cat.id] || [];

  return (
    <div style={{ marginLeft: level * 20 }} className="space-y-2">
      <div className="border rounded-xl p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {!cat.isLeaf && (
            <button
              onClick={() => onToggle(cat)}
              className="w-6 h-6 rounded bg-zinc-100"
            >
              {isOpen ? "−" : "+"}
            </button>
          )}
          <span className="font-medium">{cat.name}</span>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onCreate(cat.id)}
            className="px-2 py-1 bg-blue-100 rounded"
          >
            + Thêm
          </button>
          <button
            onClick={() => onEdit(cat)}
            className="px-2 py-1 bg-yellow-100 rounded"
          >
            Sửa
          </button>
          <button
            disabled={!cat.isLeaf}
            onClick={() => onDelete(cat)}
            className="px-2 py-1 bg-red-100 rounded disabled:opacity-40"
          >
            Xóa
          </button>
        </div>
      </div>

      {isOpen &&
        children.map((ch) => (
          <CategoryNode
            key={ch.id}
            cat={ch}
            level={level + 1}
            expanded={expanded}
            childrenMap={childrenMap}
            onToggle={onToggle}
            onCreate={onCreate}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
}
