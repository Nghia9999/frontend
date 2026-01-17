"use client";

import authService from "@/services/auth.service";
import { Bell, User, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AdminHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await authService.logout();
    } finally {
      router.replace("/login");
    }
  }

  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between">
      <h1 className="font-semibold text-lg text-zinc-900">Admin</h1>

      <div className="flex items-center gap-4">
        {/* Notification */}
        <button className="relative p-2 rounded-full hover:bg-zinc-100 transition">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((s) => !s)}
            className="
              flex items-center gap-2 px-3 py-2 rounded-lg
              hover:bg-zinc-100 transition
            "
          >
            <User size={18} />
            <span className="text-sm font-medium">Admin</span>
            <ChevronDown size={16} />
          </button>

          {open && (
            <div
              className="
                absolute right-0 mt-2 w-44
                bg-white border border-zinc-200
                rounded-xl shadow-lg
                overflow-hidden
                z-50
              "
            >
              <button
                onClick={handleLogout}
                className="
                  w-full flex items-center gap-2
                  px-4 py-3 text-sm text-red-600
                  hover:bg-red-50 transition
                "
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
