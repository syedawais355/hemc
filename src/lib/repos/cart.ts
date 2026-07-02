import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/http";
import { getProductsByIds } from "@/lib/repos/products";
import type { CartLine } from "@/lib/types";

// Returns the user's cart lines hydrated with their product records.
export async function getCart(userId: string): Promise<CartLine[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("cart_items")
    .select("product_id, quantity")
    .eq("user_id", userId);
  if (error) throw new ApiError(500, error.message);

  const lines = data as { product_id: string; quantity: number }[];
  const products = await getProductsByIds(lines.map((l) => l.product_id));
  const byId = new Map(products.map((p) => [p.id, p]));
  return lines
    .filter((l) => byId.has(l.product_id))
    .map((l) => ({ ...l, product: byId.get(l.product_id)! }));
}

export async function setCartItem(userId: string, productId: string, quantity: number): Promise<void> {
  const db = createAdminClient();
  if (quantity <= 0) {
    await removeCartItem(userId, productId);
    return;
  }
  const { error } = await db
    .from("cart_items")
    .upsert({ user_id: userId, product_id: productId, quantity }, { onConflict: "user_id,product_id" });
  if (error) throw new ApiError(400, error.message);
}

// Adds quantity on top of the existing line (used by "add to cart").
export async function addToCart(userId: string, productId: string, quantity: number): Promise<void> {
  const db = createAdminClient();
  const { data } = await db
    .from("cart_items")
    .select("quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();
  const next = (data?.quantity ?? 0) + quantity;
  await setCartItem(userId, productId, next);
}

export async function removeCartItem(userId: string, productId: string): Promise<void> {
  const db = createAdminClient();
  const { error } = await db
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
  if (error) throw new ApiError(400, error.message);
}

export async function clearCart(userId: string): Promise<void> {
  const db = createAdminClient();
  const { error } = await db.from("cart_items").delete().eq("user_id", userId);
  if (error) throw new ApiError(400, error.message);
}

// Merges a guest cart (from browser storage) into the DB cart on sign-in,
// summing quantities for products already present.
export async function mergeCart(
  userId: string,
  guest: { product_id: string; quantity: number }[],
): Promise<void> {
  for (const line of guest) {
    if (line.quantity > 0) await addToCart(userId, line.product_id, line.quantity);
  }
}
