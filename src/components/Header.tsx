"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/client/store";
import { initTheme, setTheme } from "@/lib/client/theme";
import { Icon } from "@/components/Icon";
import { BRAND } from "@/lib/brand";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/wishlist", label: "Wishlist" },
];

export function Header() {
  const { user, cartCount } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => { setThemeState(initTheme()); }, []);
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/shop?q=${encodeURIComponent(query.trim())}` : "/shop");
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const links = (extra = "") =>
    NAV.map((l) => (
      <Link key={l.href} href={l.href} className={`nav__link ${extra} ${isActive(l.href) ? "is-active" : ""}`}>
        {l.label}
      </Link>
    ));

  return (
    <header className="header">
      <div className="container">
        <div className="header__bar">
          <Link className="brand" href="/" aria-label="HEMC home">
            <span className="brand__mark brand__mark--logo">
              <img src={BRAND.logoUrl} alt="HEMC" width={36} height={36} />
            </span>
            {BRAND.name}
          </Link>

          <nav className="nav" aria-label="Primary">{links()}</nav>

          <form className="header__search" role="search" onSubmit={onSearch}>
            <Icon name="search" size={17} />
            <input
              type="search" placeholder="Search remedies…" aria-label="Search products"
              value={query} onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          <div className="header__actions">
            <button className="iconbtn" onClick={toggleTheme} aria-label="Toggle theme">
              <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
            </button>
            <Link className="iconbtn iconbtn--accent cart-link" href="/cart" aria-label="View cart">
              <Icon name="bag" size={18} />
              {cartCount > 0 && <span className="cart-link__count">{cartCount}</span>}
            </Link>
            <Link className="iconbtn" href={user ? "/account" : "/login"} aria-label="Account">
              <Icon name="user" size={18} />
            </Link>
            <button className="iconbtn menu-toggle" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" aria-expanded={menuOpen}>
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>

        <nav className={`mobile-nav ${menuOpen ? "is-open" : ""}`} aria-label="Mobile">
          <form className="mobile-nav__search" role="search" onSubmit={onSearch}>
            <Icon name="search" size={17} />
            <input
              type="search" placeholder="Search remedies…" aria-label="Search products"
              value={query} onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          {links()}
          {user?.role === "admin" && <Link className="nav__link" href="/admin">Admin</Link>}
          <Link className="nav__link" href={user ? "/account" : "/login"}>{user ? "Account" : "Sign in"}</Link>
        </nav>
      </div>
    </header>
  );
}
