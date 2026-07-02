import { handler, ok, noContent, fail } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { setUserDisabled, deleteUser } from "@/lib/repos/users";
import { readJson } from "@/lib/validate";

export const PATCH = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  if (id === admin.userId) return fail(400, "You cannot disable your own account");
  const b = await readJson<{ is_disabled?: unknown }>(req);
  await setUserDisabled(id, Boolean(b.is_disabled));
  return ok({ id, is_disabled: Boolean(b.is_disabled) });
});

export const DELETE = handler(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  if (id === admin.userId) return fail(400, "You cannot delete your own account");
  await deleteUser(id);
  return noContent();
});
