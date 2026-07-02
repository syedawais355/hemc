import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/http";
import type { Profile } from "@/lib/types";

export interface AdminUser extends Profile {
  email: string | null;
  created_at: string;
}

// Lists profiles joined with their auth email (admin view).
export async function listUsers(): Promise<AdminUser[]> {
  const db = createAdminClient();
  const { data: profiles, error } = await db
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new ApiError(500, error.message);

  const { data: authList } = await db.auth.admin.listUsers({ perPage: 1000 });
  const emails = new Map(authList.users.map((u) => [u.id, u.email ?? null]));

  return (profiles as (Profile & { created_at: string })[]).map((p) => ({
    ...p,
    email: emails.get(p.id) ?? null,
  }));
}

export async function setUserDisabled(userId: string, disabled: boolean): Promise<void> {
  const db = createAdminClient();
  const { error } = await db.from("profiles").update({ is_disabled: disabled }).eq("id", userId);
  if (error) throw new ApiError(400, error.message);
  // Also ban at the auth layer so existing sessions can't act.
  await db.auth.admin.updateUserById(userId, { ban_duration: disabled ? "876000h" : "none" });
}

export async function deleteUser(userId: string): Promise<void> {
  const db = createAdminClient();
  // Cascades to profile, cart, wishlist, reviews, orders via FK on delete cascade.
  const { error } = await db.auth.admin.deleteUser(userId);
  if (error) throw new ApiError(400, error.message);
}
