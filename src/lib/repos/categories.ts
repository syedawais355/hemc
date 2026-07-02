import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/http";
import type { Category } from "@/lib/types";

export async function listCategories(): Promise<Category[]> {
  const db = createAdminClient();
  const { data, error } = await db.from("categories").select("*").order("name");
  if (error) throw new ApiError(500, error.message);
  return data as Category[];
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string | null;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const db = createAdminClient();
  const { data, error } = await db.from("categories").insert(input).select("*").single();
  if (error) throw new ApiError(400, error.message);
  return data as Category;
}

export async function updateCategory(id: string, patch: Partial<CategoryInput>): Promise<Category> {
  const db = createAdminClient();
  const { data, error } = await db.from("categories").update(patch).eq("id", id).select("*").single();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Category not found");
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const db = createAdminClient();
  const { error } = await db.from("categories").delete().eq("id", id);
  if (error) throw new ApiError(400, error.message);
}
