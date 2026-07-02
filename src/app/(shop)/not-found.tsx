import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="container">
      <div className="empty" style={{ paddingBlock: "var(--sp-9)" }}>
        <span className="empty__ico"><Icon name="leaf" size={30} /></span>
        <h1 style={{ fontSize: "var(--step-5)" }}>Page not found</h1>
        <p>The page or remedy you’re looking for isn’t here. It may have moved or is out of stock.</p>
        <div style={{ display: "flex", gap: "var(--sp-3)", flexWrap: "wrap", justifyContent: "center" }}>
          <Link className="btn btn--primary btn--lg" href="/shop">Browse remedies</Link>
          <Link className="btn btn--ghost btn--lg" href="/">Back home</Link>
        </div>
      </div>
    </div>
  );
}
