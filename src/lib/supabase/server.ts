import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

// Auth/session client backed by request cookies. Used only to read the signed-in
// user and to manage the auth session — never for table access (RLS denies it).
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render — cookies are read-only here.
          // Session refresh still happens in middleware / route handlers.
        }
      },
    },
  });
}
