import { handler, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { listAllReviews } from "@/lib/repos/reviews";

export const GET = handler(async () => {
  await requireAdmin();
  return ok(await listAllReviews());
});
