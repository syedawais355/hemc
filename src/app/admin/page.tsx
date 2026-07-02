import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrderStats } from "@/lib/repos/orders";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

async function count(table: string): Promise<number> {
  const db = createAdminClient();
  const { count } = await db.from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function AdminDashboard() {
  const [products, categories, profiles, reviews, stats] = await Promise.all([
    count("products"),
    count("categories"),
    count("profiles"),
    count("reviews"),
    getOrderStats(),
  ]);

  const openOrders = stats.byStatus.placed + stats.byStatus.processing + stats.byStatus.shipped;

  const tiles = [
    { label: "Revenue", value: money(stats.revenue) },
    { label: "Orders", value: stats.count },
    { label: "Open orders", value: openOrders },
    { label: "Customers", value: profiles },
  ];

  const cards = [
    { label: "Orders", value: stats.count, href: "/admin/orders" },
    { label: "Products", value: products, href: "/admin/products" },
    { label: "Categories", value: categories, href: "/admin/categories" },
    { label: "Reviews", value: reviews, href: "/admin/reviews" },
  ];

  const statusOrder = ["placed", "processing", "shipped", "delivered", "cancelled"] as const;

  return (
    <div>
      <div className="admin__head"><h1>Dashboard</h1></div>

      <div className="stat-grid">
        {tiles.map((t) => (
          <div className="stat-card" key={t.label}>
            <span className="stat-card__label">{t.label}</span>
            <strong className="stat-card__value">{t.value}</strong>
          </div>
        ))}
      </div>

      <div className="admin__head"><h1 style={{ fontSize: "var(--step-3)" }}>Orders by status</h1></div>
      <div className="filter-row" style={{ marginBottom: "var(--sp-6)" }}>
        {statusOrder.map((s) => (
          <Link href="/admin/orders" key={s} className={`ostatus ostatus--${s}`} style={{ textDecoration: "none" }}>
            {s} · {stats.byStatus[s]}
          </Link>
        ))}
      </div>

      <div className="admin__head"><h1 style={{ fontSize: "var(--step-3)" }}>Manage</h1></div>
      <div className="grid grid-4">
        {cards.map((c) => (
          <Link className="cat-card" href={c.href} key={c.label} style={{ minHeight: 140 }}>
            <strong style={{ fontFamily: "var(--font-display)", fontSize: "var(--step-5)" }}>{c.value}</strong>
            <p style={{ marginTop: "auto" }}>{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
