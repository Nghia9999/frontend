import CategorySlider from "@/components/CategorySlider";
import Hero from "@/components/Hero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturedCategories from "@/components/FeaturedCategories";

export default function Page() {
  return (
    <main className="scroll-smooth">
      <Header />
      <Hero />

      {/* Featured categories grid to give users quick access */}
      <FeaturedCategories />

      {/* <CategorySection /> */}
      <div id="category-nam" className="scroll-mt-24">
        <CategorySlider title="Thời trang nam" categorySlug="nam" />
      </div>

      <div id="category-nu" className="scroll-mt-24">
        <CategorySlider title="Thời trang nữ" categorySlug="nu" />
      </div>

      <div id="category-tre-em" className="scroll-mt-24">
        <CategorySlider title="Trẻ em" categorySlug="tre-em" />
      </div>

      <div id="category-san-pham-noi-bat" className="scroll-mt-24">
        <CategorySlider
          title="Sản phẩm nổi bật"
          categorySlug="san-pham-noi-bat"
        />
      </div>
      <Footer />
    </main>
  );
}
