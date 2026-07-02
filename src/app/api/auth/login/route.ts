import { handler, ok, fail } from "@/lib/http";
import { createAuthClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { readJson, email as parseEmail, str } from "@/lib/validate";

export const POST = handler(async (req: Request) => {
  const b = await readJson(req);
  const email = parseEmail(b.email);
  const password = str(b.password, "Password", { min: 1, max: 100 });

  const auth = await createAuthClient();
  const { data, error } = await auth.auth.signInWithPassword({ email, password });
  if (error || !data.user) return fail(401, "Invalid email or password");

  // Block disabled accounts even if credentials are valid.
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_disabled, role")
    .eq("id", data.user.id)
    .single();
  if (profile?.is_disabled) {
    await auth.auth.signOut();
    return fail(403, "This account is disabled");
  }

  return ok({ id: data.user.id, email, role: profile?.role ?? "customer" });
});
