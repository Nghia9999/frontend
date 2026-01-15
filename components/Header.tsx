"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50">
      {/* MAIN HEADER */}
      <div className="rounded-xl mx-auto py-4 px-6 flex items-center bg-red-500">
        {/* LOGO */}
        <Link href="/">
          <h1 className="text-2xl font-bold text-white hover:text-black transition">
            AI E-commerce
          </h1>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex">
          <ul className="flex space-x-2 ml-10 pt-1 items-center">
            <li>
              <Link
                href="/"
                className="px-4 py-2 rounded-full text-white hover:bg-white hover:text-black transition"
              >
                Trang chủ
              </Link>
            </li>

            {/* SẢN PHẨM - DROPDOWN */}
            <li className="relative group">
              <Link
                href="/product"
                className="px-4 py-2 rounded-full text-white hover:bg-white hover:text-black transition cursor-pointer"
              >
                Sản phẩm
              </Link>

              {/* DROPDOWN */}
              <div className="absolute left-0 mt-2 w-44 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link
                  href="/product?category=nam"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-500 hover:text-white rounded-t-xl"
                >
                  Nam
                </Link>
                <Link
                  href="/product?category=nu"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-500 hover:text-white"
                >
                  Nữ
                </Link>
                <Link
                  href="/product?category=tre-em"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-500 hover:text-white rounded-b-xl"
                >
                  Trẻ em
                </Link>
              </div>
            </li>

            <li>
              <Link
                href="#"
                className="px-4 py-2 rounded-full text-white hover:bg-white hover:text-black transition font-bold"
              >
                Dành cho bạn ✨
              </Link>
            </li>
            <li>
              <Link
                href="#contact"
                className="px-4 py-2 rounded-full text-white hover:bg-white hover:text-black transition font-bold"
              >
                Liên hệ
              </Link>
            </li>
          </ul>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center space-x-6 pt-1 text-white ml-auto">
          <div className="relative">
            <button
              onClick={() => setShowSearch((s) => !s)}
              className="p-2 rounded-lg hover:bg-white hover:text-black transition"
              aria-label="Search"
            >
              <Search size={24} />
            </button>
          </div>

          <Link href="/cart" className="p-2 rounded-lg hover:bg-white hover:text-black transition relative">
            <ShoppingCart size={24} />
            <span
              className="absolute -top-1 -right-1 min-w-5 h-5
              px-1 text-xs font-bold
            bg-white text-black
              rounded-full
              flex items-center justify-center"
            >
              3
            </span>
          </Link>

          <div className="hidden sm:block relative">
            <button
              onClick={() => setShowProfile((s) => !s)}
              className="p-2 rounded-lg hover:bg-white hover:text-black transition"
              aria-label="Profile"
            >
              <User size={24} />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-50">
                <button
                  onClick={async () => {
                    await authService.logout();
                    setShowProfile(false);
                    router.push("/login");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-500 hover:text-white rounded-b-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white hover:text-black transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-red-500 rounded-xl p-4 z-50 shadow-xl">
          <ul className="flex flex-col space-y-2 text-white">
            <li>
              <Link
                href="#home"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
              >
                Trang chủ
              </Link>
            </li>

            {/* SẢN PHẨM MOBILE */}
            <li>
              <button
                onClick={() => setIsProductOpen(!isProductOpen)}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-white hover:text-black transition font-medium"
              >
                Sản phẩm
              </button>

              {isProductOpen && (
                <div className="ml-4 mt-2 space-y-1">
                  <Link
                    href="#nam"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
                  >
                    Nam
                  </Link>
                  <Link
                    href="#nu"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
                  >
                    Nữ
                  </Link>
                  <Link
                    href="#tre-em"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
                  >
                    Trẻ em
                  </Link>
                </div>
              )}
            </li>

            <li>
              <Link
                href="#"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-white hover:text-black transition font-bold"
              >
                Dành cho bạn ✨
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
