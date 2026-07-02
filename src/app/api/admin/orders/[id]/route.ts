import { handler, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/repos/orders";
import { readJson } from "@/lib/validate";

export const PATCH = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const b = await readJson<{ status?: unknown }>(req);
  await updateOrderStatus(id, String(b.status ?? ""));
  return ok({ id, status: b.status });
});
