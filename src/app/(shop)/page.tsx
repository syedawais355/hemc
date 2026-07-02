import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ProductCard } from "@/components/ProductCard";
import HeroBottle from "@/components/hero/HeroBottle";
import { listProducts } from "@/lib/repos/products";
import { listCategories } from "@/lib/repos/categories";

export const dynamic = "force-dynamic";

const CAT_ICON: Record<string, string> = {
  "kidney-urinary": "droplet",
  "brain-memory": "dna",
  "womens-health": "heart",
  "vitality-wellness": "leaf",
};

const TRUST = [
  { icon: "shield", title: "Authentic remedies", sub: "Hakeem-formulated" },
  { icon: "leaf", title: "100% natural", sub: "Herbal & Unani" },
  { icon: "truck", title: "Nationwide delivery", sub: "Fast & tracked" },
  { icon: "back", title: "Easy returns", sub: "On every order" },
];

export default async function HomePage() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  const trending = products.slice(0, 4);

  return (
    <>
      <HeroBottle />
      <div className="container home-below">
      <section className="trust">
        {TRUST.map((t) => (
          <div className="trust__item card" key={t.title}>
            <span className="trust__ico"><Icon name={t.icon} size={19} /></span>
            <div><strong>{t.title}</strong><span>{t.sub}</span></div>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Categories</span>
            <h2>Shop by need</h2>
            <p>Find the right shelf in seconds.</p>
          </div>
          <Link className="btn btn--ghost" href="/shop">View all</Link>
        </div>
        <div className="grid grid-4">
          {categories.map((c) => (
            <Link className="cat-card" href={`/shop?cat=${c.slug}`} key={c.id}>
              <span className="cat-card__ico"><Icon name={CAT_ICON[c.slug] ?? "leaf"} size={23} /></span>
              <h3>{c.name}</h3>
              <p>{c.description}</p>
              <span className="cat-card__more">Browse <Icon name="arrow" size={16} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Bestsellers</span>
            <h2>Trending now</h2>
            <p>What people are reaching for this week.</p>
          </div>
          <Link className="btn btn--ghost" href="/shop">View all</Link>
        </div>
        <div className="grid grid-4">
          {trending.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="cta">
        <div>
          <span className="eyebrow">Consult a hakeem</span>
          <h2>Not sure what you need?</h2>
          <p>Tell our hakeem about your concern and get a remedy matched to you — no waiting room, no guesswork.</p>
        </div>
        <Link className="btn btn--light btn--lg" href="/shop">Consult now</Link>
      </section>
      </div>
    </>
  );
}
