import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ProductCard } from "@/components/ProductCard";
import { SortSelect } from "@/components/SortSelect";
import { listProducts, type ProductFilter } from "@/lib/repos/products";
import { listCategories } from "@/lib/repos/categories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop remedies",
  description:
    "Browse HEMC's herbal & Unani remedies — kidney & urinary, brain & memory, women's health and vitality formulas. Nationwide delivery across Pakistan.",
  alternates: { canonical: "/shop" },
};

const TABS = ["All", "Bestseller", "New", "Trending"];

type Search = { cat?: string; tag?: string; q?: string; sort?: string };

function buildUrl(current: Search, patch: Partial<Search>) {
  const merged = { ...current, ...patch };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v && v !== "All") params.set(k, v);
  }
  const qs = params.toString();
  return `/shop${qs ? `?${qs}` : ""}`;
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const filter: ProductFilter = {
    categorySlug: sp.cat,
    tag: sp.tag,
    search: sp.q,
    sort: (sp.sort as ProductFilter["sort"]) ?? "popular",
  };

  const [all, categories, list] = await Promise.all([
    listProducts(),
    listCategories(),
    listProducts(filter),
  ]);

  const counts = new Map<string, number>();
  all.forEach((p) => p.category_name && counts.set(p.category_name, (counts.get(p.category_name) ?? 0) + 1));
  const activeCat = categories.find((c) => c.slug === sp.cat);

  return (
    <div className="container">
      <div className="page-head">
        <span className="eyebrow">Pharmacy · {all.length} products</span>
        <h1>{sp.q ? `Results for “${sp.q}”` : activeCat?.name ?? "Everything in stock"}</h1>
      </div>

      <div className="shop">
        <aside className="filters">
          <p className="filters__label">Category</p>
          <Link className={`filter ${!sp.cat ? "is-active" : ""}`} href={buildUrl(sp, { cat: undefined })}>
            <span>All products</span><span>{all.length}</span>
          </Link>
          {categories.map((c) => (
            <Link key={c.id} className={`filter ${sp.cat === c.slug ? "is-active" : ""}`} href={buildUrl(sp, { cat: c.slug })}>
              <span>{c.name}</span><span>{counts.get(c.name) ?? 0}</span>
            </Link>
          ))}
        </aside>

        <div>
          <div className="shop__toolbar">
            {TABS.map((t) => {
              const on = t === "All" ? !sp.tag : sp.tag === t;
              return (
                <Link key={t} className={`pill ${on ? "is-active" : ""}`} href={buildUrl(sp, { tag: t === "All" ? undefined : t })}>
                  {t}
                </Link>
              );
            })}
            <span className="spacer" />
            <SortSelect value={filter.sort ?? "popular"} />
          </div>
          <p className="shop__count">{list.length} {list.length === 1 ? "product" : "products"}</p>

          {list.length ? (
            <div className="grid grid-3">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          ) : (
            <div className="empty">
              <span className="empty__ico"><Icon name="search" size={28} /></span>
              <h3>No matches</h3>
              <p>Nothing fits those filters yet. Try a different category or clear your search.</p>
              <Link className="btn btn--primary" href="/shop">Reset filters</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
