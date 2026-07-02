import { handler, noContent } from "@/lib/http";
import { createAuthClient } from "@/lib/supabase/server";

export const POST = handler(async () => {
  const auth = await createAuthClient();
  await auth.auth.signOut();
  return noContent();
});
