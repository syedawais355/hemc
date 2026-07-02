import Link from "next/link";
import { BRAND } from "@/lib/brand";

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  { title: "Shop", links: [
    { label: "Kidney & Urinary", href: "/shop?cat=kidney-urinary" },
    { label: "Brain & Memory", href: "/shop?cat=brain-memory" },
    { label: "Women's Health", href: "/shop?cat=womens-health" },
    { label: "Vitality & Wellness", href: "/shop?cat=vitality-wellness" },
  ] },
  { title: "Clinic", links: [
    { label: "About HEMC", href: "/about" },
    { label: "Our work", href: "/about#our-work" },
    { label: "Consult online", href: "/shop" },
    { label: "Visit us", href: "/about" },
  ] },
  { title: "Support", links: [
    { label: "Help center", href: "/about" },
    { label: "Track order", href: "/account" },
    { label: "Returns", href: "/about" },
    { label: "Contact", href: "/about" },
  ] },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__cols">
            <div className="footer__about">
              <Link className="brand" href="/">
                <span className="brand__mark brand__mark--logo">
                  <img src={BRAND.markUrl} alt="HEMC" width={36} height={36} />
                </span>
                {BRAND.name}
              </Link>
              <p>{BRAND.fullName} — traditional Unani &amp; herbal remedies, formulated with care and delivered across Pakistan.</p>
            </div>
            {COLS.map((col) => (
              <div className="footer__col" key={col.title}>
                <h4>{col.title}</h4>
                {col.links.map((l) => <Link key={l.label} href={l.href}>{l.label}</Link>)}
              </div>
            ))}
          </div>
          <div className="footer__bottom">
            <span>© 2026 {BRAND.fullName} · hemc.pk</span>
            <span>Made with care in Pakistan.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
