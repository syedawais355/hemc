"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/client/store";
import { useToast } from "@/components/Toast";
import { Icon } from "@/components/Icon";
import { money } from "@/lib/format";
import { productImage } from "@/lib/brand";

export default function CartPage() {
  const { ready, user, cart, subtotal, cartCount, setQty, removeFromCart, checkout } = useStore();
  const toast = useToast();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);

  if (!ready) return <div className="container"><p className="loading">Loading your cart…</p></div>;

  if (!cart.length) {
    return (
      <div className="container">
        <div className="page-head"><span className="eyebrow">Cart</span><h1>Your cart</h1></div>
        <div className="empty">
          <span className="empty__ico"><Icon name="bag" size={28} /></span>
          <h3>Your cart is empty</h3>
          <p>Once you add remedies they&apos;ll show up here, ready for 2-hour delivery.</p>
          <Link className="btn btn--primary" href="/shop">Browse pharmacy</Link>
        </div>
      </div>
    );
  }

  const placeOrder = async () => {
    if (!user) { router.push("/login?next=/cart"); return; }
    setPlacing(true);
    try {
      await checkout();
      toast("Order placed — arriving in 2 hours");
      router.push("/account?tab=orders");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container">
      <div className="page-head"><span className="eyebrow">Cart · {cartCount} items</span><h1>Your cart</h1></div>
      <div className="cart">
        <div className="cart__items">
          {cart.map(({ product, quantity, product_id }) => product && (
            <div className="cart-row" key={product_id}>
              <Link className="cart-row__img" href={`/product/${product.slug}`}>
                {productImage(product.image_url) && <img src={productImage(product.image_url)!} alt={product.name} />}
              </Link>
              <div>
                <Link className="cart-row__name" href={`/product/${product.slug}`}>{product.name}</Link>
                <div className="cart-row__cat">{product.category_name} · {money(product.price)} each</div>
              </div>
              <div className="cart-row__ctl">
                <div className="qty">
                  <button onClick={() => setQty(product_id, quantity - 1)} aria-label="Decrease"><Icon name="minus" size={16} width={2.4} /></button>
                  <span className="qty__val">{quantity}</span>
                  <button onClick={() => setQty(product_id, quantity + 1)} aria-label="Increase"><Icon name="plus" size={16} width={2.4} /></button>
                </div>
                <span className="cart-row__price">{money(product.price * quantity)}</span>
                <button className="cart-row__remove" onClick={() => removeFromCart(product_id)} aria-label={`Remove ${product.name}`}>
                  <Icon name="trash" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="summary card">
          <h3>Summary</h3>
          <div className="summary__row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
          <div className="summary__row"><span>Delivery</span><strong>Free</strong></div>
          <div className="summary__row"><span>Est. tax</span><span>Calculated at checkout</span></div>
          <div className="summary__total"><span>Total</span><strong>{money(subtotal)}</strong></div>
          <button className="btn btn--primary btn--block btn--lg" onClick={placeOrder} disabled={placing}>
            {placing ? "Placing…" : user ? "Place order" : "Sign in to order"}
          </button>
          {!user && <p className="auth-alt center">You need an account to check out.</p>}
        </aside>
      </div>
    </div>
  );
}
