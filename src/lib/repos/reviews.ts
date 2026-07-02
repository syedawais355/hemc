import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/http";
import type { Review } from "@/lib/types";

type Row = Omit<Review, "author_name"> & {
  profiles: { first_name: string; last_name: string } | null;
};

const map = (row: Row): Review => {
  const { profiles, ...rest } = row;
  const name = profiles ? `${profiles.first_name} ${profiles.last_name[0] ?? ""}.`.trim() : "HEMC customer";
  return { ...rest, author_name: name };
};

export async function listReviews(productId: string): Promise<Review[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("reviews")
    .select("*, profiles(first_name, last_name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw new ApiError(500, error.message);
  return (data as Row[]).map(map);
}

export async function upsertReview(input: {
  product_id: string;
  user_id: string;
  rating: number;
  title?: string | null;
  body?: string | null;
}): Promise<Review> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("reviews")
    .upsert(input, { onConflict: "product_id,user_id" })
    .select("*, profiles(first_name, last_name)")
    .single();
  if (error) throw new ApiError(400, error.message);
  return map(data as Row);
}

// Admin view: every review across all products, with product + author labels.
export async function listAllReviews(): Promise<(Review & { product_name: string })[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("reviews")
    .select("*, profiles(first_name, last_name), products(name)")
    .order("created_at", { ascending: false });
  if (error) throw new ApiError(500, error.message);
  return (data as (Row & { products: { name: string } | null })[]).map((row) => ({
    ...map(row),
    product_name: row.products?.name ?? "—",
  }));
}

export async function getReview(id: string): Promise<Review | null> {
  const db = createAdminClient();
  const { data } = await db.from("reviews").select("*").eq("id", id).maybeSingle();
  return (data as Review) ?? null;
}

export async function deleteReview(id: string): Promise<void> {
  const db = createAdminClient();
  const { error } = await db.from("reviews").delete().eq("id", id);
  if (error) throw new ApiError(400, error.message);
}
