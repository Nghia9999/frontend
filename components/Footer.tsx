import { Facebook, Instagram, Twitter, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-gradient-to-r from-red-500 to-red-600 text-white mt-16"
    >
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold mb-3">AI E-commerce</h2>
            <p className="text-sm text-red-100 leading-relaxed">
              Nền tảng thương mại điện tử ứng dụng AI giúp bạn mua sắm thông
              minh, nhanh chóng và hiệu quả hơn.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Liên kết</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-red-200">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-200">
                  Sản phẩm
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-200">
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-200">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-red-200">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-200">
                  Chính sách
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-200">
                  Điều khoản
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-200">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Kết nối</h3>
            <div className="flex gap-4">
              <a className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                <Facebook size={18} />
              </a>
              <a className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                <Instagram size={18} />
              </a>
              <a className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                <Twitter size={18} />
              </a>
              <a className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                <Github size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 mt-10 pt-6 text-center text-sm text-red-100">
          © {new Date().getFullYear()} AI E-commerce. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
