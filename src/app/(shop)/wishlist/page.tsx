"use client";

import Link from "next/link";
import { useStore } from "@/lib/client/store";
import { ProductCard } from "@/components/ProductCard";
import { Icon } from "@/components/Icon";

export default function WishlistPage() {
  const { ready, wishlist } = useStore();

  return (
    <div className="container">
      <div className="page-head"><span className="eyebrow">Saved</span><h1>Your wishlist</h1></div>
      {!ready ? (
        <p className="loading">Loading…</p>
      ) : wishlist.length ? (
        <div className="grid grid-4">{wishlist.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      ) : (
        <div className="empty">
          <span className="empty__ico"><Icon name="heart" size={28} /></span>
          <h3>Nothing saved yet</h3>
          <p>Tap the heart on any product to keep it here for later.</p>
          <Link className="btn btn--primary" href="/shop">Browse pharmacy</Link>
        </div>
      )}
    </div>
  );
}
