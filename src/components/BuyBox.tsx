"use client";

import { useState } from "react";
import { useStore } from "@/lib/client/store";
import { useToast } from "@/components/Toast";
import { Icon } from "@/components/Icon";
import type { Product } from "@/lib/types";

export function BuyBox({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const wished = isWishlisted(product.id);

  const add = async () => {
    await addToCart(product, qty);
    toast(`${product.name} ×${qty} added to cart`);
  };

  return (
    <>
      <div className="detail__buy">
        <div className="qty">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty === 1} aria-label="Decrease">
            <Icon name="minus" size={16} width={2.4} />
          </button>
          <span className="qty__val">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Increase">
            <Icon name="plus" size={16} width={2.4} />
          </button>
        </div>
        <button className="btn btn--primary btn--lg" onClick={add}>Add to cart</button>
        <button
          className="iconbtn"
          onClick={async () => { await toggleWishlist(product); toast(wished ? "Removed from wishlist" : "Saved to wishlist"); }}
          aria-label="Toggle wishlist" aria-pressed={wished}
        >
          <Icon name="heart" size={18} fill={wished ? "currentColor" : "none"} />
        </button>
      </div>
    </>
  );
}
