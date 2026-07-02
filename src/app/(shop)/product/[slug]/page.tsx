import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { ProductCard } from "@/components/ProductCard";
import { BuyBox } from "@/components/BuyBox";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewList } from "@/components/ReviewList";
import { getProductBySlug, listProducts } from "@/lib/repos/products";
import { listReviews } from "@/lib/repos/reviews";
import { money } from "@/lib/format";
import { productImage } from "@/lib/brand";

export const dynamic = "force-dynamic";

const ASSURANCES = ["Free 2-hour delivery", "Pharmacist support", "Easy returns"];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Remedy not found" };
  const desc = product.description?.slice(0, 160) || `${product.name} — herbal remedy from HEMC.`;
  return {
    title: product.name,
    description: desc,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} · HEMC`,
      description: desc,
      images: productImage(product.image_url) ? [{ url: productImage(product.image_url)! }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.is_active) notFound();

  const [reviews, all] = await Promise.all([listReviews(product.id), listProducts()]);
  const related = all.filter((p) => p.id !== product.id && p.category_id === product.category_id).slice(0, 4);
  const fallbackRelated = related.length ? related : all.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="container">
      <Link className="back-link" href="/shop"><Icon name="back" size={17} /> Back to pharmacy</Link>

      <div className="detail">
        <div className="gallery">
          <div className="gallery__main">
            {productImage(product.image_url) && <img src={productImage(product.image_url)!} alt={product.name} className="is-loaded" />}
            {product.tag && <span className="badge badge--float" style={{ top: 18, left: 18 }}>{product.tag}</span>}
          </div>
        </div>

        <div className="detail__info card">
          <span className="eyebrow">{product.category_name}</span>
          <h1>{product.name}</h1>
          <div className="detail__rating">
            <span className="stars">
              {Array.from({ length: 5 }, (_, i) => (
                <Icon key={i} name="star" size={15} fill={i < Math.round(product.avg_rating) ? "currentColor" : "none"} />
              ))}
            </span>
            {product.avg_rating > 0 ? `${product.avg_rating} · ${product.review_count} reviews` : "No reviews yet"}
          </div>
          <p className="detail__desc">{product.description}</p>

          <div className="specs">
            <div className="spec"><strong>{product.uom}</strong><span>per pack</span></div>
            <div className="spec"><strong>Vegan</strong><span>formula</span></div>
            <div className="spec"><strong>3rd-party</strong><span>tested</span></div>
          </div>

          <div className="detail__price">
            <strong>{money(product.price)}</strong>
            <span>per pack · subscribe &amp; save 15%</span>
          </div>

          <BuyBox product={product} />

          <div className="assure">
            {ASSURANCES.map((a) => <span key={a}><i />{a}</span>)}
          </div>
        </div>
      </div>

      <section className="reviews">
        <div className="section-head"><h2>Reviews</h2></div>
        <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", alignItems: "start", gap: "var(--sp-5)" }}>
          <div><ReviewList reviews={reviews} /></div>
          <ReviewForm productId={product.id} />
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Pairs well with</h2></div>
        <div className="grid grid-4">{fallbackRelated.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>
    </div>
  );
}
