"use client";

import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export type Category = {
  id: string;
  name: string;
  slug?: string;
  children?: Category[];
};

type Props = {
  categories: Category[];
  onSelect: (slug: string | null) => void;
  selectedSlug?: string | null;
};

export default function ProductFilters({ categories, onSelect, selectedSlug }: Props) {
  // đường dẫn đang mở: ["nu", "ao", "ao-thun"]
  const [openPath, setOpenPath] = React.useState<string[]>([]);

  function toggle(level: number, id: string, slug: string) {
    const next = openPath.slice(0, level);
    if (openPath[level] === id) {
      setOpenPath(next);
      onSelect(next[level - 1] ?? null);
    } else {
      next[level] = id;
      setOpenPath(next);
      onSelect(slug);
    }
  }

  function clear() {
    setOpenPath([]);
    onSelect(null);
  }

  return (
    <aside className="bg-white rounded-xl shadow p-4 w-full max-w-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm uppercase text-gray-700">
          Bộ lọc danh mục
        </h3>
        <button
          onClick={clear}
          className="text-xs text-red-500 hover:underline"
        >
          Xóa
        </button>
      </div>

      {/* LEVEL 0 */}
      <ul className="space-y-1 text-sm">
        {categories.map((cat0) => {
          const open0 = openPath[0] === cat0.id;
          const isSelected = selectedSlug === cat0.slug;

          return (
            <li key={cat0.id}>
              <button
                onClick={() => toggle(0, cat0.id, cat0.slug || '')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg
                  ${
                    isSelected || open0
                      ? "bg-red-50 text-red-600 font-medium"
                      : "hover:bg-gray-100"
                  }`}
              >
                {cat0.name}
                {cat0.children &&
                  (open0 ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  ))}
              </button>

              {/* LEVEL 1 */}
              {open0 && cat0.children && (
                <ul className="mt-1 ml-4 space-y-1">
                  {cat0.children.map((cat1) => {
                    const open1 = openPath[1] === cat1.id;
                    const isSelected = selectedSlug === cat1.slug;

                    return (
                      <li key={cat1.id}>
                        <button
                          onClick={() => toggle(1, cat1.id, cat1.slug || '')}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg
                            ${
                              isSelected || open1
                                ? "bg-red-50 text-red-600 font-medium"
                                : "hover:bg-gray-100"
                            }`}
                        >
                          {cat1.name}
                          {cat1.children &&
                            (open1 ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            ))}
                        </button>

                        {/* LEVEL 2 */}
                        {open1 && cat1.children && (
                          <ul className="mt-1 ml-4 space-y-1">
                            {cat1.children.map((cat2) => (
                              <li key={cat2.id}>
                                <button
                                  onClick={() => toggle(2, cat2.id, cat2.slug || '')}
                                  className={`w-full text-left px-3 py-2 rounded-lg
                                    ${
                                      selectedSlug === cat2.slug
                                        ? "bg-red-100 text-red-600 font-medium"
                                        : "hover:bg-gray-100"
                                    }`}
                                >
                                  {cat2.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
