import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="app">
      <a href="#view" className="skip-link">Skip to content</a>
      <Header />
      <main id="view">{children}</main>
      <Footer />
    </div>
  );
}
