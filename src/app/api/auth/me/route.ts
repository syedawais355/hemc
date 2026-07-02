import { handler, ok } from "@/lib/http";
import { getAuth } from "@/lib/auth";

export const GET = handler(async () => {
  const ctx = await getAuth();
  if (!ctx) return ok({ user: null });
  return ok({
    user: { id: ctx.userId, email: ctx.email, role: ctx.profile.role, first_name: ctx.profile.first_name },
  });
});
