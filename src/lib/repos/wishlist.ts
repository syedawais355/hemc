import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/http";
import { getProductsByIds } from "@/lib/repos/products";
import type { Product } from "@/lib/types";

export async function getWishlist(userId: string): Promise<Product[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", userId);
  if (error) throw new ApiError(500, error.message);
  return getProductsByIds((data as { product_id: string }[]).map((r) => r.product_id));
}

export async function addToWishlist(userId: string, productId: string): Promise<void> {
  const db = createAdminClient();
  const { error } = await db
    .from("wishlist_items")
    .upsert({ user_id: userId, product_id: productId }, { onConflict: "user_id,product_id" });
  if (error) throw new ApiError(400, error.message);
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  const db = createAdminClient();
  const { error } = await db
    .from("wishlist_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
  if (error) throw new ApiError(400, error.message);
}

export async function mergeWishlist(userId: string, productIds: string[]): Promise<void> {
  for (const id of productIds) await addToWishlist(userId, id);
}
