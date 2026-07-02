import { handler, ok, fail } from "@/lib/http";
import { getProductBySlug } from "@/lib/repos/products";
import { listReviews } from "@/lib/repos/reviews";

export const GET = handler(async (_req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  const product = await getProductBySlug(slug);
  if (!product || !product.is_active) return fail(404, "Product not found");
  const reviews = await listReviews(product.id);
  return ok({ product, reviews });
});
