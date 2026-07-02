import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/http";
import type { Profile } from "@/lib/types";

export interface ProfileInput {
  first_name: string;
  last_name: string;
  phone?: string | null;
  address1?: string | null;
  address2?: string | null;
  country?: string | null;
  state?: string | null;
  postal_code?: string | null;
  date_of_birth?: string | null;
}

export async function createProfile(userId: string, input: ProfileInput): Promise<Profile> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("profiles")
    .insert({ id: userId, ...input })
    .select("*")
    .single();
  if (error) throw new ApiError(400, error.message);
  return data as Profile;
}

export async function updateProfile(userId: string, patch: Partial<ProfileInput>): Promise<Profile> {
  const db = createAdminClient();
  const { data, error } = await db.from("profiles").update(patch).eq("id", userId).select("*").single();
  if (error) throw new ApiError(400, error.message);
  return data as Profile;
}
