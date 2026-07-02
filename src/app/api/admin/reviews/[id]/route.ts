import { handler, noContent } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { deleteReview } from "@/lib/repos/reviews";

// Admins can remove any review/comment on any product.
export const DELETE = handler(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  await deleteReview(id);
  return noContent();
});
