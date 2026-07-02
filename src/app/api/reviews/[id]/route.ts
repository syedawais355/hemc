import { handler, noContent, fail } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { getReview, deleteReview } from "@/lib/repos/reviews";

// A user may delete their own review; admins may delete any (see admin route).
export const DELETE = handler(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const { userId, profile } = await requireUser();
  const review = await getReview(id);
  if (!review) return fail(404, "Review not found");
  if (review.user_id !== userId && profile.role !== "admin") return fail(403, "Not allowed");
  await deleteReview(id);
  return noContent();
});
