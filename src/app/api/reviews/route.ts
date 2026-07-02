import { handler, ok, created } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { listReviews, upsertReview } from "@/lib/repos/reviews";
import { readJson, uuid, num, optionalStr } from "@/lib/validate";

export const GET = handler(async (req: Request) => {
  const productId = uuid(new URL(req.url).searchParams.get("product_id"), "product_id");
  return ok(await listReviews(productId));
});

export const POST = handler(async (req: Request) => {
  const { userId } = await requireUser();
  const body = await readJson(req);
  const review = await upsertReview({
    product_id: uuid(body.product_id, "product_id"),
    user_id: userId,
    rating: num(body.rating, "rating", { min: 1, max: 5 }),
    title: optionalStr(body.title, 120),
    body: optionalStr(body.body, 2000),
  });
  return created(review);
});
