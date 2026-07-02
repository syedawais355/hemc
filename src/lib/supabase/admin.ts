import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Service-role client. Bypasses RLS and is the ONLY way the app reaches the
// database. Never import this into a Client Component or expose its key.
export function createAdminClient() {
  return createClient(env.supabaseUrl, env.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
