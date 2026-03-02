"use client";

import Link from "next/link";

export default function Hero() {
  const bgUrl = "2.jpg";

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url('${bgUrl}')` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

      {/* Blur light effect */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-pink-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-red-500/30 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* LEFT */}
          <div className="text-white">
            <span className="inline-block mb-6 px-4 py-1 rounded-full bg-white/10 backdrop-blur-md text-sm border border-white/20">
              🤖 AI-Powered Smart Shopping
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Trải nghiệm mua sắm <br />
              <span className="bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
                thông minh hơn
              </span>{" "}
            </h1>

            <p className="text-gray-300 text-lg mb-10 leading-relaxed max-w-xl">
              Công nghệ AI phân tích hành vi và nhu cầu của bạn để đề xuất sản
              phẩm phù hợp nhất — nhanh chóng, chính xác và tiết kiệm thời gian.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="#products"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
              >
                Khám phá ngay
              </Link>

              <Link
                href="#category-nam"
                className="px-8 py-4 rounded-xl border border-white/30 text-white hover:bg-white hover:text-black transition"
              >
                Xem danh mục
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          {/* <div className="relative flex justify-center">
            <div className="absolute -top-8 -left-8 w-80 h-80 bg-white/10 backdrop-blur-2xl rounded-3xl rotate-6" />
            <img
              src="1.jpg"
              alt="AI Shopping"
              className="relative z-10 w-full max-w-lg rounded-3xl shadow-2xl"
            />
          </div> */}
          {/* RIGHT */}
          <div className="relative flex justify-center">
            <div className="absolute -top-8 -left-8 w-80 h-80 bg-white/10 backdrop-blur-2xl rounded-3xl rotate-6" />

            <img
              src="1.jpg"
              alt="AI Shopping"
              className="relative z-10 w-full max-w-lg rounded-3xl shadow-2xl 
               animate-float 
               transition-transform duration-500 
               hover:scale-105 hover:rotate-1"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
