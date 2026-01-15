"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Users,
} from "lucide-react";

const menu = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Sản phẩm", href: "/admin/product", icon: Package },
  { label: "Danh mục", href: "/admin/categories", icon: Layers },
  { label: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
  { label: "Người dùng", href: "/admin/users", icon: Users },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 shadow-lg bg-red-200">
      <div className="p-6 text-xl font-bold text-red-500 border-b">
        Admin Panel
      </div>

      <nav className="px-4 space-y-1">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg
              text-gray-700 hover:bg-red-50 hover:text-red-500 transition"
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
