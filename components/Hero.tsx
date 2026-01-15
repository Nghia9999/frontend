import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl mt-4 ">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-8 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
          {/* LEFT */}
          <div className="text-white">
            <span className="inline-block mb-4 px-4 py-1 rounded-full bg-white/20 text-sm">
              🤖 AI-powered Shopping
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Mua sắm thông minh <br />
              cùng <span className="text-black bg-white px-2 rounded">AI</span>
            </h1>

            <p className="text-red-100 text-lg mb-8 leading-relaxed">
              AI giúp bạn tìm đúng sản phẩm, đúng nhu cầu, đúng giá —
              nhanh hơn, chính xác hơn và tiết kiệm hơn mỗi ngày.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="#products"
                className="px-6 py-3 rounded-xl bg-white text-red-500 font-semibold hover:bg-black hover:text-white transition"
              >
                Khám phá ngay
              </Link>

              <Link
                href="#ai-recommend"
                className="px-6 py-3 rounded-xl border border-white text-white hover:bg-white hover:text-red-500 transition"
              >
                AI gợi ý cho bạn
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuxivp3r2zNio32vN0GzZvqdSSaG7nEOEuDA&s"
              alt="AI Shopping"
              className="relative z-10 w-full max-w-md mx-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
