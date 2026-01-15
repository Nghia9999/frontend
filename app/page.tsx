import CategorySlider from "@/components/CategorySlider";
import Hero from "@/components/Hero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export default function Page() {
  return (
    <main>
      <Header />
      <Hero />
      {/* <CategorySection /> */}
      <CategorySlider title="Thời trang nam" categorySlug="nam" />

      <CategorySlider title="Thời trang nữ" categorySlug="nu" />

      <CategorySlider title="Trẻ em" categorySlug="tre-em" />

      <CategorySlider
        title="Sản phẩm nổi bật"
        categorySlug="san-pham-noi-bat"
      />
      <Footer />
    </main>
  );
}
