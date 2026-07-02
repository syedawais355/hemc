import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/http";
import type { Product } from "@/lib/types";

const SELECT = "*, categories(name)";

type Row = Omit<Product, "category_name"> & { categories: { name: string } | null };

const map = (row: Row): Product => {
  const { categories, ...rest } = row;
  return { ...rest, category_name: categories?.name ?? null };
};

export interface ProductFilter {
  categorySlug?: string;
  tag?: string;
  search?: string;
  sort?: "popular" | "price-asc" | "price-desc" | "name";
  includeInactive?: boolean;
}

export async function listProducts(filter: ProductFilter = {}): Promise<Product[]> {
  const db = createAdminClient();
  let q = db.from("products").select(filter.includeInactive ? SELECT : SELECT);

  if (!filter.includeInactive) q = q.eq("is_active", true);
  if (filter.tag) q = q.eq("tag", filter.tag);
  if (filter.search) q = q.ilike("name", `%${filter.search}%`);

  if (filter.categorySlug) {
    const { data: cat } = await db
      .from("categories")
      .select("id")
      .eq("slug", filter.categorySlug)
      .single();
    if (!cat) return [];
    q = q.eq("category_id", cat.id);
  }

  switch (filter.sort) {
    case "price-asc": q = q.order("price", { ascending: true }); break;
    case "price-desc": q = q.order("price", { ascending: false }); break;
    case "name": q = q.order("name", { ascending: true }); break;
    default: q = q.order("review_count", { ascending: false });
  }

  const { data, error } = await q;
  if (error) throw new ApiError(500, error.message);
  return (data as Row[]).map(map);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = createAdminClient();
  const { data } = await db.from("products").select(SELECT).eq("slug", slug).maybeSingle();
  return data ? map(data as Row) : null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const db = createAdminClient();
  const { data, error } = await db.from("products").select(SELECT).in("id", ids);
  if (error) throw new ApiError(500, error.message);
  return (data as Row[]).map(map);
}

export interface ProductInput {
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  uom: string;
  image_url?: string | null;
  category_id?: string | null;
  tag?: string | null;
  is_active?: boolean;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const db = createAdminClient();
  const { data, error } = await db.from("products").insert(input).select(SELECT).single();
  if (error) throw new ApiError(400, error.message);
  return map(data as Row);
}

export async function updateProduct(id: string, patch: Partial<ProductInput>): Promise<Product> {
  const db = createAdminClient();
  const { data, error } = await db.from("products").update(patch).eq("id", id).select(SELECT).single();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Product not found");
  return map(data as Row);
}

export async function deleteProduct(id: string): Promise<void> {
  const db = createAdminClient();
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) throw new ApiError(400, error.message);
}
