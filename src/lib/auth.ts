import "server-only";
import { createAuthClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/http";
import type { Profile } from "@/lib/types";

export interface AuthContext {
  userId: string;
  email: string;
  profile: Profile;
}

// Resolves the signed-in user + profile, or null when anonymous.
export async function getAuth(): Promise<AuthContext | null> {
  const auth = await createAuthClient();
  const { data } = await auth.auth.getUser();
  if (!data.user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (!profile) return null;
  return { userId: data.user.id, email: data.user.email ?? "", profile: profile as Profile };
}

// Requires a signed-in, enabled account. Throws ApiError otherwise.
export async function requireUser(): Promise<AuthContext> {
  const ctx = await getAuth();
  if (!ctx) throw new ApiError(401, "You must be signed in");
  if (ctx.profile.is_disabled) throw new ApiError(403, "This account is disabled");
  return ctx;
}

export async function requireAdmin(): Promise<AuthContext> {
  const ctx = await requireUser();
  if (ctx.profile.role !== "admin") throw new ApiError(403, "Admins only");
  return ctx;
}
