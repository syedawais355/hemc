"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/client/store";
import { Icon } from "@/components/Icon";
import { BRAND } from "@/lib/brand";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/orders", label: "Orders", icon: "box" },
  { href: "/admin/products", label: "Products", icon: "bag" },
  { href: "/admin/categories", label: "Categories", icon: "tag" },
  { href: "/admin/reviews", label: "Reviews", icon: "star" },
  { href: "/admin/users", label: "Users", icon: "user" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useStore();

  return (
    <aside className="admin__side">
      <Link className="brand" href="/">
        <span className="brand__mark brand__mark--logo">
          <img src={BRAND.markUrl} alt="HEMC" width={36} height={36} />
        </span>
        {BRAND.name}
      </Link>
      <nav>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={pathname === l.href ? "is-active" : ""}>
            {l.label}
          </Link>
        ))}
        <Link href="/">View store</Link>
        <a role="button" onClick={async () => { await logout(); router.push("/"); }}>Sign out</a>
      </nav>
    </aside>
  );
}
