// Guest cart/wishlist persistence in browser storage. Used while signed out and
// merged into the account on sign-in.
const CART_KEY = "verda.cart";
const WISH_KEY = "verda.wishlist";

export interface GuestLine {
  product_id: string;
  quantity: number;
}

const read = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
};

export const guestCart = {
  all: () => read<GuestLine[]>(CART_KEY, []),
  set: (lines: GuestLine[]) => write(CART_KEY, lines),
  clear: () => write(CART_KEY, []),
  add(productId: string, quantity: number) {
    const lines = guestCart.all();
    const existing = lines.find((l) => l.product_id === productId);
    if (existing) existing.quantity += quantity;
    else lines.push({ product_id: productId, quantity });
    guestCart.set(lines);
  },
  setQty(productId: string, quantity: number) {
    let lines = guestCart.all();
    if (quantity <= 0) lines = lines.filter((l) => l.product_id !== productId);
    else {
      const line = lines.find((l) => l.product_id === productId);
      if (line) line.quantity = quantity;
      else lines.push({ product_id: productId, quantity });
    }
    guestCart.set(lines);
  },
  remove(productId: string) {
    guestCart.set(guestCart.all().filter((l) => l.product_id !== productId));
  },
};

export const guestWishlist = {
  all: () => read<string[]>(WISH_KEY, []),
  set: (ids: string[]) => write(WISH_KEY, ids),
  clear: () => write(WISH_KEY, []),
  toggle(productId: string) {
    const ids = guestWishlist.all();
    const next = ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId];
    guestWishlist.set(next);
    return next;
  },
};
