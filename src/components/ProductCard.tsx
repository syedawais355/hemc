"use client";

import Link from "next/link";
import { useStore } from "@/lib/client/store";
import { useToast } from "@/components/Toast";
import { Icon } from "@/components/Icon";
import { money } from "@/lib/format";
import { productImage } from "@/lib/brand";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const toast = useToast();
  const wished = isWishlisted(product.id);

  const onAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addToCart(product, 1);
    toast(`${product.name} added to cart`);
  };

  const onWish = async (e: React.MouseEvent) => {
    e.preventDefault();
    await toggleWishlist(product);
    toast(wished ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <article className="product">
      <Link className="product__media" href={`/product/${product.slug}`} aria-label={product.name}>
        {productImage(product.image_url) && <img src={productImage(product.image_url)!} alt={product.name} loading="lazy" className="is-loaded" />}
        {product.tag && <span className="badge badge--float">{product.tag}</span>}
        <button
          className="wish-btn"
          onClick={onWish}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={wished}
        >
          <Icon name="heart" size={17} fill={wished ? "currentColor" : "none"} />
        </button>
      </Link>
      <div className="product__body">
        <Link className="product__name" href={`/product/${product.slug}`}>{product.name}</Link>
        <span className="product__cat">{product.category_name ?? product.uom}</span>
        <div className="product__foot">
          <span className="product__price">{money(product.price)}</span>
          <button className="add-btn" onClick={onAdd} aria-label={`Add ${product.name} to cart`}>
            <Icon name="plus" size={16} width={2.4} />
          </button>
        </div>
      </div>
    </article>
  );
}
