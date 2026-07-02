"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client/api";
import { guestCart, guestWishlist } from "@/lib/client/guest";
import type { CartLine, Product } from "@/lib/types";

interface SessionUser {
  id: string;
  email: string;
  role: "customer" | "admin";
  first_name: string;
}

interface StoreValue {
  ready: boolean;
  user: SessionUser | null;
  cart: CartLine[];
  wishlist: Product[];
  cartCount: number;
  subtotal: number;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  addToCart: (product: Product, qty?: number) => Promise<void>;
  setQty: (productId: string, qty: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  checkout: () => Promise<string>;
}

const StoreContext = createContext<StoreValue | null>(null);

const productsByIds = (ids: string[]) =>
  ids.length ? api.get<Product[]>(`/products?ids=${ids.join(",")}`) : Promise.resolve([]);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Build cart lines from guest storage by hydrating product details.
  const hydrateGuest = useCallback(async () => {
    const lines = guestCart.all();
    const products = await productsByIds(lines.map((l) => l.product_id));
    const byId = new Map(products.map((p) => [p.id, p]));
    setCart(lines.filter((l) => byId.has(l.product_id)).map((l) => ({ ...l, product: byId.get(l.product_id)! })));
    setWishlist(await productsByIds(guestWishlist.all()));
  }, []);

  const loadAccount = useCallback(async () => {
    const [c, w] = await Promise.all([
      api.get<CartLine[]>("/cart"),
      api.get<Product[]>("/wishlist"),
    ]);
    setCart(c);
    setWishlist(w);
  }, []);

  // Merge any guest data into the account, then load the server state.
  const syncOnLogin = useCallback(async () => {
    const lines = guestCart.all();
    const wish = guestWishlist.all();
    if (lines.length) await api.post("/cart/merge", { items: lines });
    if (wish.length) await api.post("/wishlist", { merge: wish });
    guestCart.clear();
    guestWishlist.clear();
    await loadAccount();
  }, [loadAccount]);

  const bootstrap = useCallback(async () => {
    const { user: u } = await api.get<{ user: SessionUser | null }>("/auth/me");
    setUser(u);
    if (u) await syncOnLogin();
    else await hydrateGuest();
    setReady(true);
  }, [syncOnLogin, hydrateGuest]);

  useEffect(() => {
    bootstrap().catch(() => setReady(true));
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    await api.post("/auth/login", { email, password });
    const { user: u } = await api.get<{ user: SessionUser | null }>("/auth/me");
    setUser(u);
    await syncOnLogin();
  }, [syncOnLogin]);

  const signup = useCallback(async (payload: Record<string, unknown>) => {
    await api.post("/auth/signup", payload);
    const { user: u } = await api.get<{ user: SessionUser | null }>("/auth/me");
    setUser(u);
    await syncOnLogin();
  }, [syncOnLogin]);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setUser(null);
    await hydrateGuest();
  }, [hydrateGuest]);

  const addToCart = useCallback(async (product: Product, qty = 1) => {
    if (user) {
      setCart(await api.post<CartLine[]>("/cart", { product_id: product.id, quantity: qty }));
    } else {
      guestCart.add(product.id, qty);
      setCart((prev) => {
        const existing = prev.find((l) => l.product_id === product.id);
        if (existing) return prev.map((l) => l.product_id === product.id ? { ...l, quantity: l.quantity + qty } : l);
        return [...prev, { product_id: product.id, quantity: qty, product }];
      });
    }
  }, [user]);

  const setQty = useCallback(async (productId: string, qty: number) => {
    if (user) {
      setCart(await api.patch<CartLine[]>("/cart", { product_id: productId, quantity: qty }));
    } else {
      guestCart.setQty(productId, qty);
      setCart((prev) =>
        qty <= 0
          ? prev.filter((l) => l.product_id !== productId)
          : prev.map((l) => l.product_id === productId ? { ...l, quantity: qty } : l),
      );
    }
  }, [user]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (user) {
      await api.del(`/cart?product_id=${productId}`);
      setCart((prev) => prev.filter((l) => l.product_id !== productId));
    } else {
      guestCart.remove(productId);
      setCart((prev) => prev.filter((l) => l.product_id !== productId));
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    if (user) await api.del("/cart");
    else guestCart.clear();
    setCart([]);
  }, [user]);

  const toggleWishlist = useCallback(async (product: Product) => {
    const on = wishlist.some((p) => p.id === product.id);
    if (user) {
      if (on) { await api.del(`/wishlist?product_id=${product.id}`); setWishlist((p) => p.filter((x) => x.id !== product.id)); }
      else setWishlist(await api.post<Product[]>("/wishlist", { product_id: product.id }));
    } else {
      guestWishlist.toggle(product.id);
      setWishlist((p) => on ? p.filter((x) => x.id !== product.id) : [...p, product]);
    }
  }, [user, wishlist]);

  const checkout = useCallback(async () => {
    const { id } = await api.post<{ id: string }>("/orders");
    setCart([]);
    return id;
  }, []);

  const value = useMemo<StoreValue>(() => ({
    ready, user, cart, wishlist,
    cartCount: cart.reduce((n, l) => n + l.quantity, 0),
    subtotal: cart.reduce((n, l) => n + (l.product?.price ?? 0) * l.quantity, 0),
    login, signup, logout, addToCart, setQty, removeFromCart, clearCart,
    toggleWishlist, isWishlisted: (id) => wishlist.some((p) => p.id === id), checkout,
  }), [ready, user, cart, wishlist, login, signup, logout, addToCart, setQty, removeFromCart, clearCart, toggleWishlist, checkout]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
